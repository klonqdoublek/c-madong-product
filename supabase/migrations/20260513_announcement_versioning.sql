-- Announcement versioning schema
-- Enables tracking versions of announcements for bot library management

ALTER TABLE announcements
  ADD COLUMN parent_announcement_id uuid REFERENCES announcements(id) ON DELETE SET NULL,
  ADD COLUMN version_number integer NOT NULL DEFAULT 1,
  ADD COLUMN is_current boolean NOT NULL DEFAULT true;

CREATE INDEX idx_announcements_parent_id ON announcements(parent_announcement_id);
CREATE INDEX idx_announcements_is_current ON announcements(is_current) WHERE is_current = true;

COMMENT ON COLUMN announcements.parent_announcement_id IS 'FK to parent announcement for version tracking. NULL if this is the root version.';
COMMENT ON COLUMN announcements.version_number IS 'Version number within the version chain. Starts at 1 for root.';
COMMENT ON COLUMN announcements.is_current IS 'True if this is the latest version. Only one row per parent should have true.';
