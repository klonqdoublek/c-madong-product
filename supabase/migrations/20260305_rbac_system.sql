-- ============================================================================
-- RBAC (Role-Based Access Control) System for C-Madong
-- ============================================================================
-- Roles: 12 types with granular permissions
-- Building scopes for registrars: 8 options
-- Multi-role support per user
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------

-- App roles (12 types)
CREATE TYPE app_role AS ENUM (
  'super_admin',     -- ผอ.หอพัก / ผู้ดูแลระบบ
  'head',            -- หัวหน้ากลุ่มภารกิจหอพักนิสิต
  'registrar',       -- เจ้าหน้าที่ทะเบียน
  'finance',         -- เจ้าหน้าที่การเงิน
  'parcel',          -- เจ้าหน้าที่พัสดุ
  'admin_staff',     -- ธุรการหอพัก
  'service',         -- เจ้าหน้าที่บริการทั่วไป
  'activity',        -- เจ้าหน้าที่กิจกรรม
  'technician_head', -- หัวหน้าช่างหอพัก
  'technician',      -- ช่างหอพัก
  'technician_it',   -- ช่างไอที / ดูแลระบบ
  'committee',       -- กรรมการนิสิตหอพัก
  'student'          -- นิสิตหอพัก
);

-- Building codes (5 buildings)
CREATE TYPE building_code AS ENUM (
  'chumpee',    -- จำปี
  'chumpa',     -- จำปา
  'pudson',     -- พุดซ้อน
  'pudtan',     -- พุดตาน
  'chuanchom'   -- ชวนชม
);

-- Building scopes for registrars (8 options)
CREATE TYPE building_scope AS ENUM (
  'chumpee',    -- จำปี (เฉพาะอาคาร)
  'chumpa',     -- จำปา (เฉพาะอาคาร)
  'pudson',     -- พุดซ้อน (เฉพาะอาคาร)
  'pudtan',     -- พุดตาน (เฉพาะอาคาร)
  'chuanchom',  -- ชวนชม (เฉพาะอาคาร)
  'male',       -- หอพักชาย (Chumpee + Chumpa)
  'female',     -- หอพักหญิง (Pudson + Pudtan)
  'all'         -- ทุกอาคาร
);

-- ----------------------------------------------------------------------------
-- 2. User Roles Table (many-to-many: users can have multiple roles)
-- ----------------------------------------------------------------------------

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  building_scope building_scope, -- nullable, only for registrars
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for fast lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_user_roles_role ON user_roles(role) WHERE is_active = true;
CREATE INDEX idx_user_roles_building ON user_roles(building_scope) WHERE is_active = true;

-- Unique index: one user can have each role only once (with optional building scope)
-- For registrars: same role with different building scopes is allowed
CREATE UNIQUE INDEX idx_user_roles_unique
  ON user_roles(user_id, role, COALESCE(building_scope, 'all'::building_scope))
  WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 3. RLS Policies
-- ----------------------------------------------------------------------------

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can see their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin/head can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'head')
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Helper Functions
-- ----------------------------------------------------------------------------

-- Get all active roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id uuid)
RETURNS TABLE (
  role app_role,
  building_scope building_scope
) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role, ur.building_scope
  FROM user_roles ur
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role (optionally with building scope)
CREATE OR REPLACE FUNCTION has_role(
  p_user_id uuid,
  p_role app_role,
  p_building_scope building_scope DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_roles
  WHERE user_id = p_user_id
    AND role = p_role
    AND is_active = true
    AND (p_building_scope IS NULL OR building_scope = p_building_scope);

  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if registrar has access to specific building
CREATE OR REPLACE FUNCTION has_building_access(
  p_user_id uuid,
  p_target_building building_code
)
RETURNS boolean AS $$
DECLARE
  v_scope building_scope;
BEGIN
  -- Get registrar scope
  SELECT building_scope INTO v_scope
  FROM user_roles
  WHERE user_id = p_user_id
    AND role = 'registrar'
    AND is_active = true
  LIMIT 1;

  -- No registrar role found
  IF v_scope IS NULL THEN
    RETURN false;
  END IF;

  -- Check access based on scope
  RETURN CASE v_scope
    WHEN 'all' THEN true
    WHEN 'male' THEN p_target_building IN ('chumpee', 'chumpa')
    WHEN 'female' THEN p_target_building IN ('pudson', 'pudtan')
    WHEN 'chumpee' THEN p_target_building = 'chumpee'
    WHEN 'chumpa' THEN p_target_building = 'chumpa'
    WHEN 'pudson' THEN p_target_building = 'pudson'
    WHEN 'pudtan' THEN p_target_building = 'pudtan'
    WHEN 'chuanchom' THEN p_target_building = 'chuanchom'
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get students filtered by registrar's building scope
CREATE OR REPLACE FUNCTION get_registrar_students(p_registrar_id uuid)
RETURNS TABLE (
  student_id uuid,
  student_id_text text,
  full_name_th text,
  building_id building_code,
  room_number text,
  bed_number text
) AS $$
DECLARE
  v_scope building_scope;
BEGIN
  -- Get registrar scope
  SELECT building_scope INTO v_scope
  FROM user_roles
  WHERE user_id = p_registrar_id
    AND role = 'registrar'
    AND is_active = true
  LIMIT 1;

  -- Return filtered students
  RETURN QUERY
  SELECT
    p.id,
    p.student_id,
    p.full_name_th,
    p.building_id::building_code,
    r.room_number,
    b.bed_number
  FROM profiles p
  LEFT JOIN rooms r ON r.id = p.room_id
  LEFT JOIN beds b ON b.id = p.bed_id
  WHERE p.role = 'student'
    AND (
      v_scope IS NULL -- Not a registrar
      OR v_scope = 'all' -- All buildings
      OR (v_scope = 'male' AND p.building_id IN ('chumpee', 'chumpa'))
      OR (v_scope = 'female' AND p.building_id IN ('pudson', 'pudtan'))
      OR p.building_id::text = v_scope::text -- Specific building
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. Grant permissions
-- ----------------------------------------------------------------------------

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(uuid, app_role, building_scope) TO authenticated;
GRANT EXECUTE ON FUNCTION has_building_access(uuid, building_code) TO authenticated;
GRANT EXECUTE ON FUNCTION get_registrar_students(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. Comments
-- ----------------------------------------------------------------------------

COMMENT ON TYPE app_role IS 'Application roles for C-Madong dormitory system';
COMMENT ON TYPE building_code IS 'Building codes: chumpee (จำปี), chumpa (จำปา), pudson (พุดซ้อน), pudtan (พุดตาน), chuanchom (ชวนชม)';
COMMENT ON TYPE building_scope IS 'Building access scopes for registrars: individual buildings, gender groups, or all';

COMMENT ON TABLE user_roles IS 'User role assignments with optional building scope for registrars';
COMMENT ON COLUMN user_roles.building_scope IS 'Building access scope (only for registrars): chumpee, chumpa, pudson, pudtan, chuanchom, male, female, all';

COMMENT ON FUNCTION has_role IS 'Check if user has a specific role (with optional building scope)';
COMMENT ON FUNCTION has_building_access IS 'Check if registrar has access to a specific building';
COMMENT ON FUNCTION get_registrar_students IS 'Get students filtered by registrar''s building scope';
