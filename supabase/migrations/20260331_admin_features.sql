-- ============================================================
-- Admin Features Migration
-- 1. app_settings — key-value config (AI settings, etc.)
-- 2. chat_escalations — live chat handoff tracking
-- 3. ai_chat_messages — add sender_type + sender_id columns
-- ============================================================

-- ============================================================
-- 1. App Settings (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS (read/write via adminClient anyway, but safety net)
CREATE POLICY "Admins can read app_settings"
  ON public.app_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update app_settings"
  ON public.app_settings FOR ALL
  USING (public.is_admin());

-- Seed default AI settings
INSERT INTO public.app_settings (key, value) VALUES
  ('ai.primary_model', '"gpt-4o-mini"'),
  ('ai.temperature', '0.7'),
  ('ai.response_length', '"standard"'),
  ('ai.vision_enabled', 'true'),
  ('ai.vision_confidence', '0.7'),
  ('ai.tone_preset', '"friendly"'),
  ('ai.custom_instructions', '""'),
  ('ai.intent_threshold', '0.7'),
  ('ai.auto_escalate', 'false'),
  ('ai.escalate_threshold', '0.5')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 2. Chat Escalations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  student_id UUID REFERENCES auth.users(id),
  admin_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'active', 'closed')),
  reason TEXT NOT NULL DEFAULT 'user_request',
  ai_context JSONB DEFAULT '{}',
  closed_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_escalations_status ON public.chat_escalations(status, created_at);
CREATE INDEX idx_escalations_student ON public.chat_escalations(student_id);

ALTER TABLE public.chat_escalations ENABLE ROW LEVEL SECURITY;

-- Students can see their own escalations
CREATE POLICY "Students can view own escalations"
  ON public.chat_escalations FOR SELECT
  USING (auth.uid() = student_id);

-- Admins can view/manage all escalations
CREATE POLICY "Admins can manage escalations"
  ON public.chat_escalations FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 3. Extend ai_chat_messages for admin replies
-- ============================================================
ALTER TABLE public.ai_chat_messages
  ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'ai'
    CHECK (sender_type IN ('ai', 'user', 'admin', 'system')),
  ADD COLUMN IF NOT EXISTS sender_id UUID;

-- Index for polling new messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_created
  ON public.ai_chat_messages(created_at);
