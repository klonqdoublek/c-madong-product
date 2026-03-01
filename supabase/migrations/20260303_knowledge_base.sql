-- Extend documents table with file-related columns
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS filename TEXT,
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT;

-- Create storage bucket for knowledge base documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('dorm-knowledge', 'dorm-knowledge', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload/read
CREATE POLICY "knowledge_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dorm-knowledge');

CREATE POLICY "knowledge_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dorm-knowledge');

CREATE POLICY "knowledge_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dorm-knowledge');
