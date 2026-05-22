-- Migration 006: cache_hit telemetry column on rag_queries
--
-- Adds a nullable enum column so /api/ai/rag can log which cache layer (if any)
-- short-circuited the response. Existing rows remain valid (NULL = pre-instrumentation).
--
-- Enum semantics:
--   'none'    — both caches missed; full retrieve + synthesize ran
--   'prompt'  — Anthropic prompt-cache hit only (usage.cache_read_input_tokens > 0)
--   'answer'  — local in-memory LRU hit; retrieval AND synthesize skipped
--   'both'    — reserved for future shape; today the LRU short-circuits before
--               the prompt cache, so 'both' is unreachable. Keeping it in the
--               CHECK constraint avoids a follow-up migration if we later add
--               a stale-LRU + fresh-prompt-cache code path.

ALTER TABLE rag_queries
  ADD COLUMN IF NOT EXISTS cache_hit text
    CHECK (cache_hit IN ('none', 'prompt', 'answer', 'both'));
