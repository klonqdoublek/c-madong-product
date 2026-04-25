import type { FlexMessagePayload } from "./bill-reminder"

const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

export interface DigestTicket {
  id: string
  ticket_code?: string | null
  title: string
  category: string
  status: string
  urgency?: string | null
  building_name?: string | null
  created_at: string
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diffMs / 3_600_000)
  if (h < 1) return "< 1 ชม."
  if (h < 24) return `${h} ชม.`
  return `${Math.floor(h / 24)} วัน`
}

const STATUS_LABELS: Record<string, string> = {
  under_review: "รอประเมิน",
  acknowledged: "รับเรื่องแล้ว",
  in_progress:  "กำลังดำเนินการ",
}

const URGENCY_ICONS: Record<string, string> = {
  urgent: "🚨",
  high:   "⚠️",
  medium: "📋",
  low:    "✅",
}

export function buildTechnicianGroupDigest(
  tickets: DigestTicket[]
): FlexMessagePayload {
  const total = tickets.length
  const underReview = tickets.filter((t) => t.status === "under_review").length
  const acknowledged = tickets.filter((t) => t.status === "acknowledged").length
  const inProgress   = tickets.filter((t) => t.status === "in_progress").length

  const topTickets = [...tickets]
    .sort((a, b) => {
      const urgencyOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      const aU = urgencyOrder[a.urgency ?? "medium"] ?? 2
      const bU = urgencyOrder[b.urgency ?? "medium"] ?? 2
      return aU !== bU ? aU - bU : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    .slice(0, 8)

  const rows: object[] = topTickets.map((t) => {
    const code = t.ticket_code ? `#${t.ticket_code}` : `#${t.id.slice(0, 8).toUpperCase()}`
    const icon = URGENCY_ICONS[t.urgency ?? "medium"] ?? "📋"
    const status = STATUS_LABELS[t.status] ?? t.status

    return {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      paddingBottom: "6px",
      contents: [
        {
          type: "text",
          text: icon,
          size: "xs",
          flex: 0,
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          contents: [
            {
              type: "text",
              text: `${code} ${t.title}`,
              size: "xs",
              weight: "bold",
              wrap: true,
            },
            {
              type: "text",
              text: `${status} · ${timeAgo(t.created_at)}`,
              size: "xxs",
              color: "#888888",
            },
          ],
        },
      ],
    }
  })

  const now = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())

  return {
    type: "flex",
    altText: `📋 สรุปงานซ่อมประจำวัน — ${total} รายการ`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#DD598B",
        paddingAll: "12px",
        contents: [
          {
            type: "text",
            text: "📋 สรุปงานซ่อมประจำวัน",
            color: "#FFFFFF",
            size: "sm",
            weight: "bold",
          },
          {
            type: "text",
            text: now,
            color: "#FFFFFF99",
            size: "xxs",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "14px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              { type: "text", text: `รอประเมิน`, size: "xxs", color: "#F59E0B", flex: 1 },
              { type: "text", text: `รับเรื่องแล้ว`, size: "xxs", color: "#3B82F6", flex: 1 },
              { type: "text", text: `กำลังทำ`, size: "xxs", color: "#8B5CF6", flex: 1 },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              { type: "text", text: String(underReview), size: "lg", weight: "bold", color: "#F59E0B", flex: 1 },
              { type: "text", text: String(acknowledged), size: "lg", weight: "bold", color: "#3B82F6", flex: 1 },
              { type: "text", text: String(inProgress),   size: "lg", weight: "bold", color: "#8B5CF6", flex: 1 },
            ],
          },
          { type: "separator", margin: "sm" },
          ...rows,
          total > 8
            ? {
                type: "text",
                text: `+ อีก ${total - 8} รายการ`,
                size: "xxs",
                color: "#888888",
                align: "end",
              }
            : null,
        ].filter(Boolean) as object[],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#DD598B",
            height: "sm",
            action: {
              type: "uri",
              label: "📊 ดูทั้งหมดในเว็บ",
              uri: `${WEB_BASE}/th/admin/maintenance`,
            },
          },
        ],
      },
    },
  }
}
