import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbedding } from '@/lib/ai/embeddings'

export type ChunkSource = 'bio' | 'resume' | 'project'

export interface MatchedChunk {
  source: ChunkSource
  chunkId: string
  title: string
  content: string
  score: number
}

const DEFAULT_TOP_K = 5

export async function matchChunks(
  query: string,
  topK: number = DEFAULT_TOP_K,
): Promise<MatchedChunk[]> {
  const queryEmbedding = await createEmbedding(query)
  if (!queryEmbedding) return []

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: topK,
  })

  if (error) {
    throw new Error(`match_chunks RPC failed: ${error.message}`)
  }

  return (data ?? []).map((row): MatchedChunk => ({
    source: row.source as ChunkSource,
    chunkId: row.chunk_id,
    title: row.title,
    content: row.content,
    score: row.score,
  }))
}
