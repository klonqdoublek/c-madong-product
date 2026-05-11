import type { NotificationType } from "@/lib/supabase/types";

/** Priority weights by notification type */
const PRIORITY_MAP: Partial<Record<NotificationType, number>> = {
  alert: 100,
  repair: 90,
  event_reminder: 85,
  bill: 80,
  parcel: 75,
  event: 55,
  announcement: 50,
  score: 60,
  calendar: 40,
  general: 30,
};

/** Calculate priority for a notification */
export function calculatePriority(type: NotificationType): number {
  return PRIORITY_MAP[type] ?? 50;
}

/** Threshold for also pushing to LINE */
export const LINE_PUSH_THRESHOLD = 70;
