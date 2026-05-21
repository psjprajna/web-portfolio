import { z } from 'zod'
import { matchChunks, type MatchedChunk } from '@/lib/db/match'
import { synthesize } from '@/lib/ai/synthesize'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

const REFUSAL_THRESHOLD = 0.25
const REFUSAL_TEXT =
  "I don't have specific information about that in Prajna's portfolio. Try asking about her AI projects, work history, or technical skills."
const MODEL_NAME = 'claude-sonnet-4-6'
const TOP_K = 5

const bodySchema = z.object({
  query: z.string().min(3).max(500),
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
  try {
    const body = (await request.json()) as unknown
    const result = bodySchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: 'invalid request' }, { status: 400 })
    }
    query = result.data.query
  } catch {
    return Response.json({ error: 'invalid request' }, { status: 400 })
  }

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
  const shouldRefuse =
    chunks.length === 0 || (topScore !== null && topScore < REFUSAL_THRESHOLD)
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
          controller.enqueue(sse({ type: 'token', text: REFUSAL_TEXT }))
          buffer.push(REFUSAL_TEXT)
        } else {
          for await (const token of synthesize(query, chunks)) {
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
