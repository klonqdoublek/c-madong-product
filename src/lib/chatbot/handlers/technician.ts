import { createAdminClient } from "@/lib/supabase/admin"
import type { HandlerResponse } from "../types"

const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

// Role gate: which profiles count as staff/technician
const TECH_ROLES = new Set([
  "technician", "technician_head", "technician_it",
  "admin", "super_admin", "head", "admin_staff",
])

async function isTechnicianRole(lineUid: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("line_uid", lineUid)
    .single()
  if (!data?.role) return false
  return TECH_ROLES.has(data.role)
}

const STATUS_LABELS: Record<string, string> = {
  under_review: "รอประเมิน",
  acknowledged:  "รับเรื่องแล้ว",
  in_progress:   "กำลังดำเนินการ",
  completed:     "เสร็จสิ้น",
  cancelled:     "ยกเลิก",
}

const TECH_QUICK_REPLY = [
  { type: "action" as const, action: { type: "message" as const, label: "🏠 เมนูหลัก", text: "น้องซีมะโด่ง" } },
  { type: "action" as const, action: { type: "uri" as const, label: "🔧 ดูทั้งหมดในเว็บ", uri: `${WEB_BASE}/th/admin/maintenance` } },
]

/** List today's open tickets (assigned to caller first, then others) */
async function handleDailyTasks(lineUid: string): Promise<HandlerResponse> {
  const supabase = createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Get caller's technician ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("line_uid", lineUid)
    .single()

  const { data: techProfile } = profile
    ? await supabase
        .from("technicians")
        .select("id, display_name")
        .eq("line_user_id", lineUid)
        .single()
    : { data: null }

  const { data: tickets } = await supabase
    .from("maintenance_requests")
    .select("id, ticket_code, title, status, category, technician_id")
    .in("status", ["under_review", "acknowledged", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(15)

  if (!tickets || tickets.length === 0) {
    return {
      type: "text",
      text: "🎉 วันนี้ไม่มีงานค้างอยู่เลยจ้า! ดีมากๆ",
      quickReply: { items: TECH_QUICK_REPLY },
    }
  }

  // Sort: assigned to me first
  const sorted = [...tickets].sort((a, b) => {
    const aMe = a.technician_id === techProfile?.id ? 0 : 1
    const bMe = b.technician_id === techProfile?.id ? 0 : 1
    return aMe - bMe
  })

  const lines = sorted.slice(0, 10).map((t) => {
    const code = t.ticket_code ? `#${t.ticket_code}` : `#${t.id.slice(0, 8).toUpperCase()}`
    const status = STATUS_LABELS[t.status] ?? t.status
    const mine = t.technician_id === techProfile?.id ? " (ของฉัน)" : ""
    return `${code} ${t.title.slice(0, 25)} — ${status}${mine}`
  })

  const text = `📋 งานวันนี้ทั้งหมด ${tickets.length} รายการ\n\n${lines.join("\n")}${tickets.length > 10 ? `\n... และอีก ${tickets.length - 10} รายการ` : ""}\n\nกดดูทั้งหมดในเว็บได้เลยจ้า 👇`

  return {
    type: "text",
    text,
    quickReply: { items: TECH_QUICK_REPLY },
  }
}

/** List technicians sorted by open ticket count (less = more free) */
async function handleWhoIsFree(): Promise<HandlerResponse> {
  const supabase = createAdminClient()

  const { data: technicians } = await supabase
    .from("technicians")
    .select("id, display_name, specialty")
    .eq("is_active", true)
    .limit(10)

  if (!technicians || technicians.length === 0) {
    return {
      type: "text",
      text: "ยังไม่มีข้อมูลช่างในระบบน้า",
      quickReply: { items: TECH_QUICK_REPLY },
    }
  }

  // Count in-progress tickets per technician
  const { data: inProgress } = await supabase
    .from("maintenance_requests")
    .select("technician_id")
    .in("status", ["acknowledged", "in_progress"])
    .not("technician_id", "is", null)

  const countMap: Record<string, number> = {}
  for (const t of inProgress ?? []) {
    if (t.technician_id) {
      countMap[t.technician_id] = (countMap[t.technician_id] ?? 0) + 1
    }
  }

  const sorted = technicians
    .map((t) => ({ ...t, workload: countMap[t.id] ?? 0 }))
    .sort((a, b) => a.workload - b.workload)
    .slice(0, 6)

  const lines = sorted.map((t) => {
    const bar = t.workload === 0 ? "🟢 ว่าง" : `🟡 ${t.workload} งาน`
    return `${bar} ${t.display_name} (${t.specialty})`
  })

  const text = `👷 สถานะช่าง\n\n${lines.join("\n")}\n\n🟢 = ว่าง · 🟡 = มีงานในมือ`

  return {
    type: "text",
    text,
    quickReply: { items: TECH_QUICK_REPLY },
  }
}

export async function handleTechnician(
  lineUid: string,
  message: string
): Promise<HandlerResponse | null> {
  // Role gate
  const isTech = await isTechnicianRole(lineUid)
  if (!isTech) return null

  const lower = message.toLowerCase()

  const DAILY_TRIGGERS = ["งานวันนี้", "วันนี้มีงานอะไร", "วันนี้มีงาน", "today tasks", "งานที่ต้องทำ"]
  const FREE_TRIGGERS = ["ใครว่าง", "ช่างคนไหนว่าง", "who is free", "who's free", "คนไหนว่าง", "ว่างไหม"]

  if (DAILY_TRIGGERS.some((kw) => lower.includes(kw))) {
    return handleDailyTasks(lineUid)
  }

  if (FREE_TRIGGERS.some((kw) => lower.includes(kw))) {
    return handleWhoIsFree()
  }

  return null
}

export function isTechnicianQuery(message: string): boolean {
  const lower = message.toLowerCase()
  const ALL_TRIGGERS = [
    "งานวันนี้", "วันนี้มีงานอะไร", "วันนี้มีงาน", "today tasks",
    "ใครว่าง", "ช่างคนไหนว่าง", "who is free", "who's free", "คนไหนว่าง",
  ]
  return ALL_TRIGGERS.some((kw) => lower.includes(kw))
}
