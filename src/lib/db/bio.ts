import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbedding } from '@/lib/ai/embeddings'
import { BIO_CHUNKS } from '@/lib/data/bio'

export interface ReplaceBioChunksResult {
  count: number
  embedded: number
}

export async function replaceBioChunks(): Promise<ReplaceBioChunksResult> {
  const supabase = createSupabaseServiceClient()

  const embeddingResults = await Promise.all(
    BIO_CHUNKS.map(async (chunk) => {
      const embedding = await createEmbedding(chunk.content)
      return { chunk, embedding }
    })
  )

  const { error: deleteError } = await supabase
    .from('bio_chunks')
    .delete()
    .gte('display_order', 0)

  if (deleteError) {
    throw new Error(`Failed to clear bio_chunks: ${deleteError.message}`)
  }

  const now = new Date().toISOString()
  const rows = embeddingResults.map(({ chunk, embedding }) => ({
    section: chunk.section,
    heading: chunk.heading,
    display_order: chunk.display_order,
    content: chunk.content,
    embedding: embedding ? `[${embedding.join(',')}]` : null,
    embedding_updated_at: embedding ? now : null,
  }))

  const { error: insertError } = await supabase.from('bio_chunks').insert(rows)

  if (insertError) {
    throw new Error(`Failed to insert bio_chunks: ${insertError.message}`)
  }

  return {
    count: rows.length,
    embedded: embeddingResults.filter((r) => r.embedding !== null).length,
  }
}
