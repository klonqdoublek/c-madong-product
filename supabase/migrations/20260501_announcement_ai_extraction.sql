-- Announcement AI Extraction: OCR + embedding for bot RAG

-- Ensure pgvector accessible in this session's search_path
SET search_path = public, extensions;

-- 1. Extend announcements table
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS ai_extracted jsonb,
  ADD COLUMN IF NOT EXISTS ai_confidence numeric(3,2),
  ADD COLUMN IF NOT EXISTS ai_provider text,
  ADD COLUMN IF NOT EXISTS extraction_mode text,
  ADD COLUMN IF NOT EXISTS ocr_text text,
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS is_bot_searchable boolean DEFAULT true;

-- 2. HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS announcements_embedding_idx
  ON announcements USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL AND is_bot_searchable = true AND archived_at IS NULL;

-- 3. AI feedback table (mirrors knowledge ai_upload_feedback pattern)
CREATE TABLE IF NOT EXISTS announcement_ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  rating text CHECK (rating IN ('up', 'down')),
  accepted_fields text[],
  rejected_fields text[],
  comment text,
  suggestion_snapshot jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcement_ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY announcement_ai_feedback_admin ON announcement_ai_feedback
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4. Extend match_documents to UNION with announcements for bot RAG
-- Drop old version first (signature changed)
DROP FUNCTION IF EXISTS match_documents(vector, integer, double precision);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 8,
  match_threshold double precision DEFAULT 0.2
)
RETURNS TABLE (
  source_type text,
  source_id uuid,
  document_title text,
  content text,
  cover_image text,
  similarity double precision,
  metadata jsonb
)
LANGUAGE sql STABLE AS $$
  -- Document sections (existing knowledge base)
  SELECT
    'document'::text AS source_type,
    d.id AS source_id,
    d.title AS document_title,
    ds.content AS content,
    NULL::text AS cover_image,
    1 - (ds.embedding <=> query_embedding) AS similarity,
    ds.metadata AS metadata
  FROM document_sections ds
  JOIN documents d ON d.id = ds.document_id
  WHERE d.status = 'ready'
    AND 1 - (ds.embedding <=> query_embedding) > match_threshold

  UNION ALL

  -- Published, bot-searchable announcements
  SELECT
    'announcement'::text AS source_type,
    a.id AS source_id,
    COALESCE(a.title_th, a.title_en) AS document_title,
    COALESCE(a.content_th, a.content_en, a.ocr_text, '') AS content,
    a.cover_image AS cover_image,
    1 - (a.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'event_date', a.event_date,
      'category', a.category,
      'published_at', a.published_at,
      'is_pinned', a.is_pinned
    ) AS metadata
  FROM announcements a
  WHERE a.embedding IS NOT NULL
    AND a.is_bot_searchable = true
    AND a.status = 'sent'
    AND a.archived_at IS NULL
    AND 1 - (a.embedding <=> query_embedding) > match_threshold

  ORDER BY similarity DESC
  LIMIT match_count;
$$;
