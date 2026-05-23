/**
 * RAG synthesis route — failure modes inventory:
 *
 * F1.  Voyage embed API 4xx/5xx/timeout → matchChunksMulti throws → JSON 500.
 * F2.  Empty retrieval (chunks.length === 0) → REFUSAL_EMPTY copy + telemetry refused=true.
 *      In practice this only triggers on Voyage all-null embeddings (rate-limit / network) —
 *      a successful Voyage call always produces some non-zero cosine match. Score-based
 *      refusal was removed (Slice 4.2g v2): ANCHOR_CHUNK + the SYSTEM_PROMPT's off-corpus
 *      refusal + anti-injection rules handle low-score retrievals at the synthesis layer.
 * F3.  Anthropic API timeout (>30s) — synthesize.ts wraps the stream with a setTimeout that
 *      calls stream.abort() at the wall-clock limit. The for-await loop throws and is caught
 *      by the stream's outer try, emitting an SSE `error` event.
 * F4.  Anthropic rate limit (429) → SDK throws inside the async generator → caught by the
 *      stream's outer try, emits SSE `error` event, telemetry row still written from `finally`.
 * F5.  Cloudflare Worker CPU limit → worker killed; telemetry row never written; client sees
 *      an aborted stream. No mitigation possible in-process.
 * F6.  Stream cancelled by client (drawer close → AbortController) → telemetry still fires
 *      from the stream's `finally`. SDK keeps streaming server-side (open Anthropic SDK
 *      carry-forward — `messages.stream` does not yet honor AbortSignal).
 * F7.  Prompt injection in visitor query → handled by the SYSTEM_PROMPT's anti-injection rule
 *      + off-corpus refusal rule. No deterministic backstop downstream — the prompt is the
 *      sole defense (§6 testing validated this at top=0.412).
 * F8.  History tampering (oversized text, invalid role, > 50 turns) → Zod schema rejects
 *      before any retrieval / synthesis → 400 generic.
 * F9.  Haiku expansion API fails (4xx/5xx/timeout) → expandQuery catches and returns
 *      [trimmed] alone → matchChunksMulti runs as a single-query retrieval. No degradation.
 */
import { z } from 'zod'
import { matchChunksMulti, type MatchedChunk } from '@/lib/db/match'
import { expandQuery, synthesize, type SynthesizeSignals, type Turn } from '@/lib/ai/synthesize'
import * as answerCache from '@/lib/cache/answer-cache'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

type CacheHit = 'none' | 'prompt' | 'answer' | 'both'

// Single refusal copy — fires only when retrieval returns zero chunks (Voyage
// all-null embeddings: rate-limit or network failure). All other retrieval
// outcomes flow into Sonnet with ANCHOR_CHUNK + retrieved chunks; the
// SYSTEM_PROMPT's off-corpus refusal + anti-injection rules handle anything
// retrieval can't ground.
const REFUSAL_EMPTY =
  "I can't reach Prajna's portfolio search right now — please try again in a moment, or ask about a specific project, role, or skill."
// REVIEW: machine-authored Arabic, needs native speaker pass before launch.
const REFUSAL_EMPTY_AR =
  "لا يمكنني الوصول إلى بحث محفظة براجنا في الوقت الحالي — يُرجى المحاولة مرة أخرى بعد قليل، أو اسأل عن مشروع أو دور أو مهارة محددة."

// Arabic Unicode block (U+0600–U+06FF) covers the entire Arabic script for the
// languages the portfolio targets. Presence of ANY Arabic codepoint in the
// visitor's query routes the refusal to the Arabic copy. Locale (URL) and
// answer language are deliberately decoupled: a visitor on /en who types
// Arabic gets the Arabic refusal; the SYSTEM_PROMPT's LANGUAGE RULE applies
// the same per-message detection at the synthesis layer.
const ARABIC_SCRIPT_RANGE = /[؀-ۿ]/

function isArabicQuery(text: string): boolean {
  return ARABIC_SCRIPT_RANGE.test(text)
}

function pickRefusalCopy(query: string): string {
  return isArabicQuery(query) ? REFUSAL_EMPTY_AR : REFUSAL_EMPTY
}
const MODEL_NAME = 'claude-sonnet-4-6'
const TOP_K = 5
const PER_QUERY_TOP_K = 3
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
  cache_hit: CacheHit
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

  const encoder = new TextEncoder()
  const sse = (payload: unknown) =>
    encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)

  const SSE_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  }

  // Cache lookup — runs BEFORE retrieval. History-aware key prevents the
  // "What about her education there?" cross-session collision: identical
  // wording with different antecedents hash to different buckets.
  const lastUserTurn = [...clampedHistory].reverse().find((t) => t.role === 'user')?.text
  const cacheKey = answerCache.buildKey(query, lastUserTurn)
  const cached = answerCache.get(cacheKey)

  if (cached) {
    const hitStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(sse({ type: 'token', text: cached.answer }))
        controller.enqueue(
          sse({
            type: 'meta',
            sources: cached.sources.map((s) => ({
              source: s.source,
              title: s.title,
              score: s.score,
            })),
            refused: false,
          })
        )
        controller.enqueue(sse({ type: 'done' }))
        controller.close()
        void logRagQuery(client, {
          query,
          retrieved_ids: cached.sources.map((s) => s.chunkId),
          response: cached.answer,
          latency_ms: Date.now() - t0,
          model: MODEL_NAME,
          refused: false,
          relevance_top_score: cached.sources[0]?.score ?? null,
          cache_hit: 'answer',
        })
      },
    })
    return new Response(hitStream, { status: 200, headers: SSE_HEADERS })
  }

  let chunks: MatchedChunk[]
  try {
    // expandQuery returns [original, ...rewrites] (1-4 entries). On Haiku
    // error it falls back to [original] alone — single-call behavior preserved.
    const expanded = await expandQuery(query)
    chunks = await matchChunksMulti(expanded, PER_QUERY_TOP_K, TOP_K)
  } catch (err) {
    console.error('POST /api/ai/rag retrieval failed:', err)
    return Response.json({ error: 'something went wrong' }, { status: 500 })
  }

  const topScore = chunks[0]?.score ?? null
  const shouldRefuse = chunks.length === 0
  const refusalCopy = pickRefusalCopy(query)
  const sources = chunks.map((c) => ({
    source: c.source,
    title: c.title,
    score: c.score,
  }))

  const signals: SynthesizeSignals = {}

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const buffer: string[] = []
      try {
        if (shouldRefuse) {
          controller.enqueue(sse({ type: 'token', text: refusalCopy }))
          buffer.push(refusalCopy)
        } else {
          for await (const token of synthesize(query, chunks, clampedHistory, signals)) {
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
        const answer = buffer.join('')
        // Populate cache only on successful synthesize (skip refusals — the
        // refusal copy is route-level constant text, nothing to cache).
        if (!shouldRefuse && answer.length > 0) {
          answerCache.set(
            cacheKey,
            answer,
            chunks.map((c) => ({
              source: c.source,
              title: c.title,
              score: c.score,
              chunkId: c.chunkId,
            }))
          )
        }
        const cacheHit: CacheHit = shouldRefuse ? 'none' : (signals.cacheHit ?? 'none')
        void logRagQuery(client, {
          query,
          retrieved_ids: chunks.map((c) => c.chunkId),
          response: answer,
          latency_ms: Date.now() - t0,
          model: MODEL_NAME,
          refused: shouldRefuse,
          relevance_top_score: topScore,
          cache_hit: cacheHit,
        })
      }
    },
  })

  return new Response(stream, { status: 200, headers: SSE_HEADERS })
}
