-- Backfill bilingual columns on seed announcements (title_th was auto-copied from title)
-- Also set title_en for any seed data that has Thai-only titles

UPDATE public.announcements
  SET title_en = CASE
    WHEN title LIKE '%ปิดน้ำ%' THEN 'Temporary Water Shutdown Mar 5'
    WHEN title LIKE '%Big Cleaning%' THEN 'Big Cleaning Day Event'
    WHEN title LIKE '%อัปเดตกฎ%' THEN 'Dorm Rules Update 2026'
    WHEN title LIKE '%ตรวจห้อง%' THEN 'Room Inspection Round 1/2026'
    WHEN title LIKE '%ค่าหอพัก%' THEN 'March Dorm Fee Notice'
    WHEN title LIKE '%กรรมการ%' THEN 'Dorm Committee Recruitment'
    ELSE title_en
  END,
  content_en = CASE
    WHEN title LIKE '%ปิดน้ำ%' THEN 'Water will be shut down for pipe maintenance on Mar 5, 09:00-12:00.'
    WHEN title LIKE '%Big Cleaning%' THEN 'Join our Big Cleaning Day on Saturday Mar 8 at 08:00.'
    WHEN title LIKE '%อัปเดตกฎ%' THEN 'Updated dorm regulations are now available for download on our website.'
    WHEN title LIKE '%ตรวจห้อง%' THEN 'Room inspections for semester 1/2026 will begin on Mar 15.'
    WHEN title LIKE '%ค่าหอพัก%' THEN 'Please pay your March dorm fee by Mar 20.'
    WHEN title LIKE '%กรรมการ%' THEN 'Now accepting applications for dorm student committee 2026.'
    ELSE content_en
  END
WHERE title_en = '' OR title_en IS NULL;
