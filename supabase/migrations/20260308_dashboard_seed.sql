-- Dashboard seed data: students, technicians, tags, tickets, announcements, templates
-- Handles Lovable-origin profiles schema (user_id FK, separate auto-gen id, email NOT NULL)

-- Step 1: Replace handle_new_user trigger with no-op during seeding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also no-op the assign_default_role trigger
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 2: Main seed block
DO $$
DECLARE
  -- Building IDs
  b_chuanchom uuid;
  b_pudtan uuid;
  b_pudson uuid;
  b_chumpa uuid;
  b_chumpee uuid;
  -- Auth user UUIDs (deterministic)
  s1 uuid := 'a0000001-0e00-4000-a000-000000000001';
  s2 uuid := 'a0000001-0e00-4000-a000-000000000002';
  s3 uuid := 'a0000001-0e00-4000-a000-000000000003';
  s4 uuid := 'a0000001-0e00-4000-a000-000000000004';
  s5 uuid := 'a0000001-0e00-4000-a000-000000000005';
  s6 uuid := 'a0000001-0e00-4000-a000-000000000006';
  s7 uuid := 'a0000001-0e00-4000-a000-000000000007';
  s8 uuid := 'a0000001-0e00-4000-a000-000000000008';
  -- Technician UUIDs
  t1 uuid := 'b0000001-0e00-4000-b000-000000000001';
  t2 uuid := 'b0000001-0e00-4000-b000-000000000002';
  t3 uuid := 'b0000001-0e00-4000-b000-000000000003';
  -- Temp vars
  r_id uuid;
  bed_id uuid;
  admin_id uuid;
  pw_hash text := '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
