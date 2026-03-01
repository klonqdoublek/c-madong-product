-- Extend announcements table with messaging fields
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS flex_json JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'broadcast',
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  flex_json JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON public.message_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "templates_insert" ON public.message_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );

CREATE POLICY "templates_update" ON public.message_templates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );

CREATE POLICY "templates_delete" ON public.message_templates
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );
