import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createEmbeddings } from '@/lib/ai/embeddings'
import { PROJECT_SEEDS } from '@/lib/data/project-chunks'

export interface SeedProjectsResult {
  count: number
  embedded: number
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

export async function seedProjects(): Promise<SeedProjectsResult> {
  const supabase = createSupabaseServiceClient()

  const embeddings = await createEmbeddings(PROJECT_SEEDS.map((s) => s.body_md))

  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .neq('id', NIL_UUID)

  if (deleteError) {
    throw new Error(`Failed to clear projects: ${deleteError.message}`)
  }

  const now = new Date().toISOString()
  const rows = PROJECT_SEEDS.map((seed, i) => {
    const embedding = embeddings[i] ?? null
    return {
      display_name: seed.display_name,
      description: seed.description,
      tech_stack: [...seed.tech_stack],
      github_repo: seed.github_repo,
      status: seed.status,
      source: seed.source,
      featured_order: seed.featured_order,
      body_md: seed.body_md,
      readme_embedding: embedding ? `[${embedding.join(',')}]` : null,
      embedding_updated_at: embedding ? now : null,
    }
  })

  const { error: insertError } = await supabase.from('projects').insert(rows)

  if (insertError) {
    throw new Error(`Failed to insert projects: ${insertError.message}`)
  }

  return {
    count: rows.length,
    embedded: embeddings.filter((e) => e !== null).length,
  }
}
