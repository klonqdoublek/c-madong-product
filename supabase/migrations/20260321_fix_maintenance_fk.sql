-- Fix: PostgREST can't join maintenance_requests → profiles
-- because requester_id FK points to auth.users, not profiles.
-- Since profiles.id = auth.users.id, add a second FK to profiles
-- so PostgREST can infer the relationship for .select() joins.

-- Step 1: Clean up orphaned seed records (requester_id not in profiles)
DELETE FROM public.maintenance_requests
WHERE requester_id NOT IN (SELECT id FROM public.profiles);

-- Step 2: Add FK to profiles
ALTER TABLE public.maintenance_requests
ADD CONSTRAINT fk_maintenance_requester_profile
FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 3: Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
