-- Repair seed data: templates + requisitions
-- Runs after repair_templates, ticket_code, and repair_requisitions migrations

INSERT INTO repair_templates (
  id, category, title, description, image_url, default_materials, specific_item, created_by
)
VALUES
  (
    'c0000001-0e00-4000-c000-000000000001',
    'plumbing',
    'ก๊อกน้ำรั่วซึมที่อ่างล้างหน้า',
    'น้ำหยดซึมแม้ปิดก๊อกสนิท ใช้งานอ่างล้างหน้าไม่สะดวก',
    '/images/intro/overlay-repair.png',
    '[
      {"name":"เทป PTFE","quantity":1,"unit":"ม้วน"},
      {"name":"ยางรองก๊อก","quantity":2,"unit":"ชิ้น"},
      {"name":"ประแจปากตาย","quantity":1,"unit":"ชิ้น"}
    ]'::jsonb,
    'faucet',
    NULL
  ),
  (
    'c0000001-0e00-4000-c000-000000000002',
    'electrical',
    'ปลั๊กไฟไม่ทำงานสองจุด',
    'ปลั๊กไฟหัวเตียงหรือโต๊ะอ่านหนังสือไม่ตอบสนอง ต้องตรวจวงจรไฟฟ้า',
    '/line-banners/onboarding-3-repair.jpg',
    '[
      {"name":"เทปพันสายไฟ","quantity":1,"unit":"ม้วน"},
      {"name":"สกรู","quantity":4,"unit":"ตัว"},
      {"name":"มัลติมิเตอร์","quantity":1,"unit":"ชิ้น"}
    ]'::jsonb,
    'light_switch',
    NULL
  ),
  (
    'c0000001-0e00-4000-c000-000000000003',
    'aircon',
    'แอร์ไม่เย็นและมีน้ำหยด',
    'เครื่องปรับอากาศทำความเย็นไม่ถึงและมีน้ำหยดระหว่างใช้งาน',
    '/line-banners/onboarding-3-repair-v2.jpg',
    '[
      {"name":"น้ำยาล้างแอร์","quantity":1,"unit":"กระป๋อง"},
      {"name":"แปรงทำความสะอาดคอยล์","quantity":1,"unit":"ชิ้น"},
      {"name":"ท่อระบายน้ำ","quantity":1,"unit":"เส้น"}
    ]'::jsonb,
    'ac_unit',
    NULL
  ),
  (
    'c0000001-0e00-4000-c000-000000000004',
    'furniture',
    'บานประตูตู้เสื้อผ้าฝืดและปิดไม่สนิท',
    'บานประตูตู้ฝืด เสียงดัง และต้องดันแรงถึงจะปิดลง',
    '/images/dormitory-hero-1440x900.jpg',
    '[
      {"name":"สกรู","quantity":6,"unit":"ตัว"},
      {"name":"น้ำมันหล่อลื่น WD-40","quantity":1,"unit":"กระป๋อง"}
    ]'::jsonb,
    'door',
    NULL
  ),
  (
    'c0000001-0e00-4000-c000-000000000005',
    'internet',
    'WiFi ห้องสัญญาณอ่อนและหลุดบ่อย',
    'สัญญาณไร้สายไม่เสถียรและความเร็วตกในบางช่วงเวลา',
    '/images/intro/overlay-line.png',
    '[
      {"name":"สาย LAN","quantity":1,"unit":"เส้น"},
      {"name":"หัว RJ45","quantity":2,"unit":"ตัว"},
      {"name":"เครื่องทดสอบสัญญาณ","quantity":1,"unit":"ชิ้น"}
    ]'::jsonb,
    'wifi_router',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO repair_requisitions (
  ticket_id,
  version,
  ticket_code,
  title,
  category,
  requester_name,
  building_name,
  room_number,
  technician_name,
  appointment_date,
  appointment_time,
  materials_snapshot,
  created_by,
  created_at
)
SELECT
  ticket.id,
  1,
  COALESCE(ticket.ticket_code, ticket.id::text),
  ticket.title,
  ticket.category,
  ticket.requester_name,
  ticket.building_name,
  ticket.room_number,
  ticket.technician_name,
  ticket.appointment_date,
  ticket.appointment_time,
  '[
    {"name":"ไม้พยุงโต๊ะ","quantity":1,"unit":"ชุด"},
    {"name":"สกรูไม้","quantity":8,"unit":"ตัว"},
    {"name":"กาวอีพ็อกซี","quantity":1,"unit":"หลอด"}
  ]'::jsonb,
  NULL,
  now() - interval '12 hours'
FROM (
  SELECT
    mr.id,
    mr.ticket_code,
    mr.title,
    mr.category,
    mr.appointment_date,
    mr.appointment_time,
    p.full_name_th AS requester_name,
    b.name_th AS building_name,
    r.room_number,
    t.display_name AS technician_name
  FROM maintenance_requests mr
  JOIN profiles p ON p.user_id = mr.requester_id
  LEFT JOIN buildings b ON b.id = p.building_id
  LEFT JOIN rooms r ON r.id = p.room_id
  LEFT JOIN technicians t ON t.id = mr.technician_id
  WHERE mr.title = 'โต๊ะเรียนขาหัก'
  LIMIT 1
) AS ticket
ON CONFLICT DO NOTHING;

