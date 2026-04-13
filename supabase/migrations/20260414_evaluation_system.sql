-- ============================================================================
-- Evaluation System for Dorm Activities
-- Creates tables for multi-step evaluation forms (shop_evaluation,
-- dorm_reapplication, document_upload) that connect to dorm_events
-- ============================================================================

-- ============================================================================
-- 1. Create evaluation_forms table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dorm_events(id) ON DELETE CASCADE,
  form_type text NOT NULL CHECK (form_type IN ('shop_evaluation', 'dorm_reapplication', 'document_upload')),
  title_th text NOT NULL,
  title_en text,
  description_th text,
  description_en text,
  total_steps integer NOT NULL DEFAULT 1,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS evaluation_forms_event_uniq ON evaluation_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_forms_type ON evaluation_forms(form_type) WHERE is_active = true;

COMMENT ON TABLE evaluation_forms IS 'Evaluation form definitions linked to dorm events';
COMMENT ON COLUMN evaluation_forms.config IS 'JSON config: shop names, conditions, file types, etc.';

-- ============================================================================
-- 2. Create evaluation_criteria table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES evaluation_forms(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title_th text NOT NULL,
  title_en text,
  description_th text,
  description_en text,
  criteria_type text NOT NULL DEFAULT 'rating' CHECK (criteria_type IN ('rating', 'textarea')),
  is_skippable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eval_criteria_form ON evaluation_criteria(form_id, sort_order);

COMMENT ON TABLE evaluation_criteria IS 'Rating/textarea questions for evaluation forms';

-- ============================================================================
-- 3. Create evaluation_responses table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES evaluation_forms(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  criterion_id uuid REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  text_response text,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS eval_responses_uniq ON evaluation_responses(form_id, student_id, step_index, criterion_id);
CREATE INDEX IF NOT EXISTS idx_eval_responses_student ON evaluation_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_eval_responses_form ON evaluation_responses(form_id);

COMMENT ON TABLE evaluation_responses IS 'Student responses per criterion per step';

-- ============================================================================
-- 4. Create evaluation_submissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluation_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES evaluation_forms(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  current_step integer NOT NULL DEFAULT 0,
  uploaded_files text[] DEFAULT '{}',
  personal_info jsonb,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS eval_submissions_uniq ON evaluation_submissions(form_id, student_id);
CREATE INDEX IF NOT EXISTS idx_eval_submissions_student ON evaluation_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_eval_submissions_status ON evaluation_submissions(status);

COMMENT ON TABLE evaluation_submissions IS 'Overall submission tracking per student per form';

-- ============================================================================
-- 5. Create storage bucket for evaluation uploads
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluation-uploads', 'evaluation-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. Add updated_at triggers
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_evaluation_forms_updated') THEN
    CREATE TRIGGER on_evaluation_forms_updated
      BEFORE UPDATE ON public.evaluation_forms
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_evaluation_responses_updated') THEN
    CREATE TRIGGER on_evaluation_responses_updated
      BEFORE UPDATE ON public.evaluation_responses
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_evaluation_submissions_updated') THEN
    CREATE TRIGGER on_evaluation_submissions_updated
      BEFORE UPDATE ON public.evaluation_submissions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- ============================================================================
-- 7. Enable RLS
-- ============================================================================

ALTER TABLE evaluation_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS Policies
-- ============================================================================

-- evaluation_forms: SELECT for authenticated, ALL for admin
DROP POLICY IF EXISTS "evaluation_forms_select" ON evaluation_forms;
CREATE POLICY "evaluation_forms_select" ON evaluation_forms
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "evaluation_forms_admin" ON evaluation_forms;
CREATE POLICY "evaluation_forms_admin" ON evaluation_forms
  FOR ALL TO authenticated
  USING (is_admin());

-- evaluation_criteria: SELECT for authenticated, ALL for admin
DROP POLICY IF EXISTS "evaluation_criteria_select" ON evaluation_criteria;
CREATE POLICY "evaluation_criteria_select" ON evaluation_criteria
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "evaluation_criteria_admin" ON evaluation_criteria;
CREATE POLICY "evaluation_criteria_admin" ON evaluation_criteria
  FOR ALL TO authenticated
  USING (is_admin());

-- evaluation_responses: own records only for students, ALL for admin
DROP POLICY IF EXISTS "evaluation_responses_select_own" ON evaluation_responses;
CREATE POLICY "evaluation_responses_select_own" ON evaluation_responses
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "evaluation_responses_insert_own" ON evaluation_responses;
CREATE POLICY "evaluation_responses_insert_own" ON evaluation_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "evaluation_responses_update_own" ON evaluation_responses;
CREATE POLICY "evaluation_responses_update_own" ON evaluation_responses
  FOR UPDATE TO authenticated
  USING (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "evaluation_responses_admin" ON evaluation_responses;
CREATE POLICY "evaluation_responses_admin" ON evaluation_responses
  FOR ALL TO authenticated
  USING (is_admin());

-- evaluation_submissions: own records only for students, ALL for admin
DROP POLICY IF EXISTS "evaluation_submissions_select_own" ON evaluation_submissions;
CREATE POLICY "evaluation_submissions_select_own" ON evaluation_submissions
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "evaluation_submissions_insert_own" ON evaluation_submissions;
CREATE POLICY "evaluation_submissions_insert_own" ON evaluation_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "evaluation_submissions_update_own" ON evaluation_submissions;
CREATE POLICY "evaluation_submissions_update_own" ON evaluation_submissions
  FOR UPDATE TO authenticated
  USING (
    student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS "evaluation_submissions_admin" ON evaluation_submissions;
CREATE POLICY "evaluation_submissions_admin" ON evaluation_submissions
  FOR ALL TO authenticated
  USING (is_admin());

-- ============================================================================
-- 9. Storage RLS policies for evaluation-uploads bucket
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload own evaluation files" ON storage.objects;
CREATE POLICY "Users can upload own evaluation files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evaluation-uploads'
    AND (storage.foldername(name))[1] = (SELECT student_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own evaluation files" ON storage.objects;
CREATE POLICY "Users can view own evaluation files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'evaluation-uploads'
    AND (
      (storage.foldername(name))[1] = (SELECT student_id FROM profiles WHERE id = auth.uid())
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "Users can delete own evaluation files" ON storage.objects;
CREATE POLICY "Users can delete own evaluation files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'evaluation-uploads'
    AND (storage.foldername(name))[1] = (SELECT student_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- 10. Seed evaluation events + forms
-- ============================================================================

-- Get activities category ID
DO $$
DECLARE
  v_activities_cat_id uuid;
  v_event_1_id uuid;
  v_event_2_id uuid;
  v_event_3_id uuid;
  v_form_1_id uuid;
  v_form_2_id uuid;
  v_form_3_id uuid;
BEGIN
  -- Get activities category
  SELECT id INTO v_activities_cat_id FROM score_categories WHERE slug = 'activities' LIMIT 1;

  -- Event 1: Shop Evaluation
  INSERT INTO dorm_events (
    title, title_th, title_en,
    description, description_th, description_en,
    event_date, event_time, event_type, event_status,
    is_mandatory, score_points, score_category_id,
    start_datetime, end_datetime,
    academic_year, semester
  ) VALUES (
    'แบบประเมินร้านค้าหอพัก ภาคเรียนที่ 1/2569',
    'แบบประเมินร้านค้าหอพัก ภาคเรียนที่ 1/2569',
    'Dorm Shop Evaluation 1/2026',
    'ประเมินคุณภาพร้านค้าในหอพักเพื่อนำไปพัฒนา',
    'ประเมินคุณภาพร้านค้าในหอพักเพื่อนำไปพัฒนา',
    'Evaluate dorm shops to improve service quality',
    '2026-05-01', '00:00', 'evaluation', 'published',
    false, 5, v_activities_cat_id,
    '2026-04-20 00:00:00+07'::timestamptz,
    '2026-05-10 23:59:59+07'::timestamptz,
    2569, 1
  ) RETURNING id INTO v_event_1_id;

  -- Event 2: Dorm Re-application
  INSERT INTO dorm_events (
    title, title_th, title_en,
    description, description_th, description_en,
    event_date, event_time, event_type, event_status,
    is_mandatory, score_points, score_category_id,
    start_datetime, end_datetime,
    academic_year, semester
  ) VALUES (
    'ยื่นขออยู่หอต่อ ภาคเรียนที่ 2/2569',
    'ยื่นขออยู่หอต่อ ภาคเรียนที่ 2/2569',
    'Dorm Re-application 2/2026',
    'สำหรับนิสิตที่ต้องการอยู่หอพักต่อในปีการศึกษาหน้า',
    'สำหรับนิสิตที่ต้องการอยู่หอพักต่อในปีการศึกษาหน้า',
    'For students who want to continue staying in the dorm next academic year',
    '2026-02-28', '00:00', 'evaluation', 'published',
    true, 0, v_activities_cat_id,
    '2026-02-19 00:00:00+07'::timestamptz,
    '2026-02-28 23:59:59+07'::timestamptz,
    2569, 2
  ) RETURNING id INTO v_event_2_id;

  -- Event 3: Document Upload (CR54)
  INSERT INTO dorm_events (
    title, title_th, title_en,
    description, description_th, description_en,
    event_date, event_time, event_type, event_status,
    is_mandatory, score_points, score_category_id,
    start_datetime, end_datetime,
    academic_year, semester
  ) VALUES (
    'อัปโหลดผลการลงทะเบียนเรียน (CR54)',
    'อัปโหลดผลการลงทะเบียนเรียน (CR54)',
    'Upload Enrollment Results (CR54)',
    'อัปโหลดเอกสารผลการลงทะเบียนเรียน',
    'อัปโหลดเอกสารผลการลงทะเบียนเรียน',
    'Upload your enrollment results document',
    '2026-08-31', '00:00', 'evaluation', 'published',
    true, 0, v_activities_cat_id,
    '2026-08-01 00:00:00+07'::timestamptz,
    '2026-08-31 23:59:59+07'::timestamptz,
    2569, 1
  ) RETURNING id INTO v_event_3_id;

  -- Form 1: Shop Evaluation with 5 shops
  INSERT INTO evaluation_forms (
    event_id, form_type,
    title_th, title_en,
    description_th, description_en,
    total_steps,
    config
  ) VALUES (
    v_event_1_id, 'shop_evaluation',
    'แบบประเมินร้านค้า',
    'Shop Evaluation',
    'ประเมินคุณภาพการบริการและสินค้าของร้านค้าในหอพัก',
    'Rate the service quality and products of dorm shops',
    5,
    '{
      "items": [
        {"name_th": "ร้านข้าวแกงป้าติ๋มสามย่าน", "name_en": "Pa Tim Rice Shop", "icon": "store"},
        {"name_th": "ร้านกาแฟหอพัก", "name_en": "Dorm Coffee Shop", "icon": "coffee"},
        {"name_th": "ร้านซักรีด", "name_en": "Laundry Shop", "icon": "shirt"},
        {"name_th": "ร้านเครื่องเขียน", "name_en": "Stationery Shop", "icon": "book"},
        {"name_th": "ร้านสะดวกซื้อ", "name_en": "Convenience Store", "icon": "shopping-cart"}
      ]
    }'::jsonb
  ) RETURNING id INTO v_form_1_id;

  -- Criteria for Shop Evaluation
  INSERT INTO evaluation_criteria (form_id, sort_order, title_th, title_en, description_th, criteria_type, is_skippable)
  VALUES
    (v_form_1_id, 1, 'ความสะอาด', 'Cleanliness', 'ประเมินความสะอาดของร้านค้า สุขอนามัย', 'rating', true),
    (v_form_1_id, 2, 'คุณภาพสินค้า', 'Product Quality', 'ความสดใหม่ คุณภาพของอาหารและสินค้า', 'rating', true),
    (v_form_1_id, 3, 'ราคา', 'Price', 'ความเหมาะสมของราคาสินค้า', 'rating', true),
    (v_form_1_id, 4, 'ข้อเสนอแนะ', 'Suggestions', 'ข้อเสนอแนะเพิ่มเติม', 'textarea', true);

  -- Form 2: Dorm Re-application
  INSERT INTO evaluation_forms (
    event_id, form_type,
    title_th, title_en,
    description_th, description_en,
    total_steps,
    config
  ) VALUES (
    v_event_2_id, 'dorm_reapplication',
    'ยื่นขออยู่หอต่อ',
    'Dorm Re-application',
    'ยื่นขออยู่หอพักต่อในปีการศึกษาหน้า',
    'Apply to continue staying in the dorm next academic year',
    2,
    '{
      "conditions_th": [
        "ต้องเป็นนิสิตที่อยู่หอในปีปัจจุบัน",
        "ไม่มีค่าปรับค้างชำระ",
        "คะแนนหอพักไม่ต่ำกว่า 60 คะแนน"
      ],
      "conditions_en": [
        "Must be a current dorm resident",
        "No outstanding fines",
        "Dorm score not less than 60 points"
      ],
      "personal_info_fields": ["fullName", "studentId", "faculty", "room"]
    }'::jsonb
  ) RETURNING id INTO v_form_2_id;

  -- Form 3: Document Upload
  INSERT INTO evaluation_forms (
    event_id, form_type,
    title_th, title_en,
    description_th, description_en,
    total_steps,
    config
  ) VALUES (
    v_event_3_id, 'document_upload',
    'อัปโหลดผลการลงทะเบียนเรียน',
    'Upload Enrollment Results',
    'อัปโหลดไฟล์ CR54 ผลการลงทะเบียนเรียน',
    'Upload CR54 enrollment results file',
    1,
    '{
      "accepted_types": ["image/jpeg", "image/png", "application/pdf"],
      "max_size_mb": 10,
      "document_label_th": "ผลการลงทะเบียนเรียน (CR54)",
      "document_label_en": "Enrollment Results (CR54)"
    }'::jsonb
  ) RETURNING id INTO v_form_3_id;

END $$;

-- ============================================================================
-- Migration complete
-- ============================================================================
