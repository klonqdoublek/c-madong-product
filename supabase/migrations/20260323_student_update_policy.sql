-- Allow students to update their own maintenance requests
-- (needed for cancel, appointment booking, etc.)
CREATE POLICY "Students can update own requests"
  ON maintenance_requests FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid())
  WITH CHECK (requester_id = auth.uid());
