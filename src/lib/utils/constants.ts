export const APP_NAME = "C-Madong";

export const MAINTENANCE_CATEGORIES = [
  "electrical",
  "plumbing",
  "furniture",
  "air_conditioning",
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
