-- Service Desk: technicians table + maintenance_requests upgrades
-- Phase A of Lovable → C-Madong port

-- 1. Create technician_specialty enum
DO $$ BEGIN
  CREATE TYPE technician_specialty AS ENUM (
    'electrical', 'plumbing', 'air_conditioning', 'general', 'furniture', 'internet', 'door_lock'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE,
  display_name text NOT NULL,
  specialty technician_specialty NOT NULL DEFAULT 'general',
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2b. Create maintenance_requests base table (if not exists)
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  appointment_date text,
  appointment_time text,
  ai_category text,
  ai_priority text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Add new columns to maintenance_requests
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS failure_reason text;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_technician ON maintenance_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_requester ON maintenance_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_technicians_active ON technicians(is_active) WHERE is_active = true;

-- 5. RPC: book_appointment — SECURITY DEFINER for public booking
CREATE OR REPLACE FUNCTION book_appointment(
  p_ticket_id uuid,
  p_date date,
  p_time text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE maintenance_requests
  SET
    appointment_date = p_date::text,
    appointment_time = p_time,
    updated_at = now()
  WHERE id = p_ticket_id
    AND status IN ('pending', 'acknowledged');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found or not in bookable status';
  END IF;
END;
$$;

-- 6. Enable RLS
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- RLS for technicians: authenticated users can read active technicians
CREATE POLICY "Authenticated users can read technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (true);

-- Admin/head can manage technicians
CREATE POLICY "Admin can manage technicians"
  ON technicians FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'head')
    )
  );

-- RLS for maintenance_requests (if not already set)
DO $$ BEGIN
  ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Students can read their own requests
CREATE POLICY "Students can read own requests"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

-- Students can create requests
CREATE POLICY "Students can create requests"
  ON maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Admin/head can do everything
CREATE POLICY "Admin full access to maintenance_requests"
  ON maintenance_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'head')
    )
  );

-- 7. Enable realtime on maintenance_requests
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;

-- 8. Updated_at trigger for technicians
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
