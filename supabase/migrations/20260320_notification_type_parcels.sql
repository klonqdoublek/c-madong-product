-- Add parcel notification types to notifications.type CHECK constraint
-- The type column uses a CHECK constraint, not an enum

-- Drop existing CHECK constraint and recreate with parcel types added
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'maintenance_update', 'bill_due', 'bill_overdue',
  'score_added', 'event_new', 'event_reminder',
  'announcement', 'system',
  'parcel_arrived', 'parcel_reminder'
));
