import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockEmbed } = vi.hoisted(() => ({ mockEmbed: vi.fn() }))

vi.mock('voyageai', () => ({
  VoyageAIClient: class {
    embed = mockEmbed
  },
}))

vi.mock('@/lib/env', () => ({
  env: { VOYAGE_API_KEY: 'pa-test-key' },
}))

import { createEmbedding } from '@/lib/ai/embeddings'

describe('createEmbedding', () => {
  beforeEach(() => {
    mockEmbed.mockReset()
  })

  it('returns a 1024-element number[] on Voyage success', async () => {
    mockEmbed.mockResolvedValueOnce({
      data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i * 0.001) }],
    })

    const result = await createEmbedding('hello world')

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1024)
    expect(result?.every((n) => typeof n === 'number')).toBe(true)
    expect(mockEmbed).toHaveBeenCalledWith({
      input: 'hello world',
      model: 'voyage-3',
    })
  })

  it('returns null when the Voyage SDK throws', async () => {
    mockEmbed.mockRejectedValueOnce(new Error('voyage rate limit'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('returns null when the response has no embedding data', async () => {
    mockEmbed.mockResolvedValueOnce({ data: [] })

    const result = await createEmbedding('hello world')

    expect(result).toBeNull()
  })
})
