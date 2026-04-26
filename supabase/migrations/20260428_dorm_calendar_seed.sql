-- Seed dorm calendar: pin existing eval events + insert standalone mandatory tasks
-- Today: 2026-04-26, current semester: 2/2568 (Jan–May 2026)
-- Semester 1/2569 starts Aug 2026

-- ──────────────────────────────────────────────────────────────
-- 1. Flag existing evaluation events as calendar-pinned
--    Find by title_th (seeded in 20260414_evaluation_system.sql)
-- ──────────────────────────────────────────────────────────────

UPDATE dorm_events
SET
  is_calendar_pinned = true,
  calendar_category  = 'shop_evaluation',
  calendar_cta_type  = 'internal_eval'
WHERE title_th = 'แบบประเมินร้านค้าหอพัก ภาคเรียนที่ 1/2569';

UPDATE dorm_events
SET
  is_calendar_pinned = true,
  calendar_category  = 'reapplication',
  calendar_cta_type  = 'internal_eval'
WHERE title_th = 'ยื่นขออยู่หอต่อ ภาคเรียนที่ 2/2569';

UPDATE dorm_events
SET
  is_calendar_pinned = true,
  calendar_category  = 'cr54_upload',
  calendar_cta_type  = 'internal_eval'
WHERE title_th = 'อัปโหลดผลการลงทะเบียนเรียน (CR54)';

-- ──────────────────────────────────────────────────────────────
-- 2. Insert standalone mandatory calendar items
--    semester + academic_year auto-filled by trigger from due_at
-- ──────────────────────────────────────────────────────────────

INSERT INTO dorm_calendar_items (
  category, title_th, title_en, description_th, description_en,
  start_at, due_at, audience, is_required, cta_type,
  score_points, penalty_points
) VALUES

-- ─ Fire Drill Theory (อบรมดับเพลิง ทฤษฎี) ─
(
  'fire_drill_theory',
  'อบรมดับเพลิง — ภาคทฤษฎี',
  'Fire Safety Training (Theory)',
  'รับชมสื่ออบรมและทำแบบทดสอบความรู้ด้านการป้องกันอัคคีภัย',
  'Watch fire safety training materials and complete the knowledge quiz',
  '2026-05-12 09:00:00+07'::timestamptz,
  '2026-05-14 23:59:59+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'internal_quiz',
  5, 0
),

-- ─ Fire Drill Practical (อบรมดับเพลิง ปฏิบัติ) ─
(
  'fire_drill_practical',
  'อบรมดับเพลิง — ภาคปฏิบัติ',
  'Fire Drill (Practical)',
  'เข้าร่วมฝึกซ้อมอพยพและดับเพลิงจริงบริเวณลานหน้าหอพัก',
  'Attend the hands-on fire evacuation and drill exercise in front of the dorm',
  '2026-05-16 08:00:00+07'::timestamptz,
  '2026-05-16 12:00:00+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'acknowledge',
  5, 0
),

-- ─ Dorm Meeting (ประชุมหอพัก) ─
(
  'dorm_meeting',
  'ประชุมหอพักประจำภาคเรียน 2/2568',
  'Dorm Meeting Semester 2/2025',
  'ประชุมนิสิตหอพักพบเจ้าหน้าที่ ณ ห้องประชุมชั้น 1 อาคารชวนชม',
  'Dorm resident meeting with staff at Meeting Room, 1F Chuanchom Building',
  '2026-05-07 18:00:00+07'::timestamptz,
  '2026-05-07 20:00:00+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'acknowledge',
  3, 0
),

-- ─ Dorm Inspection (ตรวจหอพัก) ─
(
  'dorm_inspection',
  'ตรวจห้องพักประจำภาคเรียน 2/2568',
  'Room Inspection Semester 2/2025',
  'เจ้าหน้าที่จะเข้าตรวจห้องพัก 09.00–17.00 น. นิสิตควรอยู่ในห้องหรือแจ้งเจ้าหน้าที่หากไม่สะดวก',
  'Staff will conduct room inspections 09:00–17:00. Please be present or inform staff if unavailable',
  '2026-05-19 09:00:00+07'::timestamptz,
  '2026-05-23 17:00:00+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'none',
  0, 0
),

-- ─ Shop Evaluation 1/2569 (future — upcoming semester) ─
(
  'shop_evaluation',
  'แบบประเมินร้านค้า ภาคเรียนที่ 1/2569',
  'Shop Evaluation Semester 1/2569',
  'ประเมินคุณภาพร้านค้าในหอพักเพื่อนำไปพัฒนา ภาคเรียนที่ 1 ปีการศึกษา 2569',
  'Evaluate dorm shop quality to improve service — Semester 1, AY 2569',
  '2026-10-01 00:00:00+07'::timestamptz,
  '2026-10-15 23:59:59+07'::timestamptz,
  'นิสิตหอพักทุกคน', false, 'internal_eval',
  5, 0
),

-- ─ Dorm Reapplication 1/2570 (next year, early deadline) ─
(
  'reapplication',
  'ยื่นขออยู่หอต่อ ภาคเรียนที่ 1/2570',
  'Dorm Re-application 1/2570',
  'ยื่นแบบฟอร์มขออยู่หอพักต่อสำหรับปีการศึกษา 2570 ผ่านระบบ CUDSON',
  'Submit dorm re-application for AY 2570 via CUDSON system',
  '2026-10-15 00:00:00+07'::timestamptz,
  '2026-11-15 23:59:59+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'internal_eval',
  0, 0
);
