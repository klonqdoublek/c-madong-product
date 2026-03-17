-- Phase 4: Parcel Management
-- ============================================================================

-- Parcel status enum
DO $$ BEGIN
  CREATE TYPE parcel_status AS ENUM ('pending', 'notified', 'picked_up', 'returned', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Parcel type enum
DO $$ BEGIN
  CREATE TYPE parcel_type AS ENUM ('box', 'envelope', 'bag', 'oversized', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tracking_number TEXT,
  courier TEXT,
  parcel_type parcel_type NOT NULL DEFAULT 'box',
  description TEXT,
  status parcel_status NOT NULL DEFAULT 'pending',
  pickup_location TEXT NOT NULL DEFAULT 'สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกพุดซ้อน',
  pickup_code TEXT,
  registered_by UUID REFERENCES auth.users(id),
  notified_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parcels_student ON parcels(student_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_created ON parcels(created_at DESC);

-- Updated_at trigger (reuse existing function)
DROP TRIGGER IF EXISTS set_parcels_updated_at ON parcels;
CREATE TRIGGER set_parcels_updated_at
  BEFORE UPDATE ON parcels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

-- Students read own parcels
DROP POLICY IF EXISTS parcels_student_read ON parcels;
CREATE POLICY parcels_student_read ON parcels
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Students can update own parcels (mark picked up)
DROP POLICY IF EXISTS parcels_student_update ON parcels;
CREATE POLICY parcels_student_update ON parcels
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Parcel staff / admin full access via SECURITY DEFINER function
CREATE OR REPLACE FUNCTION is_parcel_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('parcel', 'super_admin', 'head', 'admin_staff', 'registrar')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS parcels_staff_all ON parcels;
CREATE POLICY parcels_staff_all ON parcels
  FOR ALL TO authenticated
  USING (is_parcel_staff());

-- Grant access for PostgREST
GRANT ALL ON TABLE public.parcels TO authenticated;
GRANT ALL ON TABLE public.parcels TO service_role;
GRANT SELECT ON TABLE public.parcels TO anon;

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
