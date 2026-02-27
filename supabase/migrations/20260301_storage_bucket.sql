-- Create maintenance-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-photos', 'maintenance-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'maintenance-photos');

-- Public can read maintenance photos
CREATE POLICY "Public can read maintenance photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'maintenance-photos');

-- Users can delete own photos (folder = their user id)
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'maintenance-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role full access
CREATE POLICY "Service role full access to maintenance photos"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'maintenance-photos');
