-- ============================================================================
-- Phase 5: Dorm Score & Activities
-- ALTERs existing tables (score_categories, dorm_events, score_entries,
-- event_attendance). Adds materialized view, functions, triggers, RLS.
-- ============================================================================

-- ============================================================================
-- 3a. ALTER score_categories — add bilingual names, weights, metadata
-- ============================================================================

ALTER TABLE score_categories
  ADD COLUMN IF NOT EXISTS name_th text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_th text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS weight numeric(4,2) NOT NULL DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Backfill name_th from existing name column
UPDATE score_categories SET name_th = name WHERE name_th IS NULL;

-- Seed weights per category (if rows exist from Phase 2 seed)
UPDATE score_categories SET weight = 0.40 WHERE slug = 'activities';
UPDATE score_categories SET weight = 0.20 WHERE slug = 'community_service';
UPDATE score_categories SET weight = 0.25 WHERE slug = 'rules';
UPDATE score_categories SET weight = 0.15 WHERE slug = 'meetings';

-- Seed colors and icons
UPDATE score_categories SET color = '#E91E8C', icon = 'calendar-check' WHERE slug = 'activities';
UPDATE score_categories SET color = '#10B981', icon = 'heart-handshake' WHERE slug = 'community_service';
UPDATE score_categories SET color = '#F59E0B', icon = 'shield-check' WHERE slug = 'rules';
UPDATE score_categories SET color = '#6366F1', icon = 'users' WHERE slug = 'meetings';

-- Insert categories if they don't exist yet
INSERT INTO score_categories (name, slug, max_score, name_th, name_en, weight, icon, color)
VALUES
  ('กิจกรรมหอพัก', 'activities', 100, 'กิจกรรมหอพัก', 'Activities', 0.40, 'calendar-check', '#E91E8C'),
  ('บำเพ็ญประโยชน์', 'community_service', 100, 'บำเพ็ญประโยชน์', 'Community Service', 0.20, 'heart-handshake', '#10B981'),
  ('ระเบียบวินัย', 'rules', 100, 'ระเบียบวินัย', 'Rules Compliance', 0.25, 'shield-check', '#F59E0B'),
  ('ประชุมหอพัก', 'meetings', 100, 'ประชุมหอพัก', 'Meetings', 0.15, 'users', '#6366F1')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3b. ALTER dorm_events — add event type, impact, scoring, bilingual, capacity
-- ============================================================================

ALTER TABLE dorm_events
  ADD COLUMN IF NOT EXISTS title_th text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description_th text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS location_th text,
  ADD COLUMN IF NOT EXISTS location_en text,
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS impact_level text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS is_mandatory boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_category_id uuid REFERENCES score_categories(id),
  ADD COLUMN IF NOT EXISTS start_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS end_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS max_capacity integer,
  ADD COLUMN IF NOT EXISTS building_id uuid REFERENCES buildings(id),
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS academic_year integer,
  ADD COLUMN IF NOT EXISTS semester integer,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- CHECK constraints for text enums
ALTER TABLE dorm_events
  DROP CONSTRAINT IF EXISTS dorm_events_event_type_check;
ALTER TABLE dorm_events
  ADD CONSTRAINT dorm_events_event_type_check
  CHECK (event_type IN ('meeting', 'evaluation', 'safety_drill', 'obligation', 'community_service', 'social', 'workshop', 'sports', 'other'));

ALTER TABLE dorm_events
  DROP CONSTRAINT IF EXISTS dorm_events_impact_level_check;
ALTER TABLE dorm_events
  ADD CONSTRAINT dorm_events_impact_level_check
  CHECK (impact_level IN ('high', 'medium', 'low'));

-- Updated_at trigger for dorm_events
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_dorm_events_updated') THEN
    CREATE TRIGGER on_dorm_events_updated
      BEFORE UPDATE ON public.dorm_events
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Backfill bilingual from existing columns
UPDATE dorm_events SET title_th = title WHERE title_th IS NULL;
UPDATE dorm_events
  SET start_datetime = (event_date || ' ' || COALESCE(event_time, '00:00'))::timestamptz
  WHERE start_datetime IS NULL AND event_date IS NOT NULL;

-- ============================================================================
-- 3c. ALTER score_entries — add event link, source, bilingual, academic period
-- ============================================================================

ALTER TABLE score_entries
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES dorm_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual_admin',
  ADD COLUMN IF NOT EXISTS description_th text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS academic_year integer,
  ADD COLUMN IF NOT EXISTS semester integer,
  ADD COLUMN IF NOT EXISTS awarded_by uuid;

ALTER TABLE score_entries
  DROP CONSTRAINT IF EXISTS score_entries_source_check;
ALTER TABLE score_entries
  ADD CONSTRAINT score_entries_source_check
  CHECK (source IN ('manual_admin', 'auto_attendance', 'bulk_import', 'system'));

