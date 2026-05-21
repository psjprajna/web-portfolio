-- 005_match_chunks_with_readmes.sql
-- Slice 4.2.x (Path B) — extend match_chunks RPC to include project_chunks.
--
-- Same signature as migration 003 (vector(1024), int) so existing RPC clients
-- (src/lib/db/match.ts, the /api/ai/rag route) keep working unchanged. Only
-- the result set widens: 4 UNION ALL branches instead of 3 (bio + resume +
-- project + project_readme).
--
-- The project_readme branch joins projects so the title carries enough
-- context for the UI's source-footer dedup logic:
--   "project_readme · UAE Government Policy RAG — Architecture"
-- rather than the bare section heading "Architecture" which would collide
-- across projects.
--
-- Run via: cd app && npx supabase db push --include-all

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

  UNION ALL

  SELECT
    'project_readme' AS source,
    pc.id AS chunk_id,
    p.display_name || ' — ' || pc.section AS title,
    pc.content,
    1.0 - (pc.embedding <=> query_embedding) AS score
  FROM project_chunks pc
  JOIN projects p ON p.id = pc.project_id
  WHERE pc.embedding IS NOT NULL

  ORDER BY score DESC
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_chunks(vector(1024), int) TO service_role;

-- ============================================================
-- Verification (run after applying via supabase db push --include-all)
-- ============================================================
-- (a) Function signature unchanged
--   SELECT pg_get_function_arguments(oid) FROM pg_proc WHERE proname = 'match_chunks';
--   -> "query_embedding vector, match_count integer DEFAULT 5"
--
-- (b) Smoke call — the RPC should now return rows from 4 sources (once
--     project_chunks has embedded rows; before the first `npm run embed
--     readmes` it returns the same 3-source results as 003).
--   Run via the TS wrapper in src/lib/db/match.ts.
