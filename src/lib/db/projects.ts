import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function fetchProjectEmbeddingSource(
  projectId: string
): Promise<string | null> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select('body_md, readme_raw')
    .eq('id', projectId)
    .single()

  if (error || !data) return null
  return data.body_md ?? data.readme_raw ?? null
}

export async function upsertProjectEmbedding(
  projectId: string,
  embedding: number[]
): Promise<void> {
  const supabase = createSupabaseServiceClient()
  const literal = `[${embedding.join(',')}]`

  const { error } = await supabase
    .from('projects')
    .update({
      readme_embedding: literal,
      embedding_updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    throw new Error(`Failed to upsert project embedding: ${error.message}`)
  }
}
