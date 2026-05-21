import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

const ANTHROPIC_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1024

// Local shape — deliberately NOT imported from @/lib/db/match. The
// architecture-boundary test forbids src/lib/ai/ from importing src/lib/db/,
// even for types (the regex matches `import type ... from` as well).
// The route adapts MatchedChunk → RetrievedChunk at the call site; field names
// already match, so the cast is zero-cost.
export interface RetrievedChunk {
  source: string
  title: string
  content: string
  score: number
}

const SYSTEM_PROMPT = `You are Prajna Shetty's portfolio AI assistant. Prajna is an Applied AI engineer based in Dubai, UAE.

Answer the user's question using ONLY the retrieved context below. Each chunk is labeled with its source type:
- bio: Prajna's biography, hero copy, and technical skill clusters
- resume: work experience and education history
- project: specific projects Prajna has built

When citing facts, mention the source type in parentheses, e.g. "(from project: Arabic Sentiment Analysis)" or "(from resume: Scale AI)". Keep answers to 2-4 sentences. If the context does not directly answer the question, say so plainly — do not invent or extrapolate.`

function buildUserMessage(query: string, chunks: RetrievedChunk[]): string {
  const formatted = chunks
    .map((c) => `[source: ${c.source}] ${c.title}\n${c.content}`)
    .join('\n\n')
  return `Question: ${query}\n\nContext:\n${formatted}`
}

export async function* synthesize(
  query: string,
  chunks: RetrievedChunk[]
): AsyncGenerator<string, void, unknown> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(query, chunks) }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
