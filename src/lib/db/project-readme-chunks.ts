import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbeddings } from '@/lib/ai/embeddings'
import type { ProjectReadmeChunk } from '@/lib/data/project-readme-chunks'

export interface ReplaceProjectReadmeChunksResult {
  count: number
  embedded: number
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

export async function replaceProjectReadmeChunks(
  chunks: ProjectReadmeChunk[],
): Promise<ReplaceProjectReadmeChunksResult> {
  const supabase = createSupabaseServiceClient()

  const embeddings = chunks.length > 0
    ? await createEmbeddings(chunks.map((c) => c.content))
    : []

  const { error: deleteError } = await supabase
    .from('project_chunks')
    .delete()
    .neq('id', NIL_UUID)

  if (deleteError) {
    throw new Error(`Failed to clear project_chunks: ${deleteError.message}`)
  }

  if (chunks.length === 0) {
    return { count: 0, embedded: 0 }
  }

  const now = new Date().toISOString()
  const rows = chunks.map((chunk, i) => {
    const embedding = embeddings[i] ?? null
    return {
      project_id: chunk.project_id,
      section: chunk.section,
      content: chunk.content,
      display_order: chunk.display_order,
      embedding: embedding ? `[${embedding.join(',')}]` : null,
      embedding_updated_at: embedding ? now : null,
    }
  })

  const { error: insertError } = await supabase.from('project_chunks').insert(rows)

  if (insertError) {
    throw new Error(`Failed to insert project_chunks: ${insertError.message}`)
  }

  return {
    count: rows.length,
    embedded: embeddings.filter((e) => e !== null).length,
  }
}
