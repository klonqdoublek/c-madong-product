-- Add bed_selection to calendar enums
-- Must be a separate migration from INSERT usage (enum values not visible in same transaction)

ALTER TYPE dorm_calendar_category       ADD VALUE IF NOT EXISTS 'bed_selection';
ALTER TYPE calendar_cta_type            ADD VALUE IF NOT EXISTS 'internal_bed_selection';
ALTER TYPE calendar_completion_method   ADD VALUE IF NOT EXISTS 'auto_confirm';
