ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS carousel_images text[] DEFAULT '{}';
