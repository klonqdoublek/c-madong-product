-- Tags table for categorizing students
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read tags
CREATE POLICY "tags_select" ON public.tags
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "tags_insert" ON public.tags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );

CREATE POLICY "tags_update" ON public.tags
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );

CREATE POLICY "tags_delete" ON public.tags
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'head'))
  );
