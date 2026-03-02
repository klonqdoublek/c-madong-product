-- Fix infinite recursion in RLS policies
-- Problem: "Admins can read all profiles" policy queries profiles table from within
-- profiles RLS → infinite recursion. Same issue on maintenance_requests admin policy.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to check admin role,
-- then use it in policies.

-- 1. Create helper function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'head')
  );
$$;

-- 2. Fix profiles policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- 3. Fix maintenance_requests admin policy
DROP POLICY IF EXISTS "Admin full access to maintenance_requests" ON public.maintenance_requests;
CREATE POLICY "Admin full access to maintenance_requests" ON public.maintenance_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 4. Fix announcements RLS (currently no RLS — add it properly)
-- Check if RLS is enabled on announcements
DO $$ BEGIN
  ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow authenticated users to read announcements
DO $$ BEGIN
  CREATE POLICY "Anyone can read announcements" ON public.announcements
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin can manage announcements
DO $$ BEGIN
  CREATE POLICY "Admin full access to announcements" ON public.announcements
    FOR ALL TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
