-- Migration: Fix Phase 5 RLS policies referencing non-existent students table
-- Date: 2026-03-16
-- Purpose: Replace broken RLS policies on event_attendance and score_entries
--          that used "SELECT student_id FROM students WHERE line_user_id IN (...)"
--          with correct lookup: "SELECT student_id FROM profiles WHERE user_id = auth.uid()"
--
-- The profiles table (Lovable-origin) uses:
--   profiles.user_id  FK → auth.users.id   (NOT profiles.id)
--   profiles.student_id  text

BEGIN;

-- ============================================================================
-- 1. Fix event_attendance policies
-- ============================================================================

-- DROP broken SELECT policy (referenced students table)
DROP POLICY IF EXISTS "event_attendance_select" ON event_attendance;
CREATE POLICY "event_attendance_select" ON event_attendance
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT p.student_id FROM profiles p WHERE p.user_id = auth.uid())
    OR is_admin_or_staff()
  );

-- DROP broken INSERT policy (referenced students table)
DROP POLICY IF EXISTS "event_attendance_insert" ON event_attendance;
CREATE POLICY "event_attendance_insert" ON event_attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT p.student_id FROM profiles p WHERE p.user_id = auth.uid())
    OR is_admin_or_staff()
  );

-- event_attendance UPDATE policy (admin-only) was correct, but re-create for clarity
DROP POLICY IF EXISTS "event_attendance_update" ON event_attendance;
CREATE POLICY "event_attendance_update" ON event_attendance
  FOR UPDATE TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- ============================================================================
-- 2. Fix score_entries policies
-- ============================================================================

-- DROP broken SELECT policy (referenced students table)
DROP POLICY IF EXISTS "score_entries_select" ON score_entries;
CREATE POLICY "score_entries_select" ON score_entries
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT p.student_id FROM profiles p WHERE p.user_id = auth.uid())
    OR is_admin_or_staff()
  );

-- score_entries admin write policy was correct, but re-create for safety
DROP POLICY IF EXISTS "score_entries_admin_write" ON score_entries;
CREATE POLICY "score_entries_admin_write" ON score_entries
  FOR ALL TO authenticated
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

COMMIT;
