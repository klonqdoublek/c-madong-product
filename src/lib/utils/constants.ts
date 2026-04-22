export const APP_NAME = "C-Madong";

export const MAINTENANCE_CATEGORIES = [
  "electrical",
  "plumbing",
  "furniture",
  "air_conditioning",
  "aircon",
  "internet",
  "door_lock",
  "pest",
  "cleaning",
  "other",
] as const;

export const APPOINTMENT_HOURS = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9; // 9AM to 6PM
  return `${hour.toString().padStart(2, "0")}:00`;
});

export const USER_ROLES = ["student", "committee", "admin", "head"] as const;

// Service Desk: Status configuration with CU Pink palette
export const MAINTENANCE_STATUS_CONFIG = {
  pending: {
    labelKey: "maintenance.status.pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    dotColor: "bg-amber-500",
  },
  acknowledged: {
    labelKey: "maintenance.status.acknowledged",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  in_progress: {
    labelKey: "maintenance.status.inProgress",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    dotColor: "bg-purple-500",
  },
  completed: {
    labelKey: "maintenance.status.completed",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    dotColor: "bg-green-500",
  },
  cancelled: {
    labelKey: "maintenance.status.cancelled",
    color: "text-gray-500",
    bgColor: "bg-gray-50 border-gray-200",
    dotColor: "bg-gray-400",
  },
} as const;

export const KANBAN_COLUMNS = [
  { id: "pending" as const, labelKey: "maintenance.kanban.new" },
  { id: "acknowledged" as const, labelKey: "maintenance.kanban.acknowledged" },
  { id: "in_progress" as const, labelKey: "maintenance.kanban.inProgress" },
  { id: "completed" as const, labelKey: "maintenance.kanban.completed" },
  { id: "cancelled" as const, labelKey: "maintenance.kanban.cancelled" },
] as const;

export const TECHNICIAN_SPECIALTIES = [
  "electrical",
  "plumbing",
  "air_conditioning",
  "aircon",
  "general",
  "furniture",
  "internet",
  "door_lock",
] as const;

// Category icon mapping keys (component uses these to map to Lucide icons)
export const MAINTENANCE_CATEGORY_ICONS = {
  electrical: "Zap",
  plumbing: "Droplets",
  furniture: "Armchair",
  air_conditioning: "AirVent",
  aircon: "AirVent",
  internet: "Wifi",
  door_lock: "Lock",
  pest: "Bug",
  cleaning: "SprayCan",
  other: "Wrench",
} as const;