BEGIN
  -- ======================================
  -- 0. Look up building IDs
  -- ======================================
  SELECT id INTO b_chuanchom FROM buildings WHERE name_th = 'ชวนชม' LIMIT 1;
  SELECT id INTO b_pudtan    FROM buildings WHERE name_th = 'พุดตาน' LIMIT 1;
  SELECT id INTO b_pudson    FROM buildings WHERE name_th = 'พุดซ้อน' LIMIT 1;
  SELECT id INTO b_chumpa    FROM buildings WHERE name_th = 'จำปา' LIMIT 1;
  SELECT id INTO b_chumpee   FROM buildings WHERE name_th = 'จำปี' LIMIT 1;

  IF b_chuanchom IS NULL THEN
    RAISE NOTICE 'Buildings not found — skipping seed';
    RETURN;
  END IF;

  SELECT id INTO admin_id FROM auth.users WHERE email = 'dev@c-madong.app' LIMIT 1;

  -- ======================================
  -- 1. Auth users (triggers are no-op)
  -- ======================================
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
  VALUES
    (s1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed1@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed2@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed3@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed4@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed5@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed6@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed7@c-madong.app', pw_hash, now(), now(), now(), '', ''),
    (s8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed8@c-madong.app', pw_hash, now(), now(), now(), '', '')
  ON CONFLICT (id) DO NOTHING;

  -- ======================================
  -- 2. Student profiles
  --    Lovable schema: id (auto PK), user_id (FK auth.users), email (NOT NULL)
  --    C-Madong added: student_id, full_name_th, full_name_en, building_id, room_id, bed_id, etc.
  -- ======================================

  -- Student 1: ชวนชม floor 1
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_chuanchom AND r.floor = 1 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s1, 'seed1@c-madong.app', 'สมชาย เรียนดี', 'Somchai Riandee', '6530001021', 'student', b_chuanchom, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 2: ชวนชม floor 2
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_chuanchom AND r.floor = 2 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s2, 'seed2@c-madong.app', 'วิชัย ใจดี', 'Wichai Jaidee', '6530002034', 'student', b_chuanchom, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 3: พุดตาน floor 1
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_pudtan AND r.floor = 1 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s3, 'seed3@c-madong.app', 'ปิยะ สุขสม', 'Piya Suksom', '6630003045', 'student', b_pudtan, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 4: พุดซ้อน floor 3
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_pudson AND r.floor = 3 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s4, 'seed4@c-madong.app', 'กานต์ พรหมมา', 'Karn Promma', '6630004056', 'student', b_pudson, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 5: จำปา floor 2
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_chumpa AND r.floor = 2 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s5, 'seed5@c-madong.app', 'นภา แก้วใส', 'Napa Kaewsai', '6730005067', 'student', b_chumpa, r_id, bed_id, true, 'en')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 6: จำปี floor 4
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_chumpee AND r.floor = 4 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s6, 'seed6@c-madong.app', 'ศิริพร วงศ์สว่าง', 'Siriporn Wongsawang', '6730006078', 'student', b_chumpee, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 7: พุดตาน floor 5
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_pudtan AND r.floor = 5 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s7, 'seed7@c-madong.app', 'ธนา รักเรียน', 'Thana Rakrian', '6530007089', 'student', b_pudtan, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- Student 8: ชวนชม floor 3
  SELECT r.id, b.id INTO r_id, bed_id
    FROM rooms r JOIN beds b ON b.room_id = r.id
    WHERE r.building_id = b_chuanchom AND r.floor = 3 AND b.is_occupied = false
    ORDER BY r.room_number, b.bed_label LIMIT 1;
  INSERT INTO profiles (user_id, email, full_name_th, full_name_en, student_id, role, building_id, room_id, bed_id, onboarding_completed, language)
    VALUES (s8, 'seed8@c-madong.app', 'พิมพ์ชนก อยู่สุข', 'Pimchanok Yoosuk', '6630008090', 'student', b_chuanchom, r_id, bed_id, true, 'th')
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE beds SET is_occupied = true WHERE id = bed_id AND NOT is_occupied;

  -- ======================================
  -- 3. Technicians
  -- ======================================
  INSERT INTO technicians (id, display_name, specialty, phone, is_active)
  VALUES
    (t1, 'ช่างสมศักดิ์ (ไฟฟ้า)', 'electrical', '081-234-5678', true),
    (t2, 'ช่างประสิทธิ์ (ประปา)', 'plumbing', '082-345-6789', true),
    (t3, 'ช่างวิชัย (ทั่วไป)', 'general', '083-456-7890', true)
  ON CONFLICT (id) DO NOTHING;

  -- ======================================
  -- 4. Tags
  -- ======================================
  INSERT INTO tags (name, description, color)
  VALUES
    ('ชั้นปี 1', 'นิสิตชั้นปีที่ 1', '#FF6B6B'),
    ('ชั้นปี 2', 'นิสิตชั้นปีที่ 2', '#4ECDC4'),
    ('ชั้นปี 3', 'นิสิตชั้นปีที่ 3', '#45B7D1'),
    ('ชั้นปี 4', 'นิสิตชั้นปีที่ 4', '#96CEB4'),
    ('ทุนการศึกษา', 'นิสิตที่ได้รับทุนการศึกษา', '#FFEAA7')
  ON CONFLICT DO NOTHING;

  -- ======================================
  -- 5. Maintenance requests (requester_id = auth.users id)
  -- ======================================
  INSERT INTO maintenance_requests (requester_id, category, title, description, status, created_at)
  VALUES
    (s1, 'electrical', 'ไฟในห้องน้ำกระพริบ', 'ไฟในห้องน้ำกระพริบตลอดเวลา ใช้งานลำบากมากเลย ขอช่างมาดูหน่อยนะ', 'pending', now() - interval '2 hours'),
    (s3, 'plumbing', 'ก๊อกน้ำรั่ว', 'ก๊อกน้ำอ่างล้างหน้ารั่วซึมตลอด ปิดไม่สนิท', 'pending', now() - interval '1 day'),
    (s5, 'internet', 'WiFi ห้องสัญญาณอ่อนมาก', 'WiFi ใช้งานไม่ได้เลย สัญญาณอ่อนมาก โหลดอะไรไม่ขึ้น', 'pending', now() - interval '3 hours'),
    (s4, 'electrical', 'ไฟทางเดินชั้น 3 ดับเป็นบางช่วง', 'ช่วงกลางคืนไฟทางเดินหน้าห้องดับๆ ติดๆ ทำให้เดินลำบาก', 'pending', now() - interval '6 hours'),
    (s7, 'plumbing', 'แรงดันน้ำอ่างล้างจานเบามาก', 'น้ำไหลเบากว่าปกติมาก ล้างของไม่ค่อยสะดวก', 'pending', now() - interval '18 hours')
  ON CONFLICT DO NOTHING;

  INSERT INTO maintenance_requests (requester_id, category, title, description, status, created_at)
  VALUES
    (s2, 'air_conditioning', 'แอร์ไม่เย็น', 'เปิดแอร์ทั้งคืนแต่ไม่เย็นเลย อากาศร้อนมาก', 'acknowledged', now() - interval '2 days'),
    (s6, 'door_lock', 'กุญแจห้องเปิดยาก', 'ต้องขยับไปมาหลายรอบกว่าจะเปิดได้ กลัวล็อคตัวเองนอกห้อง', 'acknowledged', now() - interval '1 day'),
    (s1, 'air_conditioning', 'แอร์มีน้ำหยดลงเตียง', 'ตอนเปิดแอร์มีหยดน้ำตกลงมาจากเครื่องเป็นระยะ', 'acknowledged', now() - interval '20 hours')
  ON CONFLICT DO NOTHING;

  INSERT INTO maintenance_requests (requester_id, category, title, description, status, technician_id, created_at)
  VALUES
    (s4, 'furniture', 'โต๊ะเรียนขาหัก', 'ขาโต๊ะเรียนหักข้างนึง ใช้งานไม่ได้', 'in_progress', t3, now() - interval '3 days'),
    (s7, 'electrical', 'ปลั๊กไฟไม่ทำงาน 2 จุด', 'ปลั๊กไฟหัวเตียงกับข้างโต๊ะเสียทั้งคู่เลย', 'in_progress', t1, now() - interval '4 days'),
    (s8, 'plumbing', 'ฝักบัวน้ำไม่ออก', 'เปิดฝักบัวแล้วน้ำไม่ออกเลย มีแต่น้ำหยดๆ', 'in_progress', t2, now() - interval '2 days'),
    (s3, 'furniture', 'ประตูตู้เสื้อผ้าปิดไม่สนิท', 'บานประตูตู้ฝืดและปิดไม่สุด ต้องดันแรงมาก', 'in_progress', t3, now() - interval '5 days')
  ON CONFLICT DO NOTHING;

  INSERT INTO maintenance_requests (requester_id, category, title, description, status, technician_id, resolved_at, created_at)
  VALUES
    (s1, 'cleaning', 'ห้องน้ำรวมสกปรก', 'ห้องน้ำรวมชั้น 1 สกปรกมาก ขอแม่บ้านมาทำความสะอาดหน่อย', 'completed', t3, now() - interval '1 day', now() - interval '5 days'),
    (s2, 'air_conditioning', 'แอร์มีเสียงดัง', 'แอร์ส่งเสียงดังผิดปกติตอนทำงาน', 'completed', t1, now() - interval '12 hours', now() - interval '3 days'),
    (s5, 'electrical', 'ไฟหัวเตียงซ่อมแล้ว', 'ก่อนหน้านี้ไฟหัวเตียงติดๆ ดับๆ ตอนนี้ช่างแก้เรียบร้อยแล้ว', 'completed', t1, now() - interval '4 hours', now() - interval '4 days'),
    (s6, 'other', 'แจ้งผิด ห้องไม่มีปัญหา', 'ลองเช็คแล้วพบว่าอุปกรณ์ยังใช้งานได้ปกติ ขอปิดเคส', 'cancelled', NULL, NULL, now() - interval '8 hours')
  ON CONFLICT DO NOTHING;

  -- ======================================
  -- 6. Announcements (Lovable schema: title, content, created_by)
  -- ======================================
  IF admin_id IS NULL THEN
    SELECT user_id INTO admin_id FROM profiles WHERE role IN ('admin', 'head', 'super_admin') LIMIT 1;
  END IF;

  IF admin_id IS NOT NULL THEN
    INSERT INTO announcements (title, content, created_by, status, sent_at, target_type, created_at)
    VALUES
      ('ปิดน้ำชั่วคราว วันที่ 5 มี.ค.', 'แจ้งปิดน้ำเพื่อซ่อมบำรุงท่อน้ำหลัก วันที่ 5 มี.ค. เวลา 09:00-12:00 น.', admin_id, 'sent', now() - interval '2 days', 'broadcast', now() - interval '3 days'),
      ('กิจกรรม Big Cleaning Day', 'ขอเชิญชวนนิสิตทุกคนร่วมกิจกรรม Big Cleaning Day วันเสาร์ที่ 8 มี.ค. เวลา 08:00 น.', admin_id, 'sent', now() - interval '1 day', 'broadcast', now() - interval '2 days'),
      ('อัปเดตกฎหอพัก 2569', 'แจ้งอัปเดตกฎระเบียบหอพักฉบับปรับปรุง สามารถดาวน์โหลดได้ที่เว็บไซต์', admin_id, 'sent', now() - interval '5 hours', 'broadcast', now() - interval '1 day')
    ON CONFLICT DO NOTHING;

    INSERT INTO announcements (title, content, created_by, status, scheduled_at, target_type, created_at)
    VALUES
      ('ตรวจห้องพัก รอบ 1/2569', 'การตรวจห้องพักประจำภาคเรียนที่ 1/2569 จะเริ่มวันที่ 15 มี.ค. เป็นต้นไป', admin_id, 'scheduled', now() + interval '10 days', 'broadcast', now() - interval '1 day')
    ON CONFLICT DO NOTHING;

    INSERT INTO announcements (title, content, created_by, status, target_type, created_at)
    VALUES
      ('แจ้งค่าหอพัก เดือนมีนาคม', 'ขอให้นิสิตชำระค่าหอพักเดือนมีนาคม ภายในวันที่ 20 มี.ค.', admin_id, 'draft', 'broadcast', now() - interval '6 hours'),
      ('รับสมัครกรรมการหอพัก', 'เปิดรับสมัครกรรมการนิสิตหอพัก ประจำปีการศึกษา 2569', admin_id, 'draft', 'targeted', now() - interval '4 hours')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE NOTICE 'No admin user found — skipping announcements';
  END IF;

  -- ======================================
  -- 7. Message templates
  -- ======================================
  INSERT INTO message_templates (name, description, category, message_type, content, created_by)
  VALUES
    ('แจ้งเตือนทั่วไป', 'เทมเพลตสำหรับแจ้งข่าวสารทั่วไปให้นิสิต', 'general', 'text', 'สวัสดีนิสิตหอพัก\n\n{{message}}\n\nฝ่ายบริหารหอพัก', admin_id),
    ('แจ้งสถานะซ่อม', 'เทมเพลตแจ้งอัปเดตงานซ่อม', 'maintenance', 'text', 'แจ้งสถานะงานซ่อม\n\nรายการ: {{title}}\nสถานะ: {{status}}\nช่าง: {{technician}}', admin_id),
    ('แจ้งค่าใช้จ่าย', 'เทมเพลตแจ้งเตือนค่าหอพักรายเดือน', 'billing', 'text', 'แจ้งค่าหอพัก\n\nเดือน: {{month}}\nยอดรวม: {{amount}} บาท\nกำหนดชำระ: {{due_date}}', admin_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Dashboard seed data created successfully!';
END $$;

-- Step 3: Restore original trigger functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
