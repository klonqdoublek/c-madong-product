-- Fix: restrict dorm-knowledge storage uploads to admin roles only
-- Previously allowed any authenticated user to upload/delete

DO $$
BEGIN
  -- Drop overly-permissive policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'knowledge_upload'
  ) THEN
    DROP POLICY "knowledge_upload" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'knowledge_delete'
  ) THEN
    DROP POLICY "knowledge_delete" ON storage.objects;
  END IF;
END $$;

-- Admin-only upload
CREATE POLICY "knowledge_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dorm-knowledge'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );

-- Admin-only delete
CREATE POLICY "knowledge_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'dorm-knowledge'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );
