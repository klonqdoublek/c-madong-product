import type { EventType, EventStatus, AttendanceStatus, ImpactLevel } from "@/lib/supabase/types";

// ============================================================================
// Score Tier Configuration
// ============================================================================

export interface ScoreTier {
  label: string;
  labelEn: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  progressColor: string;
}

export const SCORE_TIERS: ScoreTier[] = [
  { label: "ดีเยี่ยม", labelEn: "Excellent", min: 90, max: 100, color: "text-green-700", bgColor: "bg-green-50", progressColor: "bg-green-500" },
  { label: "ดี", labelEn: "Good", min: 75, max: 89, color: "text-blue-700", bgColor: "bg-blue-50", progressColor: "bg-blue-500" },
  { label: "พอใช้", labelEn: "Fair", min: 60, max: 74, color: "text-yellow-700", bgColor: "bg-yellow-50", progressColor: "bg-yellow-500" },
  { label: "ต้องปรับปรุง", labelEn: "Needs Improvement", min: 0, max: 59, color: "text-red-700", bgColor: "bg-red-50", progressColor: "bg-red-500" },
];

export function getScoreTier(score: number): ScoreTier {
  return SCORE_TIERS.find((t) => score >= t.min && score <= t.max) ?? SCORE_TIERS[3];
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreProgressColor(score: number): string {
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function formatScoreChange(points: number): { text: string; color: string } {
  if (points > 0) return { text: `+${points}`, color: "text-green-600" };
  if (points < 0) return { text: `${points}`, color: "text-red-600" };
  return { text: "0", color: "text-muted-foreground" };
}

// ============================================================================
// Event Type Labels
// ============================================================================

export const EVENT_TYPE_CONFIG: Record<EventType, { labelTh: string; labelEn: string; color: string }> = {
  meeting: { labelTh: "ประชุม", labelEn: "Meeting", color: "bg-blue-100 text-blue-800" },
  evaluation: { labelTh: "ประเมิน", labelEn: "Evaluation", color: "bg-purple-100 text-purple-800" },
  safety_drill: { labelTh: "ซ้อมอพยพ", labelEn: "Safety Drill", color: "bg-orange-100 text-orange-800" },
  obligation: { labelTh: "ภาระหน้าที่", labelEn: "Obligation", color: "bg-red-100 text-red-800" },
  community_service: { labelTh: "จิตอาสา", labelEn: "Community Service", color: "bg-green-100 text-green-800" },
  social: { labelTh: "สังสรรค์", labelEn: "Social", color: "bg-pink-100 text-pink-800" },
  workshop: { labelTh: "เวิร์กชอป", labelEn: "Workshop", color: "bg-indigo-100 text-indigo-800" },
  sports: { labelTh: "กีฬา", labelEn: "Sports", color: "bg-emerald-100 text-emerald-800" },
  other: { labelTh: "อื่นๆ", labelEn: "Other", color: "bg-gray-100 text-gray-800" },
  activity: { labelTh: "กิจกรรม", labelEn: "Activity", color: "bg-cu-pink/20 text-cu-pink" },
  announcement: { labelTh: "ประกาศ", labelEn: "Announcement", color: "bg-slate-100 text-slate-700" },
};

export const EVENT_STATUS_CONFIG: Record<EventStatus, { labelTh: string; labelEn: string; color: string }> = {
  draft: { labelTh: "แบบร่าง", labelEn: "Draft", color: "bg-gray-100 text-gray-700" },
  published: { labelTh: "เผยแพร่", labelEn: "Published", color: "bg-blue-100 text-blue-700" },
  upcoming: { labelTh: "กำลังจะมาถึง", labelEn: "Upcoming", color: "bg-yellow-100 text-yellow-700" },
  ongoing: { labelTh: "กำลังดำเนินการ", labelEn: "Ongoing", color: "bg-green-100 text-green-700" },
  completed: { labelTh: "เสร็จสิ้น", labelEn: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { labelTh: "ยกเลิก", labelEn: "Cancelled", color: "bg-red-100 text-red-700" },
};

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { labelTh: string; labelEn: string; color: string }> = {
  registered: { labelTh: "ลงทะเบียน", labelEn: "Registered", color: "bg-blue-100 text-blue-700" },
  attended: { labelTh: "เข้าร่วม", labelEn: "Attended", color: "bg-green-100 text-green-700" },
  absent: { labelTh: "ขาด", labelEn: "Absent", color: "bg-red-100 text-red-700" },
  excused: { labelTh: "ลา", labelEn: "Excused", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { labelTh: "ยกเลิก", labelEn: "Cancelled", color: "bg-red-100 text-red-700" },
};

export const IMPACT_LEVEL_CONFIG: Record<ImpactLevel, { labelTh: string; labelEn: string }> = {
  high: { labelTh: "สูง", labelEn: "High" },
  medium: { labelTh: "ปานกลาง", labelEn: "Medium" },
  low: { labelTh: "ต่ำ", labelEn: "Low" },
  critical: { labelTh: "วิกฤต", labelEn: "Critical" },
};

export const EVENT_TYPES: EventType[] = [
  "meeting", "evaluation", "safety_drill", "obligation",
  "community_service", "social", "workshop", "sports", "other",
];

export const EVENT_STATUSES: EventStatus[] = [
  "draft", "published", "ongoing", "completed", "cancelled",
];
