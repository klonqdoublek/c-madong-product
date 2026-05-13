import type { UserActiveContext } from "@/lib/notifications/context-fetcher"
import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

function thaiDaysLabel(days: number): string {
  if (days < 0) return "เลยกำหนด"
  if (days === 0) return "วันนี้!"
  if (days === 1) return "พรุ่งนี้"
  return `อีก ${days} วัน`
}

function buildRow(emoji: string, text: string, subtext?: string) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "box",
        layout: "horizontal",
        contents: [
          { type: "text", text: emoji, size: "sm", flex: 0 },
          { type: "text", text, size: "sm", color: "#1E1E1E", flex: 1, wrap: true, margin: "sm" },
        ],
        spacing: "sm",
      },
      ...(subtext
        ? [{
            type: "text",
            text: subtext,
            size: "xxs",
            color: "#9E9E9E",
            margin: "xs",
            offsetStart: "24px",
          }]
        : []),
    ],
    spacing: "xs",
  }
}

/** Build a small proactive context prepend flex bubble sent before answering user's message. */
export function buildContextPrependFlex(ctx: UserActiveContext): FlexMessagePayload {
  const rows: Record<string, unknown>[] = []

  for (const bill of ctx.pendingBills.slice(0, 2)) {
    const label = `฿${bill.totalAmount.toLocaleString()} — ${thaiDaysLabel(bill.daysUntilDue)}`
    rows.push(buildRow("💰", label, "ค่าหอพัก"))
  }

  for (const parcel of ctx.unclaimedParcels.slice(0, 2)) {
    const label = `รอรับ ${parcel.hoursWaiting} ชั่วโมง`
    rows.push(buildRow("📦", label, "พัสดุที่ยังไม่รับ"))
  }

  for (const ticket of ctx.openTickets.slice(0, 2)) {
    const STATUS_LABELS: Record<string, string> = {
      under_review: "รอประเมิน",
      acknowledged: "รับเรื่องแล้ว",
      in_progress: "กำลังดำเนินการ",
    }
    const label = `${ticket.ticketCode || "แจ้งซ่อม"} — ${STATUS_LABELS[ticket.status] ?? ticket.status}`
    rows.push(buildRow("🔧", label, ticket.title))
  }

  const bubble = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#FDF6F0",
      paddingAll: "12px",
      contents: [
        {
          type: "text",
          text: "🔔 อัปเดตของคุณ",
          size: "xs",
          weight: "bold",
          color: "#DD598B",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "12px",
      contents: rows,
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "10px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ดูทั้งหมดในแอป →",
            uri: `${WEB_BASE}/th/dashboard`,
          },
          style: "primary",
          color: "#DD598B",
          height: "sm",
        },
      ],
    },
  }

  return {
    type: "flex",
    altText: "🔔 อัปเดตของคุณ — มีรายการรออยู่นะ",
    contents: bubble,
  }
}
