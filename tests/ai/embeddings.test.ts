import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: { VOYAGE_API_KEY: 'pa-test-key' },
}))

import { createEmbedding, createEmbeddings } from '@/lib/ai/embeddings'

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings'

function makeVector(seed: number, dims = 1024): number[] {
  return Array.from({ length: dims }, (_, i) => (i + seed) * 0.001)
}

describe('createEmbeddings (batched)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends all texts in a single Voyage call and returns vectors in input order', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { embedding: makeVector(0), index: 0 },
          { embedding: makeVector(1), index: 1 },
          { embedding: makeVector(2), index: 2 },
        ],
      }),
    })

    const result = await createEmbeddings(['a', 'b', 'c'])

    expect(result).toHaveLength(3)
    expect(result[0]).toHaveLength(1024)
    expect(result[1]?.[0]).toBeCloseTo(0.001)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      VOYAGE_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ input: ['a', 'b', 'c'], model: 'voyage-3' }),
      })
    )
  })

  it('returns all-null when batched call 429s', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'rate limit' }),
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbeddings(['a', 'b', 'c'])

    expect(result).toHaveLength(3)
    expect(result.every((r) => r === null)).toBe(true)
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('returns an empty array for an empty input list without hitting fetch', async () => {
    const result = await createEmbeddings([])
    expect(result).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns all-null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbeddings(['a', 'b'])

    expect(result).toEqual([null, null])
    consoleErrorSpy.mockRestore()
  })
})

describe('createEmbedding (single-string wrapper)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a 1024-element number[] on Voyage success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ embedding: makeVector(0) }] }),
    })

    const result = await createEmbedding('hello world')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1024)
    expect(fetchMock).toHaveBeenCalledWith(
      VOYAGE_URL,
      expect.objectContaining({
        body: JSON.stringify({ input: ['hello world'], model: 'voyage-3' }),
      })
    )
  })

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
    consoleErrorSpy.mockRestore()
  })

  it('returns null on non-OK HTTP response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'rate limit' }),
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
    consoleErrorSpy.mockRestore()
  })

  it('returns null when the response has no embedding data', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    })

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
  })
})