INSERT INTO repair_requisitions (
  ticket_id,
  version,
  ticket_code,
  title,
  category,
  requester_name,
  building_name,
  room_number,
  technician_name,
  appointment_date,
  appointment_time,
  materials_snapshot,
  created_by,
  created_at
)
SELECT
  ticket.id,
  2,
  COALESCE(ticket.ticket_code, ticket.id::text),
  ticket.title,
  ticket.category,
  ticket.requester_name,
  ticket.building_name,
  ticket.room_number,
  ticket.technician_name,
  ticket.appointment_date,
  ticket.appointment_time,
  '[
    {"name":"สกรูเสริมมุม","quantity":4,"unit":"ตัว"},
    {"name":"บานพับเหล็ก","quantity":2,"unit":"ชุด"},
    {"name":"น้ำมันหล่อลื่น WD-40","quantity":1,"unit":"กระป๋อง"}
  ]'::jsonb,
  NULL,
  now() - interval '6 hours'
FROM (
  SELECT
    mr.id,
    mr.ticket_code,
    mr.title,
    mr.category,
    mr.appointment_date,
    mr.appointment_time,
    p.full_name_th AS requester_name,
    b.name_th AS building_name,
    r.room_number,
    t.display_name AS technician_name
  FROM maintenance_requests mr
  JOIN profiles p ON p.user_id = mr.requester_id
  LEFT JOIN buildings b ON b.id = p.building_id
  LEFT JOIN rooms r ON r.id = p.room_id
  LEFT JOIN technicians t ON t.id = mr.technician_id
  WHERE mr.title = 'โต๊ะเรียนขาหัก'
  LIMIT 1
) AS ticket
ON CONFLICT DO NOTHING;

INSERT INTO repair_requisitions (
  ticket_id,
  version,
  ticket_code,
  title,
  category,
  requester_name,
  building_name,
  room_number,
  technician_name,
  appointment_date,
  appointment_time,
  materials_snapshot,
  created_by,
  created_at
)
SELECT
  ticket.id,
  1,
  COALESCE(ticket.ticket_code, ticket.id::text),
  ticket.title,
  ticket.category,
  ticket.requester_name,
  ticket.building_name,
  ticket.room_number,
  ticket.technician_name,
  ticket.appointment_date,
  ticket.appointment_time,
  '[
    {"name":"เทป PTFE","quantity":1,"unit":"ม้วน"},
    {"name":"ยางรองฝักบัว","quantity":1,"unit":"ชิ้น"},
    {"name":"ประแจเลื่อน","quantity":1,"unit":"ชิ้น"}
  ]'::jsonb,
  NULL,
  now() - interval '5 hours'
FROM (
  SELECT
    mr.id,
    mr.ticket_code,
    mr.title,
    mr.category,
    mr.appointment_date,
    mr.appointment_time,
    p.full_name_th AS requester_name,
    b.name_th AS building_name,
    r.room_number,
    t.display_name AS technician_name
  FROM maintenance_requests mr
  JOIN profiles p ON p.user_id = mr.requester_id
  LEFT JOIN buildings b ON b.id = p.building_id
  LEFT JOIN rooms r ON r.id = p.room_id
  LEFT JOIN technicians t ON t.id = mr.technician_id
  WHERE mr.title = 'ฝักบัวน้ำไม่ออก'
  LIMIT 1
) AS ticket
ON CONFLICT DO NOTHING;

INSERT INTO repair_requisitions (
  ticket_id,
  version,
  ticket_code,
  title,
  category,
  requester_name,
  building_name,
  room_number,
  technician_name,
  appointment_date,
  appointment_time,
  materials_snapshot,
  created_by,
  created_at
)
SELECT
  ticket.id,
  1,
  COALESCE(ticket.ticket_code, ticket.id::text),
  ticket.title,
  ticket.category,
  ticket.requester_name,
  ticket.building_name,
  ticket.room_number,
  ticket.technician_name,
  ticket.appointment_date,
  ticket.appointment_time,
  '[
    {"name":"ฟิวส์สำรอง","quantity":2,"unit":"ตัว"},
    {"name":"เทปพันสายไฟ","quantity":1,"unit":"ม้วน"},
    {"name":"ปลั๊กไฟใหม่","quantity":1,"unit":"ชุด"}
  ]'::jsonb,
  NULL,
  now() - interval '4 hours'
FROM (
  SELECT
    mr.id,
    mr.ticket_code,
    mr.title,
    mr.category,
    mr.appointment_date,
    mr.appointment_time,
    p.full_name_th AS requester_name,
    b.name_th AS building_name,
    r.room_number,
    t.display_name AS technician_name
  FROM maintenance_requests mr
  JOIN profiles p ON p.user_id = mr.requester_id
  LEFT JOIN buildings b ON b.id = p.building_id
  LEFT JOIN rooms r ON r.id = p.room_id
  LEFT JOIN technicians t ON t.id = mr.technician_id
  WHERE mr.title = 'ปลั๊กไฟไม่ทำงาน 2 จุด'
  LIMIT 1
) AS ticket
ON CONFLICT DO NOTHING;
