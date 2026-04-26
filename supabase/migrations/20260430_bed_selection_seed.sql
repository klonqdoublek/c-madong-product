-- Seed: bed selection mandatory calendar item (semester 2/2568, due end of academic year)
-- Runs AFTER 20260429_bed_selection_enums.sql so enum value is committed

INSERT INTO dorm_calendar_items (
  category, title_th, title_en, description_th, description_en,
  start_at, due_at, audience, is_required, cta_type,
  score_points, penalty_points
) VALUES (
  'bed_selection',
  'เลือกเตียงประจำปีการศึกษา 2/2568',
  'Annual Bed Selection 2/2568',
  'นิสิตทุกคนต้องยืนยันหรือเลือกเตียงใหม่เพื่อสิทธิ์อยู่หอพักในปีการศึกษาถัดไป หากไม่ดำเนินการภายในเวลาที่กำหนด ระบบจะยืนยันเตียงเดิมโดยอัตโนมัติ',
  'All residents must confirm or select a new bed to retain dorm housing for the next academic year. If no action is taken by the deadline, the current bed will be auto-confirmed.',
  '2026-05-01 09:00:00+07'::timestamptz,
  '2026-05-31 23:59:59+07'::timestamptz,
  'นิสิตหอพักทุกคน', true, 'internal_bed_selection',
  2, -5
)
ON CONFLICT DO NOTHING;
