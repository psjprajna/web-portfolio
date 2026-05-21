import { replaceBioChunks } from '@/lib/db/bio'
import {
  fetchProjectEmbeddingSource,
  upsertProjectEmbedding,
} from '@/lib/db/projects'
import { createEmbedding } from '@/lib/ai/embeddings'

const USAGE = 'Usage: npm run embed -- <bio|project> [uuid]'

async function embedBio(): Promise<void> {
  const result = await replaceBioChunks()
  process.stdout.write(`${JSON.stringify({ ok: true, ...result })}\n`)
}

async function embedProject(projectId: string): Promise<void> {
  const source = await fetchProjectEmbeddingSource(projectId)
  if (!source) {
    process.stderr.write('project not found or empty (body_md and readme_raw both null/empty)\n')
    process.exit(2)
  }

  const embedding = await createEmbedding(source)
  if (!embedding) {
    process.stderr.write('embedding failed (Voyage API returned no vector)\n')
    process.exit(3)
  }

  await upsertProjectEmbedding(projectId, embedding)
  process.stdout.write(`${JSON.stringify({ ok: true, dims: embedding.length })}\n`)
}

async function main(): Promise<void> {
  const kind = process.argv[2]
  const arg = process.argv[3]

  if (kind === 'bio') return embedBio()

  if (kind === 'project') {
    if (!arg) {
      process.stderr.write(`${USAGE}\nMissing project UUID.\n`)
      process.exit(1)
    }
    return embedProject(arg)
  }

  process.stderr.write(`${USAGE}\n`)
  process.exit(1)
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(99)
})
