-- Phase 1: Announcement Organization System
-- Migration: 20260415_announcement_folders_tags.sql
-- Creates hierarchical folders, flat tags, and archive support

-- ============================================================================
-- 1. Create announcement_folders table (hierarchical structure)
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcement_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Folder',              -- Lucide icon name (NOT emoji)
  color TEXT DEFAULT '#6B7280',
  parent_id UUID REFERENCES announcement_folders(id) ON DELETE CASCADE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcement_folders_parent_id ON announcement_folders(parent_id);
CREATE INDEX idx_announcement_folders_sort_order ON announcement_folders(sort_order);

-- ============================================================================
-- 2. Create announcement_tags table (flat structure with UNIQUE constraint)
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcement_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,               -- Prevents duplicate tags
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcement_tags_name ON announcement_tags(name);

-- ============================================================================
-- 3. Create announcement_tag_assignments junction table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcement_tag_assignments (
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES announcement_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (announcement_id, tag_id)   -- Prevents duplicate assignments
);

CREATE INDEX idx_announcement_tag_assignments_announcement ON announcement_tag_assignments(announcement_id);
CREATE INDEX idx_announcement_tag_assignments_tag ON announcement_tag_assignments(tag_id);

-- ============================================================================
-- 4. Alter announcements table (add folder + archive support)
-- ============================================================================

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES announcement_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX idx_announcements_folder_id ON announcements(folder_id);
CREATE INDEX idx_announcements_archived_at ON announcements(archived_at)
  WHERE archived_at IS NOT NULL;

-- ============================================================================
-- 5. Enable RLS on all 3 new tables
-- ============================================================================

ALTER TABLE announcement_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Folder policies: Authenticated can SELECT, Admin roles can ALL
CREATE POLICY "announcement_folders_select"
  ON announcement_folders FOR SELECT
  USING (true);

CREATE POLICY "announcement_folders_admin_all"
  ON announcement_folders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin')
    )
  );

-- Tag policies: Authenticated can SELECT, Admin roles can ALL
CREATE POLICY "announcement_tags_select"
  ON announcement_tags FOR SELECT
  USING (true);

CREATE POLICY "announcement_tags_admin_all"
  ON announcement_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin')
    )
  );

-- Tag assignment policies: Authenticated can SELECT, Admin roles can ALL
CREATE POLICY "announcement_tag_assignments_select"
  ON announcement_tag_assignments FOR SELECT
  USING (true);

CREATE POLICY "announcement_tag_assignments_admin_all"
  ON announcement_tag_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin')
    )
  );

-- ============================================================================
-- 6. Create Storage bucket for announcement cover images
-- ============================================================================

-- Create public bucket for announcement cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-covers', 'announcement-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for announcement-covers bucket
CREATE POLICY "announcement_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'announcement-covers');

CREATE POLICY "announcement_covers_admin_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'announcement-covers' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin')
    )
  );

-- ============================================================================
-- 7. Seed default data
-- ============================================================================

-- 6 folders from mockup (using Lucide icon names)
INSERT INTO announcement_folders (name, icon, color, sort_order) VALUES
  ('กิจกรรม', 'PartyPopper', '#3b82f6', 1),
  ('ซ่อมบำรุง', 'Wrench', '#f59e0b', 2),
  ('ข่าวสาร', 'Newspaper', '#10b981', 3),
  ('ประกาศด่วน', 'AlertTriangle', '#ef4444', 4),
  ('ทั่วไป', 'Pin', '#6B7280', 5),
  ('อื่นๆ', 'Archive', '#8b5cf6', 6);

-- 5 tags from mockup
INSERT INTO announcement_tags (name, color) VALUES
  ('ค่าห้อง', '#3b82f6'),
  ('กิจกรรม', '#10b981'),
  ('ปิดหอ', '#f59e0b'),
  ('ฉุกเฉิน', '#ef4444'),
  ('Covid-19', '#8b5cf6');
