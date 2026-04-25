-- Repair Flow v3 Enhancements
-- 1. ticket_code (AA######) with DB trigger
-- 2. materials JSONB field
-- 3. specific_item for granular icons
-- 4. status: replace 'pending' with 'under_review' (forced review gate)
-- 5. repair_templates: default_materials + specific_item

-- ============================================================
-- 1. Ticket code generator function + trigger
-- ============================================================

CREATE OR REPLACE FUNCTION gen_ticket_code()
RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  letters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  code text;
  attempt int := 0;
BEGIN
  LOOP
    code :=
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      lpad(floor(random() * 1000000)::int::text, 6, '0');

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM maintenance_requests WHERE ticket_code = code
    );

    attempt := attempt + 1;
    IF attempt > 20 THEN
      RAISE EXCEPTION 'gen_ticket_code: failed to generate unique code after 20 attempts';
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION trg_set_ticket_code()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := gen_ticket_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS maintenance_requests_set_ticket_code ON maintenance_requests;
CREATE TRIGGER maintenance_requests_set_ticket_code
  BEFORE INSERT ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION trg_set_ticket_code();

-- ============================================================
-- 2. New columns on maintenance_requests
-- ============================================================

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS ticket_code          text UNIQUE,
  ADD COLUMN IF NOT EXISTS materials            jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requisition_url      text,
  ADD COLUMN IF NOT EXISTS requisition_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS specific_item        text;

-- ============================================================
-- 3. Status migration: pending → under_review (forced gate)
-- ============================================================

-- Drop old inline CHECK (auto-named by Postgres)
ALTER TABLE maintenance_requests
  DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;

-- Backfill pending → under_review BEFORE adding new constraint
UPDATE maintenance_requests SET status = 'under_review' WHERE status = 'pending';

-- New default
ALTER TABLE maintenance_requests
  ALTER COLUMN status SET DEFAULT 'under_review';

-- New CHECK constraint (5 values, no 'pending')
ALTER TABLE maintenance_requests
  ADD CONSTRAINT maintenance_requests_status_check
  CHECK (status IN ('under_review', 'acknowledged', 'in_progress', 'completed', 'cancelled'));

-- ============================================================
-- 4. Backfill ticket_code for existing rows
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM maintenance_requests WHERE ticket_code IS NULL ORDER BY created_at LOOP
    UPDATE maintenance_requests
      SET ticket_code = gen_ticket_code()
      WHERE id = r.id;
  END LOOP;
END;
$$;

-- Index for fast lookups by ticket_code
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_ticket_code
  ON maintenance_requests(ticket_code);

-- ============================================================
-- 5. repair_templates: add default_materials + specific_item
-- ============================================================

ALTER TABLE repair_templates
  ADD COLUMN IF NOT EXISTS default_materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specific_item     text;

-- Seed default_materials by category
UPDATE repair_templates SET
  default_materials = '[
    {"name":"เทป PTFE","quantity":1,"unit":"ม้วน"},
    {"name":"กาวซิลิโคน","quantity":1,"unit":"หลอด"},
    {"name":"ประแจปากตาย","quantity":1,"unit":"ชิ้น"}
  ]'::jsonb
WHERE category = 'plumbing';

UPDATE repair_templates SET
  default_materials = '[
    {"name":"เทปพันสาย","quantity":1,"unit":"ม้วน"},
    {"name":"สกรู","quantity":4,"unit":"ตัว"}
  ]'::jsonb
WHERE category = 'electrical';

UPDATE repair_templates SET
  default_materials = '[
    {"name":"น้ำยาล้างแอร์","quantity":1,"unit":"กระป๋อง"}
  ]'::jsonb
WHERE category = 'aircon';

UPDATE repair_templates SET
  default_materials = '[
    {"name":"สกรู","quantity":6,"unit":"ตัว"},
    {"name":"น้ำมันหล่อลื่น WD-40","quantity":1,"unit":"กระป๋อง"}
  ]'::jsonb
WHERE category = 'furniture';

UPDATE repair_templates SET
  default_materials = '[
    {"name":"ยาฆ่าแมลง","quantity":1,"unit":"กระป๋อง"}
  ]'::jsonb
WHERE category = 'pest';

-- Specific items for common furniture templates
UPDATE repair_templates SET specific_item = 'door'
  WHERE category = 'furniture' AND (title ILIKE '%ประตู%' OR title ILIKE '%door%');

UPDATE repair_templates SET specific_item = 'faucet'
  WHERE category = 'plumbing' AND (title ILIKE '%ก๊อก%' OR title ILIKE '%faucet%');

UPDATE repair_templates SET specific_item = 'pipe'
  WHERE category = 'plumbing' AND (title ILIKE '%ท่อ%' OR title ILIKE '%pipe%');

UPDATE repair_templates SET specific_item = 'light_switch'
  WHERE category = 'electrical' AND (title ILIKE '%สวิตช์%' OR title ILIKE '%switch%');

UPDATE repair_templates SET specific_item = 'ac_unit'
  WHERE category = 'aircon';

-- ============================================================
-- 6. Storage bucket for requisitions (admin-only)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'repair-requisitions',
  'repair-requisitions',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf', 'text/html', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can manage repair requisitions"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'repair-requisitions'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );
