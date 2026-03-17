-- Phase 6: AI Adaptive UX Layer
-- Tables: notifications (revamped), ai_insights, chatbot_sessions ALTER

-- ============================================================================
-- 1. DROP & RECREATE notifications table (old one had is_read boolean, no real data)
-- ============================================================================
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'maintenance_update', 'bill_due', 'bill_overdue',
    'score_added', 'event_new', 'event_reminder',
    'announcement', 'system'
  )),
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  body_th TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  action_url TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_unread
  ON notifications (user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Students can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Students can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only service role can insert (via triggers/API)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    (current_setting('role', true) = 'service_role')
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'head', 'admin_staff')
        AND user_roles.is_active = true
    )
  );

-- Realtime
ALTER publication supabase_realtime ADD TABLE notifications;

-- RPC: get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM notifications
  WHERE user_id = p_user_id AND read_at IS NULL;
$$;

-- ============================================================================
-- 2. ai_insights table
-- ============================================================================
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'bill_due', 'bill_overdue', 'maintenance_pending',
    'event_upcoming', 'event_mandatory', 'score_low',
    'score_improvement', 'general_tip'
  )),
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  description_th TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  action_url TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  variant TEXT NOT NULL DEFAULT 'default' CHECK (variant IN ('featured', 'default')),
  icon_name TEXT,
  urgency_label TEXT,
  deadline TEXT,
  expires_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_insights_active
  ON ai_insights (user_id, created_at DESC)
  WHERE dismissed_at IS NULL;

-- RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss own insights"
  ON ai_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert insights"
  ON ai_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete insights"
  ON ai_insights FOR DELETE
  USING (true);

-- ============================================================================
-- 3. ALTER chatbot_sessions for context summaries
-- ============================================================================
ALTER TABLE chatbot_sessions
  ADD COLUMN IF NOT EXISTS context_summary TEXT,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
