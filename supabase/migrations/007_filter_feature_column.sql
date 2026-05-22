-- Migration 007: feature column on rag_queries
--
-- Adds a NOT NULL text column so multiple AI features (RAG synthesis, NL project
-- filter, future explain/persona) can share one telemetry table while remaining
-- sliceable in analytics via a simple WHERE feature = '<name>' filter.
--
-- Defaults to 'rag' so pre-Slice-4.3 inserts and any existing rows remain valid.
-- New features added by extending the CHECK constraint, not by table-per-feature
-- proliferation.

ALTER TABLE rag_queries
  ADD COLUMN IF NOT EXISTS feature text
    NOT NULL DEFAULT 'rag'
    CHECK (feature IN ('rag', 'filter'));

COMMENT ON COLUMN rag_queries.feature IS
  'Which AI feature produced this row. ''rag'' = RAG synthesis. ''filter'' = NL project filter. Extend CHECK constraint when adding new features.';
