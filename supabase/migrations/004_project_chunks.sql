-- 004_project_chunks.sql
-- Slice 4.2.x (Path B) — per-section project README chunking.
--
-- Adds a sister table to bio_chunks + resume_chunks so retrieval can match
-- against specific README sections (Architecture / Quickstart / Evaluation /
-- etc.) rather than only the top-level 1-paragraph project description.
--
-- Why a free-text `section` column instead of a CHECK constraint:
-- README structure is heterogeneous across the 4 projects — each project's H2
-- headings are its own. A fixed enum would force a Procrustean bed. The
-- writer (src/lib/db/project-readme-chunks.ts) is the source of truth for
-- what sections exist.
--
-- Run via: cd app && npx supabase db push --include-all

CREATE TABLE IF NOT EXISTS project_chunks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section              text NOT NULL,
  content              text NOT NULL,
  display_order        int  NOT NULL DEFAULT 0,
  embedding            vector(1024),
  embedding_updated_at timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER project_chunks_updated_at
  BEFORE UPDATE ON project_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS project_chunks_embedding_idx
  ON project_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS project_chunks_project_id_idx
  ON project_chunks (project_id);

ALTER TABLE project_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project chunks are public" ON project_chunks;
CREATE POLICY "Project chunks are public"
  ON project_chunks FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Verification (run after applying via supabase db push --include-all)
-- ============================================================
-- (a) Table exists
--   SELECT table_name FROM information_schema.tables
--    WHERE table_schema='public' AND table_name='project_chunks';
--   -> 1 row
--
-- (b) HNSW index exists on embedding
--   SELECT indexname FROM pg_indexes
--    WHERE schemaname='public' AND indexname='project_chunks_embedding_idx';
--   -> 1 row
--
-- (c) RLS enabled + anon SELECT policy
--   SELECT tablename, rowsecurity FROM pg_tables
--    WHERE schemaname='public' AND tablename='project_chunks';
--   -> rowsecurity = true
--
-- (d) FK cascade behavior: deleting a project row should cascade-delete its
--     project_chunks rows. Smoke this in a transaction:
--     BEGIN;
--     DELETE FROM projects WHERE id = '<some uuid>';
--     SELECT count(*) FROM project_chunks WHERE project_id = '<same uuid>';
--     -> 0 rows
--     ROLLBACK;
