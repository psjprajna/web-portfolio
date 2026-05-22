import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbeddings } from '@/lib/ai/embeddings'
import { RESUME_CHUNKS } from '@/lib/data/resume-chunks'

export interface ReplaceResumeChunksResult {
  count: number
  embedded: number
}

export async function replaceResumeChunks(): Promise<ReplaceResumeChunksResult> {
  const supabase = createSupabaseServiceClient()

  const embeddings = await createEmbeddings(RESUME_CHUNKS.map((c) => c.content))

  const { error: deleteError } = await supabase
    .from('resume_chunks')
    .delete()
    .gte('display_order', 0)

  if (deleteError) {
    throw new Error(`Failed to clear resume_chunks: ${deleteError.message}`)
  }

  const now = new Date().toISOString()
  const rows = RESUME_CHUNKS.map((chunk, i) => {
    const embedding = embeddings[i] ?? null
    return {
      chunk_type: chunk.chunk_type,
      title: chunk.title,
      organization: chunk.organization,
      date_range: chunk.date_range,
      tech_stack: [...chunk.tech_stack],
      display_order: chunk.display_order,
      content: chunk.content,
      embedding: embedding ? `[${embedding.join(',')}]` : null,
      embedding_updated_at: embedding ? now : null,
    }
  })

  const { error: insertError } = await supabase.from('resume_chunks').insert(rows)

  if (insertError) {
    throw new Error(`Failed to insert resume_chunks: ${insertError.message}`)
  }

  return {
    count: rows.length,
    embedded: embeddings.filter((e) => e !== null).length,
  }
}
