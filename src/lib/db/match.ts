import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbedding, createEmbeddings } from '@/lib/ai/embeddings'

export type ChunkSource = 'bio' | 'resume' | 'project' | 'project_readme'

export interface MatchedChunk {
  source: ChunkSource
  chunkId: string
  title: string
  content: string
  score: number
}

const DEFAULT_TOP_K = 5

// Module-private helper: runs the match_chunks RPC against a precomputed
// embedding. The public wrappers below own the embedding step so callers
// don't pay N×Voyage roundtrips when fanning out a multi-query expansion.
async function matchChunksFromEmbedding(
  embedding: number[],
  topK: number,
): Promise<MatchedChunk[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: `[${embedding.join(',')}]`,
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

export async function matchChunks(
  query: string,
  topK: number = DEFAULT_TOP_K,
): Promise<MatchedChunk[]> {
  const embedding = await createEmbedding(query)
  if (!embedding) return []
  return matchChunksFromEmbedding(embedding, topK)
}

// Multi-query retrieval — embeds all queries in ONE batched Voyage call,
// runs match_chunks RPC per embedding in parallel, unions by chunkId
// (highest score wins on collision), returns the top `finalTopK`.
//
// Why batched embed over N parallel matchChunks calls: Voyage free tier is
// 3 RPM. Promise.all of 4 matchChunks would fire 4 concurrent embed requests
// and almost guarantee a 429. createEmbeddings([...]) is one API call.
//
// Why chunkId merge key (not source::title): bio.about has 3 distinct chunks
// with identical title "about". source::title would collapse them and destroy
// real corpus diversity.
export async function matchChunksMulti(
  queries: string[],
  perQueryTopK: number,
  finalTopK: number,
): Promise<MatchedChunk[]> {
  if (queries.length === 0) return []

  const embeddings = await createEmbeddings(queries)
  const surviving = embeddings.filter((e): e is number[] => e !== null)
  if (surviving.length === 0) return []

  const chunkArrays = await Promise.all(
    surviving.map((emb) => matchChunksFromEmbedding(emb, perQueryTopK)),
  )

  const seen = new Map<string, MatchedChunk>()
  for (const arr of chunkArrays) {
    for (const c of arr) {
      const prior = seen.get(c.chunkId)
      if (!prior || c.score > prior.score) {
        seen.set(c.chunkId, c)
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, finalTopK)
}
