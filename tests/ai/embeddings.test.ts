import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: { VOYAGE_API_KEY: 'pa-test-key' },
}))

import { createEmbedding } from '@/lib/ai/embeddings'

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings'

describe('createEmbedding', () => {
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
      json: async () => ({
        data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i * 0.001) }],
      }),
    })

    const result = await createEmbedding('hello world')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1024)
    expect(result?.every((n) => typeof n === 'number')).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      VOYAGE_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer pa-test-key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ input: 'hello world', model: 'voyage-3' }),
      })
    )
  })

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
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
    expect(consoleErrorSpy).toHaveBeenCalled()
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
