import type { Database } from "@/lib/supabase/types";

export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];
export type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"];

export type MessageTemplate = Database["public"]["Tables"]["message_templates"]["Row"];
export type MessageTemplateInsert = Database["public"]["Tables"]["message_templates"]["Insert"];
export type MessageTemplateUpdate = Database["public"]["Tables"]["message_templates"]["Update"];

export const ANNOUNCEMENT_STATUSES = [
  { value: "draft", labelKey: "statusDraft" },
  { value: "scheduled", labelKey: "statusScheduled" },
  { value: "sent", labelKey: "statusSent" },
] as const;

export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number]["value"];

export const TEMPLATE_CATEGORIES = [
  { value: "general", labelKey: "categoryGeneral" },
  { value: "maintenance", labelKey: "categoryMaintenance" },
  { value: "billing", labelKey: "categoryBilling" },
  { value: "event", labelKey: "categoryEvent" },
  { value: "emergency", labelKey: "categoryEmergency" },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["value"];
