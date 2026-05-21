import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchChunks } from '@/lib/db/match'
import { createEmbedding } from '@/lib/ai/embeddings'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

vi.mock('@/lib/ai/embeddings', () => ({ createEmbedding: vi.fn() }))
vi.mock('@/lib/supabase/service', () => ({ createSupabaseServiceClient: vi.fn() }))

function mockClient(rpcResult: { data: unknown; error: unknown }) {
  const rpc = vi.fn().mockResolvedValue(rpcResult)
  vi.mocked(createSupabaseServiceClient).mockReturnValue({ rpc } as never)
  return rpc
}

describe('matchChunks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty when Voyage embedding fails (null path)', async () => {
    vi.mocked(createEmbedding).mockResolvedValue(null)
    expect(await matchChunks('test')).toEqual([])
  })

  it('serializes vector as pgvector literal and forwards topK', async () => {
    vi.mocked(createEmbedding).mockResolvedValue([0.1, 0.2, 0.3])
    const rpc = mockClient({ data: [], error: null })
    await matchChunks('test query', 7)
    expect(rpc).toHaveBeenCalledWith('match_chunks', {
      query_embedding: '[0.1,0.2,0.3]',
      match_count: 7,
    })
  })

  it('normalizes RPC row shape into MatchedChunk', async () => {
    vi.mocked(createEmbedding).mockResolvedValue([0])
    mockClient({
      data: [
        { source: 'bio', chunk_id: 'a', title: 'X', content: 'hello', score: 0.95 },
        { source: 'project', chunk_id: 'b', title: 'Y', content: 'world', score: 0.85 },
      ],
      error: null,
    })
    const result = await matchChunks('test')
    expect(result).toHaveLength(2)
    expect(result).toMatchObject([
      { source: 'bio', chunkId: 'a', score: 0.95 },
      { source: 'project', chunkId: 'b', title: 'Y' },
    ])
  })

  it('throws when RPC returns an error', async () => {
    vi.mocked(createEmbedding).mockResolvedValue([0])
    mockClient({ data: null, error: { message: 'permission denied' } })
    await expect(matchChunks('test')).rejects.toThrow(
      /match_chunks RPC failed: permission denied/
    )
  })
})
