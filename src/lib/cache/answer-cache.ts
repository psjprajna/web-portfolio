// Per-Worker-instance in-memory answer cache for /api/ai/rag.
//
// Best-effort by design: Cloudflare may spin up multiple Worker isolates, so
// production hit rate is not guaranteed across requests landing on different
// isolates. A KV-backed shared cache would close that gap but is out of scope
// for this slice. The win we DO bank reliably: rapid repeat calls within the
// same isolate (demo flow, dev server, single-user smoke testing).

const MAX_ENTRIES = 50
const TTL_MS = 5 * 60 * 1000 // 5 min — matches Anthropic prompt-cache TTL

export interface CachedSource {
  source: string
  title: string
  score: number
  chunkId: string
}

interface CachedEntry {
  answer: string
  sources: CachedSource[]
  expiresAt: number
}

const store = new Map<string, CachedEntry>()

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

export function get(key: string): CachedEntry | null {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    store.delete(key)
    return null
  }
  return entry
}

export function set(key: string, answer: string, sources: CachedSource[]): void {
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    // Map preserves insertion order, so the first key is the oldest (FIFO).
    // Acceptable at N=50; swap to true LRU if telemetry shows hit rate
    // dropping below ~30%.
    const oldestKey = store.keys().next().value
    if (oldestKey !== undefined) store.delete(oldestKey)
  }
  store.set(key, { answer, sources, expiresAt: Date.now() + TTL_MS })
}

// Test-only helper. Not part of the production runtime contract.
export function _reset(): void {
  store.clear()
}
