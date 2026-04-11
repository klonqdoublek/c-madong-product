-- Migration: Seed rooms (floors 6-17) and beds for all buildings
-- Date: 2026-04-09
-- Purpose:
--   1. Seed 8 rooms × 12 floors (6-17) × 5 buildings = 480 new rooms
--   2. Seed beds for new rooms:
--      - ชวนชม (capacity 2): bed labels A, B
--      - Others (capacity 4): bed labels A, B, C, D
--   3. Backfill bed D for existing rooms (floors 1-5) in non-ชวนชม buildings
--
-- Room number pattern: {floor}{NN} → floor 1 = "101".."108", floor 17 = "1701".."1708"
-- Idempotent via NOT EXISTS guards (no UNIQUE constraints on rooms/beds).

BEGIN;

DO $$
DECLARE
  bld RECORD;
  f INT;
  n INT;
  v_bed_label TEXT;
  r_id UUID;
  r_number TEXT;
  cap INT;
  bed_labels TEXT[];
BEGIN
  -- Iterate over all 5 buildings
  FOR bld IN
    SELECT id, name_th
    FROM public.buildings
    ORDER BY name_th
  LOOP
    -- Determine capacity + bed labels per building
    IF bld.name_th = 'ชวนชม' THEN
      cap := 2;
      bed_labels := ARRAY['A', 'B'];
    ELSE
      cap := 4;
      bed_labels := ARRAY['A', 'B', 'C', 'D'];
    END IF;

    -- ============================================================
    -- Part A: Seed rooms + beds for floors 6-17
    -- ============================================================
    FOR f IN 6..17 LOOP
      FOR n IN 1..8 LOOP
        r_number := f::TEXT || LPAD(n::TEXT, 2, '0');

        -- Insert room if not present
        IF NOT EXISTS (
          SELECT 1 FROM public.rooms
          WHERE building_id = bld.id AND room_number = r_number
        ) THEN
          INSERT INTO public.rooms (building_id, floor, room_number, capacity)
          VALUES (bld.id, f, r_number, cap)
          RETURNING id INTO r_id;
        ELSE
          SELECT id INTO r_id FROM public.rooms
          WHERE building_id = bld.id AND room_number = r_number
          LIMIT 1;
        END IF;

        -- Insert beds if not present
        FOREACH v_bed_label IN ARRAY bed_labels LOOP
          IF NOT EXISTS (
            SELECT 1 FROM public.beds
            WHERE room_id = r_id AND beds.bed_label = v_bed_label
          ) THEN
            INSERT INTO public.beds (room_id, bed_label)
            VALUES (r_id, v_bed_label);
          END IF;
        END LOOP;
      END LOOP;
    END LOOP;

    -- ============================================================
    -- Part B: Backfill bed D for non-ชวนชม rooms (floors 1-5)
    -- ============================================================
    IF bld.name_th <> 'ชวนชม' THEN
      INSERT INTO public.beds (room_id, bed_label)
      SELECT r.id, 'D'
      FROM public.rooms r
      WHERE r.building_id = bld.id
        AND r.floor BETWEEN 1 AND 5
        AND NOT EXISTS (
          SELECT 1 FROM public.beds b
          WHERE b.room_id = r.id AND b.bed_label = 'D'
        );
    END IF;
  END LOOP;
END $$;

COMMIT;
