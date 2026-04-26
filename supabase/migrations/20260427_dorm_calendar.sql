-- ============================================================
-- Dorm Calendar: mandatory student tasks with deadline tracking
-- ============================================================

-- ENUMs
CREATE TYPE dorm_calendar_category AS ENUM (
  'reapplication',
  'cr54_upload',
  'shop_evaluation',
  'fire_drill_theory',
  'fire_drill_practical',
  'dorm_meeting',
  'dorm_inspection',
  'important_announcement'
);

CREATE TYPE calendar_cta_type AS ENUM (
  'internal_eval',
  'internal_quiz',
  'external_url',
  'acknowledge',
  'read_more',
  'none'
);

CREATE TYPE calendar_completion_method AS ENUM (
  'submission',
  'manual_ack',
  'admin_mark'
);

-- Helper: derive Thai semester label from timestamp
CREATE OR REPLACE FUNCTION compute_thai_semester(dt timestamptz)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  m   int := EXTRACT(MONTH FROM dt AT TIME ZONE 'Asia/Bangkok')::int;
  y   int := EXTRACT(YEAR  FROM dt AT TIME ZONE 'Asia/Bangkok')::int;
BEGIN
  -- ส.ค.(8)–ธ.ค.(12) = ภาค 1, ปีการศึกษา = ปีนั้น+543
  IF m >= 8 AND m <= 12 THEN
    RETURN '1/' || (y + 543)::text;
  -- ม.ค.(1)–พ.ค.(5) = ภาค 2, ปีการศึกษา = (ปีก่อน)+543
  ELSIF m >= 1 AND m <= 5 THEN
    RETURN '2/' || (y - 1 + 543)::text;
  END IF;
  -- มิ.ย.–ก.ค. = ปิดภาค
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION compute_academic_year(dt timestamptz)
RETURNS int LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  m int := EXTRACT(MONTH FROM dt AT TIME ZONE 'Asia/Bangkok')::int;
  y int := EXTRACT(YEAR  FROM dt AT TIME ZONE 'Asia/Bangkok')::int;
BEGIN
  IF m >= 8 AND m <= 12 THEN RETURN y + 543;
  ELSIF m >= 1 AND m <= 5  THEN RETURN y - 1 + 543;
  END IF;
  RETURN NULL;
END;
$$;

-- Table 1: dorm_calendar_items — admin-curated mandatory tasks
CREATE TABLE dorm_calendar_items (
  id                 uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  category           dorm_calendar_category NOT NULL,
  title_th           text               NOT NULL,
  title_en           text,
  description_th     text,
  description_en     text,
  start_at           timestamptz        NOT NULL,
  due_at             timestamptz        NOT NULL,
  semester           text,
  academic_year      int,
  audience           text               NOT NULL DEFAULT 'นิสิตหอพักทุกคน',
  is_required        boolean            NOT NULL DEFAULT true,
  cta_type           calendar_cta_type  NOT NULL DEFAULT 'acknowledge',
  cta_url            text,
  cta_event_id       uuid               REFERENCES dorm_events(id) ON DELETE SET NULL,
  score_points       int                NOT NULL DEFAULT 0,
  penalty_points     int                NOT NULL DEFAULT 0,
  score_category_id  uuid               REFERENCES score_categories(id) ON DELETE SET NULL,
  published_by       uuid               REFERENCES profiles(id) ON DELETE SET NULL,
  archived_at        timestamptz,
  created_at         timestamptz        NOT NULL DEFAULT now(),
  updated_at         timestamptz        NOT NULL DEFAULT now()
);

-- Auto-fill semester + academic_year from due_at
CREATE OR REPLACE FUNCTION set_dorm_calendar_semester()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.semester      := compute_thai_semester(NEW.due_at);
  NEW.academic_year := compute_academic_year(NEW.due_at);
  NEW.updated_at    := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dorm_calendar_semester
  BEFORE INSERT OR UPDATE OF due_at ON dorm_calendar_items
  FOR EACH ROW EXECUTE FUNCTION set_dorm_calendar_semester();

-- Table 2: dorm_calendar_completions — per-user completion tracking
CREATE TABLE dorm_calendar_completions (
  id                uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid                        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type       text                        NOT NULL CHECK (source_type IN ('item', 'event', 'announcement')),
  source_id         uuid                        NOT NULL,
  completed_at      timestamptz                 NOT NULL DEFAULT now(),
  completion_method calendar_completion_method  NOT NULL,
  metadata          jsonb,
  UNIQUE (user_id, source_type, source_id)
);

-- Auto-add score_entries when a completion is inserted (for items with score_points)
CREATE OR REPLACE FUNCTION auto_score_on_calendar_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item         dorm_calendar_items%ROWTYPE;
  v_student_id   uuid;