-- Backfill description_th from existing reason column
UPDATE score_entries SET description_th = reason WHERE description_th IS NULL AND reason IS NOT NULL;

-- ============================================================================
-- 3d. ALTER event_attendance — add status, checkout, notes, recorder
-- ============================================================================

-- event_attendance may or may not exist. Create if missing, alter if exists.
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dorm_events(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_attendance
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'registered',
  ADD COLUMN IF NOT EXISTS checked_out_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS recorded_by uuid;

ALTER TABLE event_attendance
  DROP CONSTRAINT IF EXISTS event_attendance_status_check;
ALTER TABLE event_attendance
  ADD CONSTRAINT event_attendance_status_check
  CHECK (status IN ('registered', 'attended', 'absent', 'excused'));

-- Backfill status from checked_in boolean
UPDATE event_attendance
  SET status = CASE WHEN checked_in = true THEN 'attended' ELSE 'registered' END
  WHERE status = 'registered' AND checked_in IS NOT NULL;

-- ============================================================================
-- 3e. Unique constraint for dedup on score_entries
-- ============================================================================

-- Prevent duplicate auto-scores for same student + event + source
CREATE UNIQUE INDEX IF NOT EXISTS score_entries_student_event_source_uniq
  ON score_entries (student_id, event_id, source)
  WHERE event_id IS NOT NULL;

-- ============================================================================
-- 3f. Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dorm_events_type ON dorm_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dorm_events_status ON dorm_events(event_status);
CREATE INDEX IF NOT EXISTS idx_dorm_events_start ON dorm_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_dorm_events_impact ON dorm_events(impact_level);
CREATE INDEX IF NOT EXISTS idx_score_entries_student ON score_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_score_entries_category ON score_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_score_entries_event ON score_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_student ON event_attendance(student_id);

-- ============================================================================
-- 3g. Materialized View: student_score_summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS student_score_summary AS
SELECT
  se.student_id,
  se.academic_year,
  se.semester,
  sc.id AS category_id,
  sc.slug AS category_slug,
  sc.name_th AS category_name,
  sc.weight AS category_weight,
  sc.max_score,
  -- Raw sum of points for this category
  COALESCE(SUM(se.points), 0) AS raw_points,
  -- Category score = base 80 + raw_points, clamped [0, max_score]
  LEAST(sc.max_score, GREATEST(0, 80 + COALESCE(SUM(se.points), 0))) AS category_score,
  -- Weighted contribution
  LEAST(sc.max_score, GREATEST(0, 80 + COALESCE(SUM(se.points), 0))) * sc.weight AS weighted_score,
  COUNT(se.id) AS entry_count
FROM score_entries se
JOIN score_categories sc ON sc.id = se.category_id
WHERE sc.is_active = true
GROUP BY se.student_id, se.academic_year, se.semester,
         sc.id, sc.slug, sc.name_th, sc.weight, sc.max_score;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS student_score_summary_uniq
  ON student_score_summary (student_id, academic_year, semester, category_id);

-- ============================================================================
-- 3h. Function: get_composite_score
-- ============================================================================

CREATE OR REPLACE FUNCTION get_composite_score(
  p_student_id text,
  p_academic_year integer DEFAULT NULL,
  p_semester integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_year integer := COALESCE(p_academic_year, EXTRACT(YEAR FROM now())::integer);
  v_semester integer := COALESCE(p_semester, CASE WHEN EXTRACT(MONTH FROM now()) <= 5 THEN 2 ELSE 1 END);
BEGIN
  SELECT jsonb_build_object(
    'student_id', p_student_id,
    'academic_year', v_year,
    'semester', v_semester,
    'composite_score', COALESCE(SUM(s.weighted_score), 0),
    'categories', COALESCE(jsonb_agg(
      jsonb_build_object(
        'category_id', s.category_id,
        'slug', s.category_slug,
        'name', s.category_name,
        'weight', s.category_weight,
        'raw_points', s.raw_points,
        'score', s.category_score,
        'max_score', s.max_score,
        'weighted', s.weighted_score,
        'entries', s.entry_count
      )
    ), '[]'::jsonb)
  ) INTO v_result
  FROM student_score_summary s
  WHERE s.student_id = p_student_id
    AND (s.academic_year = v_year OR s.academic_year IS NULL)
    AND (s.semester = v_semester OR s.semester IS NULL);

  -- If no data, return default structure with base scores
  IF v_result IS NULL OR (v_result->>'composite_score')::numeric = 0 THEN
    SELECT jsonb_build_object(
      'student_id', p_student_id,
      'academic_year', v_year,
      'semester', v_semester,
      'composite_score', SUM(80 * sc.weight),
      'categories', jsonb_agg(
        jsonb_build_object(
          'category_id', sc.id,
          'slug', sc.slug,
          'name', sc.name_th,
          'weight', sc.weight,
          'raw_points', 0,
          'score', 80,
          'max_score', sc.max_score,
          'weighted', 80 * sc.weight,
          'entries', 0
        )
      )
    ) INTO v_result
    FROM score_categories sc
    WHERE sc.is_active = true;
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 3i. Trigger: auto_score_from_attendance
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_score_from_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event record;
  v_points integer;
  v_desc text;
BEGIN
  -- Only fire on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get event details
  SELECT * INTO v_event
  FROM dorm_events
  WHERE id = NEW.event_id;

  -- No event or no score category linked → skip
  IF v_event IS NULL OR v_event.score_category_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Attended → positive score
  IF NEW.status = 'attended' AND v_event.score_points > 0 THEN
    v_points := v_event.score_points;
    v_desc := 'เข้าร่วม: ' || COALESCE(v_event.title_th, v_event.title);

    INSERT INTO score_entries (student_id, category_id, points, reason, event_id, source, description_th, academic_year, semester)
    VALUES (NEW.student_id, v_event.score_category_id, v_points, v_desc, NEW.event_id, 'auto_attendance', v_desc, v_event.academic_year, v_event.semester)
    ON CONFLICT (student_id, event_id, source) WHERE event_id IS NOT NULL
    DO UPDATE SET points = v_points, reason = v_desc, description_th = v_desc;
  END IF;

  -- Absent + mandatory → negative score
  IF NEW.status = 'absent' AND v_event.is_mandatory AND v_event.penalty_points > 0 THEN
    v_points := -1 * v_event.penalty_points;
    v_desc := 'ขาด: ' || COALESCE(v_event.title_th, v_event.title);

    INSERT INTO score_entries (student_id, category_id, points, reason, event_id, source, description_th, academic_year, semester)
    VALUES (NEW.student_id, v_event.score_category_id, v_points, v_desc, NEW.event_id, 'auto_attendance', v_desc, v_event.academic_year, v_event.semester)
    ON CONFLICT (student_id, event_id, source) WHERE event_id IS NOT NULL
    DO UPDATE SET points = v_points, reason = v_desc, description_th = v_desc;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_auto_score_attendance ON event_attendance;
CREATE TRIGGER trg_auto_score_attendance
  AFTER UPDATE ON event_attendance
  FOR EACH ROW
  EXECUTE FUNCTION auto_score_from_attendance();

-- ============================================================================
-- 3j. Function: refresh_score_summary
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_score_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_score_summary;
END;
$$;

-- ============================================================================
-- 3k. RLS Policies
-- ============================================================================

-- Helper: check admin role (reuse existing is_admin if available)
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (select auth.uid())
      AND is_active = true
      AND role IN ('super_admin', 'head', 'activity', 'admin_staff', 'registrar')
  );
$$;

-- score_categories: everyone can read
ALTER TABLE score_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_categories_select" ON score_categories;
CREATE POLICY "score_categories_select" ON score_categories
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "score_categories_admin" ON score_categories;
CREATE POLICY "score_categories_admin" ON score_categories
  FOR ALL TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- dorm_events: published/ongoing/completed visible to all, draft to admin
ALTER TABLE dorm_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dorm_events_select_public" ON dorm_events;
CREATE POLICY "dorm_events_select_public" ON dorm_events
  FOR SELECT TO authenticated
  USING (
    event_status IN ('published', 'ongoing', 'completed')
    OR is_admin_or_staff()
  );

DROP POLICY IF EXISTS "dorm_events_admin_write" ON dorm_events;
CREATE POLICY "dorm_events_admin_write" ON dorm_events
  FOR ALL TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- event_attendance: own records or admin
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_attendance_select" ON event_attendance;
CREATE POLICY "event_attendance_select" ON event_attendance
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT student_id FROM students WHERE line_user_id IN (
        SELECT line_uid FROM profiles WHERE id = (select auth.uid())
      )
    )
    OR is_admin_or_staff()
  );

DROP POLICY IF EXISTS "event_attendance_insert" ON event_attendance;
CREATE POLICY "event_attendance_insert" ON event_attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT student_id FROM students WHERE line_user_id IN (
        SELECT line_uid FROM profiles WHERE id = (select auth.uid())
      )
    )
    OR is_admin_or_staff()
  );

DROP POLICY IF EXISTS "event_attendance_update" ON event_attendance;
CREATE POLICY "event_attendance_update" ON event_attendance
  FOR UPDATE TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- score_entries: own records (via students lookup) or admin
ALTER TABLE score_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_entries_select" ON score_entries;
CREATE POLICY "score_entries_select" ON score_entries
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT student_id FROM students WHERE line_user_id IN (
        SELECT line_uid FROM profiles WHERE id = (select auth.uid())
      )
    )
    OR is_admin_or_staff()
  );

DROP POLICY IF EXISTS "score_entries_admin_write" ON score_entries;
CREATE POLICY "score_entries_admin_write" ON score_entries
  FOR ALL TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- ============================================================================
-- Done. Run: SELECT refresh_score_summary(); after inserting test data.
-- ============================================================================
