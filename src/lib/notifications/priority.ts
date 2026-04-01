import type { NotificationType } from "@/lib/supabase/types";

/** Priority weights by notification type */
const PRIORITY_MAP: Record<NotificationType, number> = {
  bill_overdue: 100,
  bill_due: 80,
  event_reminder: 85,
  parcel_arrived: 75,
  maintenance_update: 70,
  parcel_reminder: 65,
  score_added: 60,
  event_new: 55,
  chat_escalation: 90,
  announcement: 50,
  system: 40,
};

/** Calculate priority for a notification */
export function calculatePriority(type: NotificationType): number {
  return PRIORITY_MAP[type] ?? 50;
}

/** Threshold for also pushing to LINE */
export const LINE_PUSH_THRESHOLD = 70;