BEGIN
  -- Only handle 'item' source for now
  IF NEW.source_type != 'item' THEN RETURN NEW; END IF;

  -- Look up the item
  SELECT * INTO v_item FROM dorm_calendar_items WHERE id = NEW.source_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Skip if no score configured
  IF v_item.score_points = 0 OR v_item.score_category_id IS NULL THEN RETURN NEW; END IF;

  -- Upsert score_entries (idempotent via ON CONFLICT)
  INSERT INTO score_entries (
    student_id,
    category_id,
    points,
    source,
    reason,
    description_th,
    academic_year,
    semester
  )
  SELECT
    NEW.user_id,
    v_item.score_category_id,
    v_item.score_points,
    'calendar_task',
    v_item.title_th,
    '✓ ' || v_item.title_th,
    v_item.academic_year,
    CASE
      WHEN v_item.semester LIKE '1/%' THEN 1
      WHEN v_item.semester LIKE '2/%' THEN 2
    END
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_score_calendar
  AFTER INSERT ON dorm_calendar_completions
  FOR EACH ROW EXECUTE FUNCTION auto_score_on_calendar_completion();

-- Auto-complete calendar item when evaluation_submission is made
-- Links dorm_calendar_items (cta_event_id) → evaluation_forms (event_id) → evaluation_submissions
CREATE OR REPLACE FUNCTION auto_complete_calendar_from_eval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event_id uuid;
  v_user_id  uuid;
  v_item_id  uuid;
BEGIN
  -- Get the event_id from the evaluation form
  SELECT ef.event_id INTO v_event_id
  FROM evaluation_forms ef
  WHERE ef.id = NEW.form_id;

  IF v_event_id IS NULL THEN RETURN NEW; END IF;

  -- Get user_id from profiles (match by line_uid in submission metadata, or student_id)
  v_user_id := NEW.student_id;
  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  -- Find matching calendar item
  SELECT id INTO v_item_id
  FROM dorm_calendar_items
  WHERE cta_event_id = v_event_id
    AND archived_at IS NULL
  LIMIT 1;

  IF v_item_id IS NULL THEN RETURN NEW; END IF;

  -- Insert completion (ignore conflict — idempotent)
  INSERT INTO dorm_calendar_completions (user_id, source_type, source_id, completion_method)
  VALUES (v_user_id, 'item', v_item_id, 'submission')
  ON CONFLICT (user_id, source_type, source_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calendar_from_eval
  AFTER INSERT ON evaluation_submissions
  FOR EACH ROW EXECUTE FUNCTION auto_complete_calendar_from_eval();

-- Flag columns on existing tables
ALTER TABLE dorm_events
  ADD COLUMN IF NOT EXISTS is_calendar_pinned   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS calendar_category     dorm_calendar_category,
  ADD COLUMN IF NOT EXISTS calendar_cta_type     calendar_cta_type,
  ADD COLUMN IF NOT EXISTS calendar_cta_url      text;

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS is_calendar_pinned boolean DEFAULT false;

-- Indexes
CREATE INDEX idx_dorm_calendar_items_due    ON dorm_calendar_items (due_at);
CREATE INDEX idx_dorm_calendar_items_sem    ON dorm_calendar_items (semester) WHERE archived_at IS NULL;
CREATE INDEX idx_dorm_calendar_items_cat    ON dorm_calendar_items (category) WHERE archived_at IS NULL;
CREATE INDEX idx_dorm_calendar_comp_user    ON dorm_calendar_completions (user_id, source_type);
CREATE INDEX idx_dorm_events_cal_pinned     ON dorm_events (is_calendar_pinned) WHERE is_calendar_pinned = true;
CREATE INDEX idx_announcements_cal_pinned   ON announcements (is_calendar_pinned) WHERE is_calendar_pinned = true;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE dorm_calendar_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dorm_calendar_completions ENABLE ROW LEVEL SECURITY;

-- dorm_calendar_items: all authenticated students can read non-archived
CREATE POLICY "students read dorm_calendar_items"
  ON dorm_calendar_items FOR SELECT
  TO authenticated
  USING (archived_at IS NULL);

-- Admins can do everything
CREATE POLICY "admin all dorm_calendar_items"
  ON dorm_calendar_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );

-- dorm_calendar_completions: user reads/inserts own; admin reads all + inserts any
CREATE POLICY "user read own completions"
  ON dorm_calendar_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user insert own completion"
  ON dorm_calendar_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin read all completions"
  ON dorm_calendar_completions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );

CREATE POLICY "admin insert any completion"
  ON dorm_calendar_completions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff')
    )
  );
