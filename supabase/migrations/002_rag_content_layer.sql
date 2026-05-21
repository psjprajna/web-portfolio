-- 002_rag_content_layer.sql
-- Slice 4.0 — Prepares the schema for RAG over three surfaces:
--   1. projects     (the curated grid; now also accepts resume-only projects)
--   2. bio_chunks   (about / lineage / arsenal copy from the website)
--   3. resume_chunks(work experience, resume projects, education, skills)
--
-- Plus rag_queries for evaluation + production telemetry.
-- Leaves blog_posts untouched (deferred to a later phase).
--
-- Run via: Supabase Dashboard > SQL Editor > New query > paste > Run
-- Verification queries are at the bottom of this file.

-- ============================================================
-- 1. PROJECTS — accept resume-only projects (no GitHub repo)
-- ============================================================

-- Resume mentions projects that aren't on GitHub. Make github_repo optional.
ALTER TABLE projects
  ALTER COLUMN github_repo DROP NOT NULL;

-- Replace the table-level UNIQUE with a partial unique index so multiple
-- rows with NULL github_repo are allowed (the old UNIQUE forbids that on
-- some Postgres configurations and is semantically wrong here).
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_github_repo_key;

CREATE UNIQUE INDEX IF NOT EXISTS projects_github_repo_uidx
  ON projects (github_repo)
  WHERE github_repo IS NOT NULL;

-- Where did this project's content come from?
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('github', 'manual', 'resume'));

-- Canonical body for the project. readme_raw stays as historical input;
-- body_md is what we embed and what the site renders.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS body_md text;

-- Track when the embedding was last recomputed (so the ops script can
-- find stale rows: WHERE embedding_updated_at < updated_at OR ... IS NULL).
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- One-time backfill: copy readme_raw into body_md for any existing rows.
UPDATE projects
   SET body_md = readme_raw
 WHERE body_md IS NULL
   AND readme_raw IS NOT NULL;

-- ============================================================
-- 2. BIO CHUNKS — about / lineage / arsenal copy from the website
-- ============================================================
-- These mirror the curated copy in src/lib/data/. We embed them so RAG
-- can answer questions whose answer lives in the bio, not in a project.

CREATE TABLE IF NOT EXISTS bio_chunks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section              text NOT NULL
                         CHECK (section IN ('about','lineage','arsenal','contact','hero','other')),
  heading              text,
  content              text NOT NULL,
  display_order        int  NOT NULL DEFAULT 0,
  embedding            vector(1024),
  embedding_updated_at timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER bio_chunks_updated_at
  BEFORE UPDATE ON bio_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS bio_chunks_embedding_idx
  ON bio_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS bio_chunks_section_idx
  ON bio_chunks (section);

-- ============================================================
-- 3. RESUME CHUNKS — work experience + resume projects + education + skills
-- ============================================================
-- One row per logical resume unit (one role, one resume-project, one
-- education entry, one skill cluster). chunk_type is the discriminator.

CREATE TABLE IF NOT EXISTS resume_chunks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_type           text NOT NULL
                         CHECK (chunk_type IN (
                           'summary',
                           'experience',
                           'project',
                           'education',
                           'skill_group',
                           'certification',
                           'other'
                         )),
  title                text NOT NULL,
  organization         text,
  date_range           text,
  start_date           date,
  end_date             date,
  content              text NOT NULL,
  tech_stack           text[] NOT NULL DEFAULT '{}',
  display_order        int    NOT NULL DEFAULT 0,
  embedding            vector(1024),
  embedding_updated_at timestamptz,
  source_file          text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER resume_chunks_updated_at
  BEFORE UPDATE ON resume_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS resume_chunks_embedding_idx
  ON resume_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS resume_chunks_type_idx
  ON resume_chunks (chunk_type);

CREATE INDEX IF NOT EXISTS resume_chunks_date_idx
  ON resume_chunks (end_date DESC NULLS FIRST, start_date DESC);

-- ============================================================
-- 4. RAG QUERIES — telemetry for evals + production observability
-- ============================================================

CREATE TABLE IF NOT EXISTS rag_queries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query               text NOT NULL,
  retrieved_ids       jsonb NOT NULL DEFAULT '[]'::jsonb,
  response            text,
  latency_ms          int,
  model               text,
  prompt_version      text,
  relevance_top_score double precision,
  refused             boolean NOT NULL DEFAULT false,
  session_id          text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rag_queries_created_at_idx
  ON rag_queries (created_at DESC);

CREATE INDEX IF NOT EXISTS rag_queries_refused_idx
  ON rag_queries (refused) WHERE refused = true;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
-- bio_chunks and resume_chunks are public-by-design: the site renders
-- the same content already, and a recruiter pulling the resume PDF sees
-- the same text. The service role (server-side) does all writes.

ALTER TABLE bio_chunks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_queries   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bio chunks are public" ON bio_chunks;
CREATE POLICY "Bio chunks are public"
  ON bio_chunks FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Resume chunks are public" ON resume_chunks;
CREATE POLICY "Resume chunks are public"
  ON resume_chunks FOR SELECT TO anon
  USING (true);

-- rag_queries: anon can INSERT (the Worker logs each query) but never
-- SELECT (one visitor must not read another visitor's questions). The
-- eval harness reads via the service role, which bypasses RLS.
DROP POLICY IF EXISTS "Anyone can log a query" ON rag_queries;
CREATE POLICY "Anyone can log a query"
  ON rag_queries FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- 6. VERIFICATION QUERIES — run these after the migration
-- ============================================================
-- Expected results inline.

-- (a) projects.github_repo is now nullable
--   SELECT is_nullable FROM information_schema.columns
--    WHERE table_name='projects' AND column_name='github_repo';
--   -> YES

-- (b) New columns exist on projects
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name='projects'
--      AND column_name IN ('source','body_md','embedding_updated_at');
--   -> 3 rows

-- (c) New tables exist
--   SELECT table_name FROM information_schema.tables
--    WHERE table_schema='public'
--      AND table_name IN ('bio_chunks','resume_chunks','rag_queries');
--   -> 3 rows

-- (d) HNSW indexes exist on every embedding column
--   SELECT indexname FROM pg_indexes
--    WHERE schemaname='public'
--      AND indexname LIKE '%embedding%';
--   -> projects_embedding_idx, bio_chunks_embedding_idx, resume_chunks_embedding_idx
--      (plus blog_embedding_idx from 001 — fine)

-- (e) RLS is enabled on the new tables
--   SELECT tablename, rowsecurity FROM pg_tables
--    WHERE schemaname='public'
--      AND tablename IN ('bio_chunks','resume_chunks','rag_queries');
--   -> all rowsecurity = true

-- (f) Anon CANNOT insert into projects (RLS rejection — sanity check)
--   In the SQL editor, switch role to anon and try:
--     INSERT INTO projects (display_name) VALUES ('hack');
--   -> ERROR: new row violates row-level security policy
