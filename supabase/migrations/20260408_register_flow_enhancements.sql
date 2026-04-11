-- Register flow enhancements (2026-04-08)
-- 1. Add faculty column to profiles
-- 2. Force all buildings to 17 floors
-- 3. Enforce room capacity per building rule:
--    ชวนชม (Chuanchom) → 2 beds (A-B)
--    Other buildings → 4 beds (A-D)

-- 1. Add faculty column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS faculty TEXT;

-- 2. Update all buildings to have 17 floors
UPDATE public.buildings SET floors = 17;

-- 3. Set room capacity per building rule
UPDATE public.rooms r
SET capacity = 2
FROM public.buildings b
WHERE r.building_id = b.id AND b.name_th = 'ชวนชม';

UPDATE public.rooms r
SET capacity = 4
FROM public.buildings b
WHERE r.building_id = b.id AND b.name_th <> 'ชวนชม';

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
