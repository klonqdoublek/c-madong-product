-- ============================================================
-- Migration: Announcement Features
-- Date: 2026-04-02
-- Adds: category, location, dorm score columns to announcements
--        + announcement_documents, announcement_registrations,
--          announcement_reads, announcement_bookmarks tables
--        + 2 seed activity announcements
-- ============================================================

-- 1. ALTER announcements table
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'announcement',
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS has_dorm_score boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_points integer DEFAULT 0;

-- 2. announcement_documents
CREATE TABLE IF NOT EXISTS announcement_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE announcement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view announcement documents"
  ON announcement_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage announcement documents"
  ON announcement_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'head', 'staff')
    )
  );

-- 3. announcement_registrations
CREATE TABLE IF NOT EXISTS announcement_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, student_id)
);

ALTER TABLE announcement_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own registrations"
  ON announcement_registrations FOR SELECT
  TO authenticated
  USING (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can register"
  ON announcement_registrations FOR INSERT
  TO authenticated
  WITH CHECK (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can unregister"
  ON announcement_registrations FOR DELETE
  TO authenticated
  USING (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all registrations"
  ON announcement_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'head', 'staff')
    )
  );

-- 4. announcement_reads
CREATE TABLE IF NOT EXISTS announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, user_id)
);

ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark as read"
  ON announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. announcement_bookmarks
CREATE TABLE IF NOT EXISTS announcement_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, user_id)
);

ALTER TABLE announcement_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON announcement_bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks"
  ON announcement_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove bookmarks"
  ON announcement_bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Seed 2 mock activity announcements
INSERT INTO announcements (
  title, title_th, title_en, content_th, content_en,
  cover_image, status, is_pinned, published_at,
  category, location, has_dorm_score, score_points
) VALUES
(
  'กิจกรรมปลูกต้นไม้ ลดโลกร้อน',
  'กิจกรรมปลูกต้นไม้ ลดโลกร้อน',
  'Tree Planting Activity — Save the Planet',
  'ขอเชิญชวนนิสิตหอพักทุกคนมาร่วมกิจกรรมปลูกต้นไม้ ลดโลกร้อน ณ สวนหน้าหอพัก 3

รายละเอียด:
- วันเสาร์ที่ 12 เมษายน 2569 เวลา 09:00–12:00 น.
- รับจำนวนจำกัด 50 คน
- ได้รับคะแนนหอพัก 5 คะแนน

สิ่งที่ต้องเตรียม:
- เสื้อผ้าที่สะดวกต่อการทำกิจกรรม
- หมวก / ครีมกันแดด

มาร่วมสร้างพื้นที่สีเขียวให้หอพักเรากันเถอะ!',
  'Join us for a tree planting activity to help the environment at the garden in front of Dorm 3.

Details:
- Saturday, April 12, 2026, 09:00–12:00
- Limited to 50 participants
- Earn 5 dorm score points

What to bring:
- Comfortable clothes
- Hat / sunscreen

Let''s make our dorm greener together!',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop&q=80',
  'sent',
  true,
  now() - interval '1 day',
  'activity',
  'สวนหน้าหอพัก 3',
  true,
  5
),
(
  'วิ่งการกุศล CU Run For Health',
  'วิ่งการกุศล CU Run For Health',
  'CU Run For Health Charity Run',
  'ขอเชิญนิสิตหอพักร่วมกิจกรรมวิ่งการกุศล CU Run For Health ณ สนามกีฬาจุฬาฯ

รายละเอียด:
- วันอาทิตย์ที่ 20 เมษายน 2569 เวลา 06:00–09:00 น.
- ระยะทาง 5 กิโลเมตร
- ได้รับคะแนนหอพัก 10 คะแนน
- รับเสื้อวิ่งฟรี!

ลงทะเบียนภายในวันที่ 15 เมษายน

มาออกกำลังกายเพื่อสุขภาพ และร่วมทำบุญไปพร้อมกัน!',
  'Join the CU Run For Health charity run at CU Sports Complex.

Details:
- Sunday, April 20, 2026, 06:00–09:00
- 5 km run
- Earn 10 dorm score points
- Free running shirt!

Register by April 15.

Exercise for health and charity at the same time!',
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=400&fit=crop&q=80',
  'sent',
  false,
  now() - interval '2 hours',
  'activity',
  'สนามกีฬาจุฬาฯ',
  true,
  10
);
