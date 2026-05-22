import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchChunksMulti, type MatchedChunk } from '@/lib/db/match'
import { synthesize, expandQuery } from '@/lib/ai/synthesize'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import * as answerCache from '@/lib/cache/answer-cache'

vi.mock('@/lib/db/match', () => ({
  matchChunks: vi.fn(),
  matchChunksMulti: vi.fn(),
}))
vi.mock('@/lib/ai/synthesize', () => ({
  synthesize: vi.fn(),
  expandQuery: vi.fn(),
}))
vi.mock('@/lib/supabase/service', () => ({ createSupabaseServiceClient: vi.fn() }))
vi.mock('@/lib/cache/answer-cache', () => ({
  buildKey: vi.fn((q: string, lastUserTurn?: string) => `k:${q}|${lastUserTurn ?? ''}`),
  get: vi.fn(() => null),
  set: vi.fn(),
}))

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
    // Default cache.get() to null so existing tests treat every call as a miss.
    // Individual tests override this for hit-path scenarios.
    vi.mocked(answerCache.get).mockReturnValue(null)
    // Default expansion to single-query identity. Preserves single-call retrieval
    // behavior for tests that don't customize expansion explicitly.
    vi.mocked(expandQuery).mockImplementation(async (q: string) => [q])
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
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
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
    expect(synthesize).toHaveBeenCalledWith('arabic NLP', chunks, [], expect.any(Object))
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

  it('streams REFUSAL_EMPTY copy (Voyage-failure path) when matchChunksMulti returns no chunks', async () => {
    vi.mocked(matchChunksMulti).mockResolvedValue([])
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'random nonsense query that matches nothing' }))

    expect(res.status).toBe(200)
    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatch(/portfolio.*try again/i)
    expect(meta).toMatchObject({ type: 'meta', refused: true, sources: [] })
    expect(done).toBe(true)
    expect(synthesize).not.toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'random nonsense query that matches nothing',
        refused: true,
        response: expect.stringMatching(/portfolio.*try again/i),
        retrieved_ids: [],
        relevance_top_score: null,
      })
    )
  })

  it('does NOT refuse on low-score retrieval; passes chunks to synthesize (Slice 4.2g v2 — score gate removed)', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'bio', chunkId: 'b1', title: 'About', content: 'x', score: 0.18 },
    ]
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['answer.']))
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'edge-case query that produces a weak top match' }))

    expect(res.status).toBe(200)
    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toEqual(['answer.'])
    expect(meta).toMatchObject({ type: 'meta', refused: false })
    expect(done).toBe(true)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        refused: false,
        retrieved_ids: ['b1'],
        relevance_top_score: 0.18,
        response: 'answer.',
      })
    )
  })

  it('passes history array to synthesize when provided in body', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'resume', chunkId: 'r1', title: 'GMU', content: 'studied data analytics', score: 0.45 },
    ]
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['ok.']))
    mockInsertChain()

    const history = [
      { role: 'user' as const, text: 'What did you do at Scale AI?' },
      { role: 'assistant' as const, text: 'At Scale AI I worked on RLHF (from my Scale AI work).' },
    ]
    const res = await POST(makeRequest({ query: 'What about my education there?', history }))

    expect(res.status).toBe(200)
    await parseSseBody(res)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(synthesize).toHaveBeenCalledWith('What about my education there?', chunks, history, expect.any(Object))
  })

  it('clamps history to last 6 turns before passing to synthesize', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'bio', chunkId: 'b1', title: 'About', content: 'x', score: 0.5 },
    ]
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['ok.']))
    mockInsertChain()

    const longHistory = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      text: `turn ${i}`,
    }))
    const res = await POST(makeRequest({ query: 'another question', history: longHistory }))

    expect(res.status).toBe(200)
    await parseSseBody(res)
    const callArgs = vi.mocked(synthesize).mock.calls[0]
    expect(callArgs).toBeDefined()
    const passedHistory = callArgs![2] as Array<{ role: string; text: string }>
    expect(passedHistory).toHaveLength(6)
    expect(passedHistory[0]?.text).toBe('turn 14')
    expect(passedHistory[5]?.text).toBe('turn 19')
  })

  it('returns 400 when history contains an invalid role', async () => {
    mockInsertChain()
    const res = await POST(
      makeRequest({
        query: 'valid query',
        history: [{ role: 'system', text: 'malicious' }],
      })
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid request' })
  })

  it('logs cache_hit:none on cache miss; populates answer cache after successful synthesize', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'project', chunkId: 'p1', title: 'Arabic Sentiment Analysis', content: 'AraBERT for Gulf dialects.', score: 0.527 },
    ]
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['answer text.']))
    vi.mocked(answerCache.get).mockReturnValue(null) // explicit miss
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'arabic NLP' }))

    expect(res.status).toBe(200)
    await parseSseBody(res)

    // Real path ran end-to-end
    expect(matchChunksMulti).toHaveBeenCalledTimes(1)
    expect(synthesize).toHaveBeenCalledTimes(1)

    // Cache lookup attempted with the built key
    expect(answerCache.buildKey).toHaveBeenCalledWith('arabic NLP', undefined)
    expect(answerCache.get).toHaveBeenCalledTimes(1)

    // Cache populated on success
    expect(answerCache.set).toHaveBeenCalledTimes(1)
    const setCall = vi.mocked(answerCache.set).mock.calls[0]
    expect(setCall?.[1]).toBe('answer text.')
    expect(setCall?.[2]).toEqual([
      expect.objectContaining({ source: 'project', title: 'Arabic Sentiment Analysis', score: 0.527, chunkId: 'p1' }),
    ])

    // Telemetry logs cache_hit:'none' (no prompt-cache info from mocked synthesize)
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'arabic NLP',
        cache_hit: 'none',
        refused: false,
      })
    )
  })

  it('returns cached answer (skips matchChunksMulti + synthesize) and logs cache_hit:answer on cache hit', async () => {
    const cachedSources = [
      { source: 'project', title: 'Arabic Sentiment Analysis', score: 0.527, chunkId: 'p1' },
      { source: 'bio', title: 'GenAI / LLMs', score: 0.433, chunkId: 'b1' },
    ]
    vi.mocked(answerCache.get).mockReturnValue({
      answer: 'cached answer body.',
      sources: cachedSources,
      expiresAt: Date.now() + 60_000,
    })
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'arabic NLP' }))

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/event-stream')

    const { tokens, meta, done } = await parseSseBody(res)
    expect(tokens).toEqual(['cached answer body.'])
    expect(meta).toMatchObject({
      type: 'meta',
      refused: false,
      sources: [
        { source: 'project', title: 'Arabic Sentiment Analysis', score: 0.527 },
        { source: 'bio', title: 'GenAI / LLMs', score: 0.433 },
      ],
    })
    expect(done).toBe(true)

    // Retrieval + synthesis short-circuited
    expect(matchChunksMulti).not.toHaveBeenCalled()
    expect(synthesize).not.toHaveBeenCalled()

    // Cache not re-populated on a hit
    expect(answerCache.set).not.toHaveBeenCalled()

    // Telemetry logs cache_hit:'answer'
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'arabic NLP',
        cache_hit: 'answer',
        refused: false,
        response: 'cached answer body.',
        retrieved_ids: ['p1', 'b1'],
        relevance_top_score: 0.527,
      })
    )
  })

  it('passes all expandQuery rewrites to matchChunksMulti (multi-query retrieval)', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'project', chunkId: 'p1', title: 'Scale AI', content: 'RLHF Team Lead.', score: 0.6 },
      { source: 'bio', chunkId: 'b1', title: 'About', content: 'Three years experience.', score: 0.5 },
    ]
    vi.mocked(expandQuery).mockResolvedValue([
      'are you a senior or junior?',
      'Prajna years experience role titles team lead',
      'Prajna current job seniority engineer',
    ])
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['Three plus years.']))
    const { insert } = mockInsertChain()

    const res = await POST(makeRequest({ query: 'are you a senior or junior?' }))

    expect(res.status).toBe(200)
    await parseSseBody(res)

    expect(expandQuery).toHaveBeenCalledTimes(1)
    expect(expandQuery).toHaveBeenCalledWith('are you a senior or junior?')

    expect(matchChunksMulti).toHaveBeenCalledTimes(1)
    expect(matchChunksMulti).toHaveBeenCalledWith(
      [
        'are you a senior or junior?',
        'Prajna years experience role titles team lead',
        'Prajna current job seniority engineer',
      ],
      3,
      5,
    )
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        relevance_top_score: 0.6,
      })
    )
  })

  it('preserves single-call retrieval when expandQuery returns only the original query (Haiku-error fallback path)', async () => {
    const chunks: MatchedChunk[] = [
      { source: 'bio', chunkId: 'b1', title: 'About', content: 'x', score: 0.5 },
    ]
    vi.mocked(expandQuery).mockResolvedValue(['original only'])
    vi.mocked(matchChunksMulti).mockResolvedValue(chunks)
    vi.mocked(synthesize).mockImplementation(() => yieldTokens(['ok.']))
    mockInsertChain()

    const res = await POST(makeRequest({ query: 'original only' }))

    expect(res.status).toBe(200)
    await parseSseBody(res)

    expect(expandQuery).toHaveBeenCalledTimes(1)
    expect(matchChunksMulti).toHaveBeenCalledWith(['original only'], 3, 5)
  })

  it('skips expandQuery entirely on cache hit (zero Haiku spend on repeats)', async () => {
    vi.mocked(answerCache.get).mockReturnValue({
      answer: 'cached.',
      sources: [{ source: 'bio', title: 'About', score: 0.5, chunkId: 'b1' }],
      expiresAt: Date.now() + 60_000,
    })
    // Even if expandQuery WOULD produce nontrivial rewrites, the cache short-circuit
    // must run BEFORE expansion is invoked.
    vi.mocked(expandQuery).mockResolvedValue(['original', 'rewrite 1', 'rewrite 2'])
    mockInsertChain()

    const res = await POST(makeRequest({ query: 'cached query' }))

    expect(res.status).toBe(200)
    await parseSseBody(res)

    expect(expandQuery).not.toHaveBeenCalled()
    expect(matchChunksMulti).not.toHaveBeenCalled()
    expect(synthesize).not.toHaveBeenCalled()
  })

})
