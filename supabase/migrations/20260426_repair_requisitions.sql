-- Repair Requisitions: version-controlled history of generated ใบเบิก

CREATE TABLE repair_requisitions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         uuid        NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  version           int         NOT NULL DEFAULT 1,

  -- Snapshot of ticket data at time of generation
  ticket_code       text,
  title             text,
  category          text,
  requester_name    text,
  building_name     text,
  room_number       text,
  technician_name   text,
  appointment_date  text,
  appointment_time  text,

  -- Materials snapshot (frozen at generation time)
  materials_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Who generated it
  created_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE(ticket_id, version)
);

CREATE INDEX idx_repair_requisitions_ticket ON repair_requisitions(ticket_id);
CREATE INDEX idx_repair_requisitions_created ON repair_requisitions(created_at DESC);

ALTER TABLE repair_requisitions ENABLE ROW LEVEL SECURITY;

-- Admin can read + insert
CREATE POLICY "Admin read repair_requisitions"
  ON repair_requisitions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff',
                     'technician_head', 'technician', 'technician_it')
    )
  );

CREATE POLICY "Admin insert repair_requisitions"
  ON repair_requisitions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'head', 'super_admin', 'admin_staff',
                     'technician_head', 'technician', 'technician_it')
    )
  );
