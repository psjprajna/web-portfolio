import { createEmbedding } from '@/lib/ai/embeddings'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

const TOP_K = 5
const SNIPPET_LEN = 90

interface Hit {
  source: string
  identifier: string
  title: string
  snippet: string
  score: number
}

function parseEmbedding(raw: unknown): number[] | null {
  if (typeof raw !== 'string') return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter((n): n is number => typeof n === 'number')
  } catch {
    return null
  }
}

function dot(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length)
  let s = 0
  for (let i = 0; i < n; i++) s += (a[i] ?? 0) * (b[i] ?? 0)
  return s
}

function snippet(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > SNIPPET_LEN ? `${flat.slice(0, SNIPPET_LEN)}…` : flat
}

async function main(): Promise<void> {
  const query = process.argv.slice(2).join(' ').trim()
  if (!query) {
    process.stderr.write('Usage: npm run probe -- "your natural-language query"\n')
    process.exit(1)
  }

  const queryEmbedding = await createEmbedding(query)
  if (!queryEmbedding) {
    process.stderr.write('Failed to embed query (Voyage returned no vector)\n')
    process.exit(2)
  }

  const supabase = createSupabaseServiceClient()
  const [bio, resume, projects] = await Promise.all([
    supabase
      .from('bio_chunks')
      .select('section, heading, display_order, content, embedding'),
    supabase
      .from('resume_chunks')
      .select('chunk_type, title, organization, display_order, content, embedding'),
    supabase
      .from('projects')
      .select('display_name, description, body_md, readme_embedding'),
  ])

  const hits: Hit[] = []

  for (const row of bio.data ?? []) {
    const emb = parseEmbedding(row.embedding)
    if (!emb) continue
    hits.push({
      source: 'bio_chunks',
      identifier: `${row.section}#${row.display_order}`,
      title: row.heading ?? '(no heading)',
      snippet: snippet(row.content),
      score: dot(queryEmbedding, emb),
    })
  }

  for (const row of resume.data ?? []) {
    const emb = parseEmbedding(row.embedding)
    if (!emb) continue
    hits.push({
      source: 'resume_chunks',
      identifier: `${row.chunk_type}#${row.display_order}`,
      title: `${row.title} @ ${row.organization}`,
      snippet: snippet(row.content),
      score: dot(queryEmbedding, emb),
    })
  }

  for (const row of projects.data ?? []) {
    const emb = parseEmbedding(row.readme_embedding)
    if (!emb) continue
    hits.push({
      source: 'projects',
      identifier: row.display_name,
      title: row.display_name,
      snippet: snippet(row.body_md ?? row.description ?? ''),
      score: dot(queryEmbedding, emb),
    })
  }

  hits.sort((a, b) => b.score - a.score)
  const top = hits.slice(0, TOP_K)

  process.stdout.write(`Query: "${query}"\n`)
  process.stdout.write(`Corpus: ${hits.length} embedded chunks (bio=${bio.data?.length ?? 0}, resume=${resume.data?.length ?? 0}, projects=${projects.data?.length ?? 0})\n\n`)

  if (top.length === 0) {
    process.stdout.write('No embedded chunks found. Run `npm run embed bio` and `npm run embed resume` first.\n')
    return
  }

  top.forEach((h, i) => {
    process.stdout.write(
      `  ${i + 1}. [${h.source.padEnd(13)} ${h.identifier.padEnd(14)}] ` +
        `score=${h.score.toFixed(3)}  ${h.title}\n`
    )
    process.stdout.write(`     "${h.snippet}"\n`)
  })
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(99)
})
