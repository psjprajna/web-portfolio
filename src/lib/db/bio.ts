import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbeddings } from '@/lib/ai/embeddings'
import { BIO_CHUNKS } from '@/lib/data/bio'

export interface ReplaceBioChunksResult {
  count: number
  embedded: number
}

export async function replaceBioChunks(): Promise<ReplaceBioChunksResult> {
  const supabase = createSupabaseServiceClient()

  const embeddings = await createEmbeddings(BIO_CHUNKS.map((c) => c.content))

  const { error: deleteError } = await supabase
    .from('bio_chunks')
    .delete()
    .gte('display_order', 0)

  if (deleteError) {
    throw new Error(`Failed to clear bio_chunks: ${deleteError.message}`)
  }

  const now = new Date().toISOString()
  const rows = BIO_CHUNKS.map((chunk, i) => {
    const embedding = embeddings[i] ?? null
    return {
      section: chunk.section,
      heading: chunk.heading,
      display_order: chunk.display_order,
      content: chunk.content,
      embedding: embedding ? `[${embedding.join(',')}]` : null,
      embedding_updated_at: embedding ? now : null,
    }
  })

  const { error: insertError } = await supabase.from('bio_chunks').insert(rows)

  if (insertError) {
    throw new Error(`Failed to insert bio_chunks: ${insertError.message}`)
  }

  return {
    count: rows.length,
    embedded: embeddings.filter((e) => e !== null).length,
  }
}
