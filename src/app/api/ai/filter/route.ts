/**
 * Natural-language project filter route — failure modes inventory:
 *
 * F1.  Anthropic 5xx / timeout            → degraded:true, return all 4 IDs.
 * F2.  Anthropic 429 rate limit           → degraded:true, return all 4 IDs.
 * F3.  Haiku malformed output             → degraded:true, return all 4 IDs.
 * F4.  Haiku invents invalid IDs          → clamp via validIds Set; ignore extras.
 * F5.  Telemetry insert fails             → caught + swallowed; never break user request.
 * F6.  Filter <2 chars                    → 400 generic ("invalid request").
 * F7.  Filter >100 chars                  → 400 generic.
 * F8.  Prompt injection via filter text   → system prompt clamps output schema to
 *                                            MATCH/NO_MATCH; the regex parser refuses
 *                                            anything outside that grammar.
 * F9.  Non-JSON body                      → 400 generic.
 * F10. Cache poisoning via injection      → same-key only; single-tenant; documented
 *                                            + accepted at N=20 entries.
 * F11. Project data drift                 → fitness-test in tests/api/filter.test.ts
 *                                            asserts every PROJECTS[i].metaArchitecture
 *                                            appears in buildFilterSystemPrompt() output.
 * F12. Late-write after client abort      → noise not corruption at N=20; acceptable.
 */
import { z } from 'zod'
import { PROJECTS } from '@/lib/data/projects'
import { filterProjects, FILTER_MODEL, type ProjectDescriptor } from '@/lib/ai/filter'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { filterCache, buildKey, type CachedSource } from '@/lib/cache/answer-cache'

const bodySchema = z.object({
  filter: z.string().min(2).max(100),
})

interface TelemetryPayload {
  query: string
  retrieved_ids: string[]
  response: string
  latency_ms: number
  model: string
  refused: boolean
  cache_hit: 'none' | 'answer'
  feature: 'filter'
}

async function logFilterQuery(
  client: ReturnType<typeof createSupabaseServiceClient>,
  payload: TelemetryPayload
): Promise<void> {
  try {
    const { error } = await client.from('rag_queries').insert(payload)
    if (error) {
      console.error('logFilterQuery: insert error', error.message)
    }
  } catch (err) {
    console.error('logFilterQuery: threw', err)
  }
}

function projectsToDescriptors(): ProjectDescriptor[] {
  return PROJECTS.map((p) => ({
    num: p.num,
    title: p.title,
    archStack: p.metaArchitecture.value,
    impact: p.metaImpact.value,
  }))
}

function sourcesFromIds(ids: string[]): CachedSource[] {
  return ids.map((num) => ({
    source: 'project',
    title: num,
    score: 1,
    chunkId: num,
  }))
}

export async function POST(request: Request): Promise<Response> {
  const t0 = Date.now()

  let parsed: { filter: string }
  try {
    const body = (await request.json()) as unknown
    const result = bodySchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: 'invalid request' }, { status: 400 })
    }
    parsed = result.data
  } catch {
    return Response.json({ error: 'invalid request' }, { status: 400 })
  }

  const client = createSupabaseServiceClient()
  const cacheKey = buildKey('filter:' + parsed.filter, '')
  const cached = filterCache.get(cacheKey)

  if (cached) {
    const matching = cached.sources.map((s) => s.chunkId)
    void logFilterQuery(client, {
      query: parsed.filter,
      retrieved_ids: matching,
      response: cached.answer,
      latency_ms: Date.now() - t0,
      model: 'cache',
      refused: false,
      cache_hit: 'answer',
      feature: 'filter',
    })
    return Response.json({ matching, degraded: false })
  }

  try {
    const descriptors = projectsToDescriptors()
    const result = await filterProjects(parsed.filter, descriptors)

    // Cache successful non-degraded results so repeats ("rag", "ml", "python")
    // cost zero Haiku calls within the 5-minute TTL window.
    if (!result.degraded) {
      filterCache.set(
        cacheKey,
        JSON.stringify(result.matching),
        sourcesFromIds(result.matching)
      )
    }

    void logFilterQuery(client, {
      query: parsed.filter,
      retrieved_ids: result.matching,
      response: JSON.stringify(result.matching),
      latency_ms: Date.now() - t0,
      model: result.degraded ? 'fallback' : FILTER_MODEL,
      refused: false,
      cache_hit: 'none',
      feature: 'filter',
    })

    return Response.json(result)
  } catch (err) {
    console.error('POST /api/ai/filter unexpected error:', err)
    return Response.json({ error: 'something went wrong' }, { status: 500 })
  }
}
