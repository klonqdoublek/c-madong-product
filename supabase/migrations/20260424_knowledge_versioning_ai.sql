-- Knowledge base versioning + AI suggestion audit
-- Adds self-FK versioning on documents and feedback table for AI upload suggestions

-- ─── Versioning columns on documents ────────────────────────────
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1;

-- Index for version history queries (parent chain + filter current)
CREATE INDEX IF NOT EXISTS idx_documents_parent_current
  ON public.documents(parent_document_id, is_current);

-- ─── AI suggestion audit trail on documents ─────────────────────
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS ai_suggestion JSONB,
  ADD COLUMN IF NOT EXISTS ai_applied_at TIMESTAMPTZ;

-- ─── Feedback table for AI upload suggestions ───────────────────
CREATE TABLE IF NOT EXISTS public.ai_upload_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  comment TEXT,
  suggestion_snapshot JSONB,
  accepted_fields TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_upload_feedback_document
  ON public.ai_upload_feedback(document_id);

CREATE INDEX IF NOT EXISTS idx_ai_upload_feedback_created_at
  ON public.ai_upload_feedback(created_at DESC);

-- RLS: admin only (read + insert)
ALTER TABLE public.ai_upload_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read ai_upload_feedback" ON public.ai_upload_feedback;
CREATE POLICY "Admin read ai_upload_feedback" ON public.ai_upload_feedback
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin insert ai_upload_feedback" ON public.ai_upload_feedback;
CREATE POLICY "Admin insert ai_upload_feedback" ON public.ai_upload_feedback
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
