import { createAdminClient } from "@/lib/supabase/admin"
import { buildBillReminderFlex } from "@/lib/line/flex-builders/bill-reminder"
import type { BillData } from "@/lib/line/types"
import type { HandlerResponse } from "../types"

const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

function formatThaiDate(isoDate: string): string {
  const d = new Date(isoDate)
  const m = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`
}

export async function handleBilling(lineUid: string): Promise<HandlerResponse> {
  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from("profiles")
    .select("id, full_name_th, display_name")
    .eq("line_uid", lineUid)
    .single()

  if (!profile) {
    return { type: "text", text: "ไม่พบข้อมูลบัญชีจ้า ลองติดต่อเจ้าหน้าที่หอพักน้า" }
  }

  const { data: bills } = await adminDb
    .from("bills")
    .select("id, total_amount, due_date, status, billing_month, billing_year, billing_round")
    .eq("student_id", profile.id)
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true })
    .limit(3)

  if (!bills || bills.length === 0) {
    return {
      type: "text",
      text: `✅ ไม่มีบิลค้างชำระตอนนี้จ้า!\n\nดูประวัติการชำระทั้งหมดได้ที่แอป 📱`,
      quickReply: {
        items: [
          { type: "action", action: { type: "uri", label: "💰 ดูบิลทั้งหมด", uri: `${WEB_BASE}/th/billing` } },
          { type: "action", action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" } },
        ],
      },
    }
  }

  const bill = bills[0]
  const billData: BillData = {
    billId: bill.id,
    month: THAI_MONTHS[(bill.billing_month ?? 1) - 1],
    totalAmount: bill.total_amount,
    dueRound: bill.billing_round ?? 1,
    dueDate: formatThaiDate(bill.due_date),
    dueTime: "17.30น.",
    studentName: profile.full_name_th ?? profile.display_name ?? "นิสิต",
    buildingName: "",
    roomNumber: "",
    bedLabel: "",
    items: [{ label: "ค่าหอพัก", amount: bill.total_amount }],
  }

  const quickReplyItems: HandlerResponse["quickReply"] = bills.length > 1
    ? {
        items: [
          { type: "action", action: { type: "uri", label: `💰 ดูบิลทั้งหมด (${bills.length})`, uri: `${WEB_BASE}/th/billing` } },
          { type: "action", action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" } },
        ],
      }
    : undefined

  return {
    type: "flex",
    flex: buildBillReminderFlex(billData),
    ...(quickReplyItems ? { quickReply: quickReplyItems } : {}),
  }
}
