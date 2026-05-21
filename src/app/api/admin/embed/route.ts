import { z } from 'zod'
import { env } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createEmbedding } from '@/lib/ai/embeddings'
import {
  fetchProjectEmbeddingSource,
  upsertProjectEmbedding,
} from '@/lib/db/projects'

const bodySchema = z.object({
  type: z.literal('project'),
  id: z.string().uuid(),
})

export async function POST(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== env.ADMIN_EMAIL) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json({ error: 'invalid body' }, { status: 400 })
  }

  const source = await fetchProjectEmbeddingSource(parsed.data.id)
  if (!source) {
    return Response.json({ error: 'project not found or empty' }, { status: 404 })
  }

  const embedding = await createEmbedding(source)
  if (!embedding) {
    return Response.json({ error: 'embedding failed' }, { status: 502 })
  }

  try {
    await upsertProjectEmbedding(parsed.data.id, embedding)
  } catch {
    return Response.json({ error: 'database write failed' }, { status: 500 })
  }

  return Response.json({ ok: true, dims: embedding.length })
}
