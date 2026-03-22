-- Knowledge Base v3: Folders & Tags
-- Phase A: Add folder hierarchy, document tags, and folder_id/version to documents

-- ============================================================================
-- Folders (hierarchical)
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES knowledge_folders(id) ON DELETE CASCADE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE knowledge_folders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read folders
CREATE POLICY "knowledge_folders_select" ON knowledge_folders
  FOR SELECT TO authenticated USING (true);

-- Admin full access (via is_admin() or adminClient bypass)
CREATE POLICY "knowledge_folders_admin_all" ON knowledge_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'head')
    )
  );

-- ============================================================================
-- Document Tags
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_tags_select" ON document_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "document_tags_admin_all" ON document_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'head')
    )
  );

-- ============================================================================
-- Junction: document <-> tags (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_tag_assignments (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES document_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

ALTER TABLE document_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_tag_assignments_select" ON document_tag_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "document_tag_assignments_admin_all" ON document_tag_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'head')
    )
  );

-- ============================================================================
-- Add folder_id + version to existing documents table
-- ============================================================================

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES knowledge_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';

-- Index for folder lookups
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);

-- Index for folder tree lookups
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_parent_id ON knowledge_folders(parent_id);

-- ============================================================================
-- Seed default folders (matching Figma design)
-- ============================================================================

INSERT INTO knowledge_folders (name, sort_order) VALUES
  ('กฏหอพัก', 1),
  ('คู่มือนิสิต', 2),
  ('แบบฟอร์ม', 3),
  ('ประกาศ', 4),
  ('FAQs', 5),
  ('อื่นๆ', 6);
