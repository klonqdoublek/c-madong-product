-- =====================================================
-- Migration: Repair Templates & Vision Analysis
-- Created: 2026-03-18
-- Purpose: Enable AI vision analysis for repair requests
-- =====================================================

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Supabase installs pgvector in extensions schema; include in search_path
SET search_path TO public, extensions;

-- =====================================================
-- Table: repair_templates
-- Purpose: Store template images for repair categorization
-- =====================================================
CREATE TABLE IF NOT EXISTS repair_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('plumbing', 'electrical', 'aircon', 'furniture', 'pest', 'internet', 'other')),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  usage_count integer DEFAULT 0,
  accuracy_score numeric DEFAULT 1.0 CHECK (accuracy_score >= 0.0 AND accuracy_score <= 1.0),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Indexes
-- =====================================================

-- B-tree index for category filtering
CREATE INDEX IF NOT EXISTS repair_templates_category_idx ON repair_templates(category);

-- IVFFlat index for vector similarity search
-- lists=100 is optimal for 500-1000 templates
CREATE INDEX IF NOT EXISTS repair_templates_embedding_idx ON repair_templates
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- RPC: match_repair_templates
-- Purpose: Find similar repair templates using vector search
-- =====================================================
CREATE OR REPLACE FUNCTION match_repair_templates(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.85,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  category text,
  title text,
  description text,
  image_url text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    category,
    title,
    description,
    image_url,
    1 - (embedding <=> query_embedding) AS similarity
  FROM repair_templates
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- =====================================================
-- RPC: decrease_template_accuracy
-- Purpose: Reduce accuracy score when template leads to wrong categorization
-- =====================================================
CREATE OR REPLACE FUNCTION decrease_template_accuracy(
  template_id uuid
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE repair_templates
  SET
    accuracy_score = GREATEST(0.0, accuracy_score - 0.1),
    updated_at = now()
  WHERE id = template_id;
$$;

-- =====================================================
-- RPC: increase_template_usage
-- Purpose: Track template usage for analytics
-- =====================================================
CREATE OR REPLACE FUNCTION increase_template_usage(
  template_id uuid
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE repair_templates
  SET
    usage_count = usage_count + 1,
    updated_at = now()
  WHERE id = template_id;
$$;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
ALTER TABLE repair_templates ENABLE ROW LEVEL SECURITY;

-- Public read for all authenticated users
CREATE POLICY "Authenticated users can read repair templates"
  ON repair_templates FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage repair templates"
  ON repair_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'head_admin', 'super_admin')
    )
  );

-- =====================================================
-- Add vision analysis fields to maintenance_requests
-- =====================================================
DO $$
BEGIN
  -- Add ai_confidence field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_requests'
    AND column_name = 'ai_confidence'
  ) THEN
    ALTER TABLE maintenance_requests
    ADD COLUMN ai_confidence numeric CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0);
  END IF;

  -- Add ai_provider field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_requests'
    AND column_name = 'ai_provider'
  ) THEN
    ALTER TABLE maintenance_requests
    ADD COLUMN ai_provider text CHECK (ai_provider IN ('template', 'gemini', 'openai', 'text-only', 'keyword', 'fallback'));
  END IF;

  -- Add template_id field if not exists (reference to matched template)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_requests'
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE maintenance_requests
    ADD COLUMN template_id uuid REFERENCES repair_templates(id);
  END IF;

  -- Add damage_details field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_requests'
    AND column_name = 'damage_details'
  ) THEN
    ALTER TABLE maintenance_requests
    ADD COLUMN damage_details text;
  END IF;
END $$;

-- =====================================================
-- Updated_at trigger for repair_templates
-- =====================================================
CREATE OR REPLACE FUNCTION update_repair_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER repair_templates_updated_at
  BEFORE UPDATE ON repair_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_templates_updated_at();

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE repair_templates IS 'Template images for AI-powered repair categorization using vector similarity';
COMMENT ON COLUMN repair_templates.embedding IS 'Vector embedding (OpenAI text-embedding-3-small) for similarity search';
COMMENT ON COLUMN repair_templates.accuracy_score IS 'Accuracy score (0.0-1.0) based on admin feedback, decreases on wrong categorization';
COMMENT ON COLUMN repair_templates.usage_count IS 'Number of times this template was matched';
COMMENT ON FUNCTION match_repair_templates IS 'Find similar repair templates using cosine similarity';
COMMENT ON FUNCTION decrease_template_accuracy IS 'Reduce accuracy score by 0.1 when template leads to incorrect categorization';
COMMENT ON FUNCTION increase_template_usage IS 'Increment usage count when template is matched';
