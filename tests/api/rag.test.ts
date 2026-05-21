import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchChunks, type MatchedChunk } from '@/lib/db/match'
import { synthesize } from '@/lib/ai/synthesize'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

vi.mock('@/lib/db/match', () => ({ matchChunks: vi.fn() }))
vi.mock('@/lib/ai/synthesize', () => ({ synthesize: vi.fn() }))
vi.mock('@/lib/supabase/service', () => ({ createSupabaseServiceClient: vi.fn() }))

import { POST } from '@/app/api/ai/rag/route'

function mockInsertChain() {
  const insert = vi.fn().mockResolvedValue({ data: null, error: null })
  const from = vi.fn().mockReturnValue({ insert })
  vi.mocked(createSupabaseServiceClient).mockReturnValue({ from } as never)
  return { from, insert }
}

function makeRequest(body: unknown): Request {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }
  return new Request('http://localhost/api/ai/rag', init)
}

type SseEvent =
  | { type: 'token'; text: string }
  | { type: 'meta'; sources: Array<{ source: string; title: string; score: number }>; refused: boolean }
  | { type: 'done' }
  | { type: 'error' }

interface ParsedSse {
  events: SseEvent[]
  tokens: string[]
  meta: Extract<SseEvent, { type: 'meta' }> | null
  done: boolean
}

async function parseSseBody(res: Response): Promise<ParsedSse> {
  const text = await res.text()
  const events: SseEvent[] = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = line.slice('data: '.length).trim()
    if (!payload) continue
    events.push(JSON.parse(payload) as SseEvent)
  }
  const tokens = events.filter((e): e is Extract<SseEvent, { type: 'token' }> => e.type === 'token').map((e) => e.text)
  const meta = events.find((e): e is Extract<SseEvent, { type: 'meta' }> => e.type === 'meta') ?? null
  const done = events.some((e) => e.type === 'done')
  // Flush any microtasks queued by stream finally (telemetry insert)
  await new Promise((resolve) => setTimeout(resolve, 0))
  return { events, tokens, meta, done }
}

async function* yieldTokens(tokens: string[]): AsyncGenerator<string, void, unknown> {
  for (const t of tokens) yield t
}

describe('POST /api/ai/rag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when request body is not valid JSON', async () => {
    mockInsertChain()
    const res = await POST(makeRequest('not json at all'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid request' })
  })

  it('returns 400 when query is too short (< 3 chars)', async () => {
    mockInsertChain()
    const res = await POST(makeRequest({ query: 'ab' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid request' })
  })

  it('streams 200 SSE with token + meta + done events on happy path; logs telemetry', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'project', chunkId: 'p1', title: 'Arabic Sentiment Analysis', content: 'AraBERT for Gulf dialects.', score: 0.527 },
      { source: 'bio', chunkId: 'b1', title: 'GenAI / LLMs', content: 'fine-tuning expertise', score: 0.433 },
    ]
    vi.mocked(matchChunks).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['Arabic ', 'Sentiment ', 'Analysis (from project: Arabic Sentiment Analysis).']))
    const { from, insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'arabic NLP' }))

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/event-stream')

    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toEqual(['Arabic ', 'Sentiment ', 'Analysis (from project: Arabic Sentiment Analysis).'])
    expect(meta).toMatchObject({
      type: 'meta',
      refused: false,
      sources: [
        { source: 'project', title: 'Arabic Sentiment Analysis', score: 0.527 },
        { source: 'bio', title: 'GenAI / LLMs', score: 0.433 },
      ],
    })
    expect(done).toBe(true)
    expect(synthesize).toHaveBeenCalledWith('arabic NLP', chunks)
    expect(from).toHaveBeenCalledWith('rag_queries')
    expect(insert).toHaveBeenCalledTimes(1)
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'arabic NLP',
        retrieved_ids: ['p1', 'b1'],
        response: 'Arabic Sentiment Analysis (from project: Arabic Sentiment Analysis).',
        model: 'claude-sonnet-4-6',
        refused: false,
        relevance_top_score: 0.527,
        latency_ms: expect.any(Number),
      })
    )
  })

  it('streams refusal (canned string as single token) when matchChunks returns empty; never calls synthesize', async () => {
    vi.mocked(matchChunks).mockResolvedValue([])
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'random nonsense query that matches nothing' }))

    expect(res.status).toBe(200)
    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatch(/specific information/i)
    expect(meta).toMatchObject({ type: 'meta', refused: true, sources: [] })
    expect(done).toBe(true)
    expect(synthesize).not.toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'random nonsense query that matches nothing',
        refused: true,
        response: expect.stringMatching(/specific information/i),
        retrieved_ids: [],
        relevance_top_score: null,
      })
    )
  })

  it('streams refusal when top chunk score is below threshold (0.25); still logs retrieved ids', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'bio', chunkId: 'b1', title: 'About', content: 'x', score: 0.18 },
    ]
    vi.mocked(matchChunks).mockResolvedValue(chunks)
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'fictional query about cats and dogs' }))

    expect(res.status).toBe(200)
    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatch(/specific information/i)
    expect(meta).toMatchObject({ type: 'meta', refused: true })
    expect(done).toBe(true)
    expect(synthesize).not.toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        refused: true,
        retrieved_ids: ['b1'],
        relevance_top_score: 0.18,
      })
    )
  })
})
