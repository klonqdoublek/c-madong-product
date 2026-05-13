-- Add proactive notification fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS push_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Dispatch log: dedup + rate-limit guard for system-initiated pushes
CREATE TABLE IF NOT EXISTS notification_dispatch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  payload_hash text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_log_user_type_sent
  ON notification_dispatch_log (user_id, notification_type, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_dispatch_log_hash
  ON notification_dispatch_log (payload_hash, sent_at DESC);

-- RLS: users can read their own log; system writes via service role only
ALTER TABLE notification_dispatch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dispatch log"
  ON notification_dispatch_log FOR SELECT
  USING (user_id = auth.uid());
