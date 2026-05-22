import { describe, it, expect, vi, beforeEach } from 'vitest'
import { filterProjects, buildFilterSystemPrompt, type ProjectDescriptor } from '@/lib/ai/filter'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { filterCache } from '@/lib/cache/answer-cache'
import { PROJECTS } from '@/lib/data/projects'

// Partial mock — keep real buildFilterSystemPrompt so the drift-detector test (test #8)
// can assert on the actual prompt-building logic. Only stub filterProjects so route tests
// can drive Haiku-response scenarios without an SDK call.
vi.mock('@/lib/ai/filter', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/filter')>('@/lib/ai/filter')
  return {
    ...actual,
    filterProjects: vi.fn(),
  }
})
vi.mock('@/lib/supabase/service', () => ({ createSupabaseServiceClient: vi.fn() }))
vi.mock('@/lib/cache/answer-cache', () => ({
  buildKey: vi.fn((q: string, lastUserTurn?: string) => `k:${q}|${lastUserTurn ?? ''}`),
  filterCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
    _reset: vi.fn(),
  },
}))

import { POST } from '@/app/api/ai/filter/route'

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
  return new Request('http://localhost/api/ai/filter', init)
}

describe('POST /api/ai/filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(filterCache.get).mockReturnValue(null)
  })

  it('returns 400 on malformed JSON body', async () => {
    const req = makeRequest('not-json{')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('invalid request')
  })

  it('returns 400 when filter is shorter than 2 chars', async () => {
    mockInsertChain()
    const res = await POST(makeRequest({ filter: 'x' }))
    expect(res.status).toBe(400)
    expect(filterProjects).not.toHaveBeenCalled()
  })

  it('returns 400 when filter exceeds 100 chars', async () => {
    mockInsertChain()
    const longFilter = 'a'.repeat(101)
    const res = await POST(makeRequest({ filter: longFilter }))
    expect(res.status).toBe(400)
    expect(filterProjects).not.toHaveBeenCalled()
  })

  it('happy path — Haiku returns 2 matches, response shape is correct + telemetry inserted with feature=filter', async () => {
    const { insert } = mockInsertChain()
    vi.mocked(filterProjects).mockResolvedValue({
      matching: ['01', '03'],
      degraded: false,
    })

    const res = await POST(makeRequest({ filter: 'RAG' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { matching: string[]; degraded: boolean }
    expect(body.matching).toEqual(['01', '03'])
    expect(body.degraded).toBe(false)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(insert).toHaveBeenCalledTimes(1)
    const payload = insert.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.query).toBe('RAG')
    expect(payload.feature).toBe('filter')
    expect(payload.cache_hit).toBe('none')
    expect(payload.refused).toBe(false)
    expect(payload.model).toBe('claude-haiku-4-5-20251001')
  })

  it('happy path — NO_MATCH from Haiku surfaces as matching:[]', async () => {
    mockInsertChain()
    vi.mocked(filterProjects).mockResolvedValue({
      matching: [],
      degraded: false,
    })

    const res = await POST(makeRequest({ filter: 'qwiglyfflarg' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { matching: string[]; degraded: boolean }
    expect(body.matching).toEqual([])
    expect(body.degraded).toBe(false)
  })

  it('Haiku 5xx degrades gracefully — degraded:true with all 4 IDs', async () => {
    const { insert } = mockInsertChain()
    vi.mocked(filterProjects).mockResolvedValue({
      matching: ['01', '02', '03', '04'],
      degraded: true,
    })

    const res = await POST(makeRequest({ filter: 'production ML' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { matching: string[]; degraded: boolean }
    expect(body.matching).toEqual(['01', '02', '03', '04'])
    expect(body.degraded).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 0))
    const payload = insert.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.model).toBe('fallback')
  })

  it('cache hit short-circuits Haiku call + logs cache_hit=answer', async () => {
    const { insert } = mockInsertChain()
    vi.mocked(filterCache.get).mockReturnValue({
      answer: JSON.stringify(['01']),
      sources: [{ source: 'project', title: '01', score: 1, chunkId: '01' }],
      expiresAt: Date.now() + 60_000,
    })

    const res = await POST(makeRequest({ filter: 'rag' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { matching: string[]; degraded: boolean }
    expect(body.matching).toEqual(['01'])
    expect(body.degraded).toBe(false)

    expect(filterProjects).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 0))
    const payload = insert.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.cache_hit).toBe('answer')
    expect(payload.feature).toBe('filter')
  })

  it('fitness test — buildFilterSystemPrompt includes every project archStack/impact/num (drift detector)', () => {
    const descriptors: ProjectDescriptor[] = PROJECTS.map((p) => ({
      num: p.num,
      title: p.title,
      archStack: p.metaArchitecture.value,
      impact: p.metaImpact.value,
    }))
    const prompt = buildFilterSystemPrompt(descriptors)

    // Every archStack/impact/num token must appear in the prompt.
    // If project data gets renamed without updating the prompt builder, this
    // assertion breaks BEFORE the live filter starts returning wrong results.
    for (const p of PROJECTS) {
      expect(prompt).toContain(p.metaArchitecture.value)
      expect(prompt).toContain(p.metaImpact.value)
      expect(prompt).toContain(p.num)
    }
  })
})
