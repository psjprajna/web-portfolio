-- 003_match_chunks.sql
-- Slice 4.2a — cross-source semantic search for RAG retrieval.
-- Returns top-K rows from bio_chunks ∪ resume_chunks ∪ projects ranked
-- by cosine similarity to a query embedding.
--
-- Replaces the client-side cosine in scripts/probe.ts for production use.
-- Probe stays as a diagnostic / debug surface.

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1024),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  source text,
  chunk_id uuid,
  title text,
  content text,
  score double precision
)
LANGUAGE sql STABLE
AS $$
  SELECT
    'bio' AS source,
    bc.id AS chunk_id,
    COALESCE(bc.heading, bc.section) AS title,
    bc.content,
    1.0 - (bc.embedding <=> query_embedding) AS score
  FROM bio_chunks bc
  WHERE bc.embedding IS NOT NULL

  UNION ALL

  SELECT
    'resume' AS source,
    rc.id AS chunk_id,
    rc.title || COALESCE(' @ ' || rc.organization, '') AS title,
    rc.content,
    1.0 - (rc.embedding <=> query_embedding) AS score
  FROM resume_chunks rc
  WHERE rc.embedding IS NOT NULL

  UNION ALL

  SELECT
    'project' AS source,
    p.id AS chunk_id,
    p.display_name AS title,
    COALESCE(p.body_md, p.description, '') AS content,
    1.0 - (p.readme_embedding <=> query_embedding) AS score
  FROM projects p
  WHERE p.readme_embedding IS NOT NULL

  ORDER BY score DESC
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_chunks(vector(1024), int) TO service_role;

-- ============================================================
-- Verification (run after applying via supabase db push)
-- ============================================================
-- (a) Function exists in the public schema
--   SELECT proname, prorettype::regtype FROM pg_proc
--    WHERE proname = 'match_chunks';
--   -> 1 row, returns SETOF record
--
-- (b) Service role has EXECUTE
--   SELECT routine_name, grantee, privilege_type
--     FROM information_schema.routine_privileges
--    WHERE routine_name = 'match_chunks';
--   -> service_role / EXECUTE
--
-- (c) Smoke call (needs a real 1024-dim vector — easiest via the TS wrapper
--     in src/lib/db/match.ts, run with `npx tsx -e ...` per the slice plan)
