-- Prajna Shetty Portfolio — Initial Schema
-- Run via: Supabase Dashboard > SQL Editor > New query > paste > Run

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_repo     text NOT NULL UNIQUE,
  display_name    text NOT NULL,
  description     text,
  tech_stack      text[] NOT NULL DEFAULT '{}',
  metrics         jsonb NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'published', 'hidden', 'featured')),
  readme_raw      text,
  readme_embedding vector(1024),
  featured_order  int,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- HNSW index for cosine similarity (RAG + NL filter)
CREATE INDEX IF NOT EXISTS projects_embedding_idx
  ON projects USING hnsw (readme_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- BLOG POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  content_md        text,
  tldr              text,
  tags              text[] NOT NULL DEFAULT '{}',
  content_embedding vector(1024),
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_embedding_idx
  ON blog_posts USING hnsw (content_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- VISITOR EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       text NOT NULL,
  persona          text CHECK (persona IN ('recruiter', 'engineer', 'founder', 'unknown')),
  sections_viewed  text[] NOT NULL DEFAULT '{}',
  time_on_section  jsonb NOT NULL DEFAULT '{}',
  project_clicks   text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_events_session_idx ON visitor_events (session_id);
CREATE INDEX IF NOT EXISTS visitor_events_persona_idx ON visitor_events (persona);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public projects are visible" ON projects;
CREATE POLICY "Public projects are visible"
  ON projects FOR SELECT TO anon
  USING (status IN ('published', 'featured'));

DROP POLICY IF EXISTS "Published posts are visible" ON blog_posts;
CREATE POLICY "Published posts are visible"
  ON blog_posts FOR SELECT TO anon
  USING (published_at IS NOT NULL AND published_at <= now());

DROP POLICY IF EXISTS "Anyone can log events" ON visitor_events;
CREATE POLICY "Anyone can log events"
  ON visitor_events FOR INSERT TO anon
  WITH CHECK (true);

-- Verify after running:
-- SELECT extname FROM pg_extension WHERE extname = 'vector';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
