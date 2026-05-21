/**
 * RAG synthesis route — failure modes inventory:
 *
 * F1. Voyage embed API 4xx/5xx/timeout → matchChunks throws → JSON 500.
 * F2. Empty retrieval (chunks.length === 0) → REFUSAL_EMPTY copy + telemetry refused=true.
 * F3. Weak retrieval (top score < REFUSAL_THRESHOLD) → REFUSAL_LOW copy + telemetry refused=true.
 * F4. Anthropic API timeout (>30s) — deferred to slice 4.2e (cache slice has the Promise.race wrapper).
 *     Cloudflare runtime kills runaway workers at 30s CPU anyway, so the visitor gets a
 *     dead stream not a hang.
 * F5. Anthropic rate limit (429) → SDK throws inside the async generator → caught by the
 *     stream's outer try, emits SSE `error` event, telemetry row still written from `finally`.
 * F6. Cloudflare Worker CPU limit → worker killed; telemetry row never written; client sees
 *     an aborted stream. No mitigation possible in-process.
 * F7. Stream cancelled by client (drawer close → AbortController) → telemetry still fires
 *     from the stream's `finally`. SDK keeps streaming server-side (open Anthropic SDK
 *     carry-forward — `messages.stream` does not yet honor AbortSignal).
 * F8. Prompt injection in visitor query → handled by the system prompt's anti-injection rule
 *     + the score-based refusal threshold as backstop.
 * F9. History tampering (oversized text, invalid role, > 50 turns) → Zod schema rejects
 *     before any retrieval / synthesis → 400 generic.
 */
import { z } from 'zod'
import { matchChunks, type MatchedChunk } from '@/lib/db/match'
import { synthesize, type Turn } from '@/lib/ai/synthesize'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

const REFUSAL_THRESHOLD = 0.3
const REFUSAL_EMPTY =
  "I can only answer from my resume, projects, and skills here. Try asking about my AI work, a specific project, or my timeline."
const REFUSAL_LOW =
  "I don't have enough grounded context to answer that confidently. Try rephrasing, or ask about a specific project, role, or skill of mine."
const MODEL_NAME = 'claude-sonnet-4-6'
const TOP_K = 5
const HISTORY_MAX_TURNS = 6
const HISTORY_MAX_INBOUND = 50

const turnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().min(1).max(2000),
})

const bodySchema = z.object({
  query: z.string().min(3).max(500),
  history: z.array(turnSchema).max(HISTORY_MAX_INBOUND).optional(),
})

interface TelemetryPayload {
  query: string
  retrieved_ids: string[]
  response: string
  latency_ms: number
  model: string
  refused: boolean
  relevance_top_score: number | null
}

async function logRagQuery(
  client: ReturnType<typeof createSupabaseServiceClient>,
  payload: TelemetryPayload
): Promise<void> {
  try {
    const { error } = await client.from('rag_queries').insert(payload)
    if (error) {
      console.error('logRagQuery: insert error', error.message)
    }
  } catch (err) {
    console.error('logRagQuery: threw', err)
  }
}

export async function POST(request: Request): Promise<Response> {
  let query: string
  let history: Turn[]
  try {
    const body = (await request.json()) as unknown
    const result = bodySchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: 'invalid request' }, { status: 400 })
    }
    query = result.data.query
    history = result.data.history ?? []
  } catch {
    return Response.json({ error: 'invalid request' }, { status: 400 })
  }

  const clampedHistory = history.slice(-HISTORY_MAX_TURNS)

  const client = createSupabaseServiceClient()
  const t0 = Date.now()

  let chunks: MatchedChunk[]
  try {
    chunks = await matchChunks(query, TOP_K)
  } catch (err) {
    console.error('POST /api/ai/rag retrieval failed:', err)
    return Response.json({ error: 'something went wrong' }, { status: 500 })
  }

  const topScore = chunks[0]?.score ?? null
  const refusalReason: 'empty' | 'low' | null =
    chunks.length === 0
      ? 'empty'
      : topScore !== null && topScore < REFUSAL_THRESHOLD
        ? 'low'
        : null
  const shouldRefuse = refusalReason !== null
  const refusalCopy = refusalReason === 'empty' ? REFUSAL_EMPTY : REFUSAL_LOW
  const sources = chunks.map((c) => ({
    source: c.source,
    title: c.title,
    score: c.score,
  }))

  const encoder = new TextEncoder()
  const sse = (payload: unknown) =>
    encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const buffer: string[] = []
      try {
        if (shouldRefuse) {
          controller.enqueue(sse({ type: 'token', text: refusalCopy }))
          buffer.push(refusalCopy)
        } else {
          for await (const token of synthesize(query, chunks, clampedHistory)) {
            controller.enqueue(sse({ type: 'token', text: token }))
            buffer.push(token)
          }
        }
        controller.enqueue(sse({ type: 'meta', sources, refused: shouldRefuse }))
        controller.enqueue(sse({ type: 'done' }))
      } catch (err) {
        console.error('POST /api/ai/rag stream failed:', err)
        controller.enqueue(sse({ type: 'error' }))
      } finally {
        controller.close()
        void logRagQuery(client, {
          query,
          retrieved_ids: chunks.map((c) => c.chunkId),
          response: buffer.join(''),
          latency_ms: Date.now() - t0,
          model: MODEL_NAME,
          refused: shouldRefuse,
          relevance_top_score: topScore,
        })
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
