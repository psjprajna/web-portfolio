// Per-Worker-instance in-memory cache. Factored into createCache so multiple
// AI features (RAG synthesis, NL project filter) can share the same LRU + TTL
// shape without duplicating code. Each instance owns its own Map.
//
// Best-effort by design: Cloudflare may spin up multiple Worker isolates, so
// production hit rate is not guaranteed across requests landing on different
// isolates. A KV-backed shared cache would close that gap but is out of scope.
// The win we DO bank reliably: rapid repeat calls within the same isolate
// (demo flow, dev server, single-user smoke testing).

export interface CachedSource {
  source: string
  title: string
  score: number
  chunkId: string
}

export interface CachedEntry {
  answer: string
  sources: CachedSource[]
  expiresAt: number
}

export interface CacheInstance {
  get(key: string): CachedEntry | null
  set(key: string, answer: string, sources: CachedSource[]): void
  _reset(): void
  readonly maxEntries: number
  readonly ttlMs: number
}

export function createCache(opts: { maxEntries: number; ttlMs: number }): CacheInstance {
  const { maxEntries, ttlMs } = opts
  const store = new Map<string, CachedEntry>()

  return {
    maxEntries,
    ttlMs,
    get(key: string): CachedEntry | null {
      const entry = store.get(key)
      if (!entry) return null
      if (entry.expiresAt < Date.now()) {
        store.delete(key)
        return null
      }
      return entry
    },
    set(key: string, answer: string, sources: CachedSource[]): void {
      if (store.size >= maxEntries && !store.has(key)) {
        // Map preserves insertion order, so the first key is the oldest (FIFO).
        // Acceptable at small N; swap to true LRU if telemetry shows hit rate
        // dropping below ~30%.
        const oldestKey = store.keys().next().value
        if (oldestKey !== undefined) store.delete(oldestKey)
      }
      store.set(key, { answer, sources, expiresAt: Date.now() + ttlMs })
    },
    _reset(): void {
      store.clear()
    },
  }
}

// FNV-1a 32-bit synchronous hash. Sub-microsecond per call. Crypto-grade
// resistance is irrelevant here — we are bucketing strings, not defending
// against adversaries — so SHA-256 via crypto.subtle (async) would be cargo-
// culted overhead and force the cache lookup into async territory unnecessarily.
function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h.toString(16)
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// History-aware key: concatenates the last user turn so "What about her
// education there?" cannot collide across sessions with different antecedents.
// Single-turn queries (lastUserTurn === undefined) share a bucket — correct,
// since their semantics do not depend on prior context.
export function buildKey(query: string, lastUserTurn?: string): string {
  return fnv1a(normalize(query) + '|' + normalize(lastUserTurn ?? ''))
}

// RAG cache (Slice 4.2e). 5-min TTL matches Anthropic prompt-cache TTL.
export const ragCache = createCache({ maxEntries: 50, ttlMs: 5 * 60 * 1000 })

// Backward-compat shim. The existing /api/ai/rag route + rag.test.ts mocks
// import { buildKey, get, set } as named exports from this module (the pre-
// factory shape). Keeping these re-exports means the refactor is fully
// invisible to RAG callers — load-bearing for the cache refactor's safety.
export const get = (key: string) => ragCache.get(key)
export const set = (key: string, answer: string, sources: CachedSource[]) =>
  ragCache.set(key, answer, sources)
export const _reset = () => ragCache._reset()
