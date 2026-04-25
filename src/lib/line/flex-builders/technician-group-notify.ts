import type { FlexMessagePayload } from "./bill-reminder"

const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

export interface TechGroupTicket {
  id: string
  ticket_code?: string | null
  title: string
  description: string
  category: string
  urgency?: string | null
  requester_name?: string | null
  building_name?: string | null
  room_number?: string | null
  damage_details?: string | null
}

const URGENCY_COLORS: Record<string, string> = {
  urgent: "#EF4444",
  high:   "#F97316",
  medium: "#F59E0B",
  low:    "#6B7280",
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: "🚨 เร่งด่วนมาก",
  high:   "⚠️ เร่งด่วน",
  medium: "📋 ปานกลาง",
  low:    "✅ ไม่เร่งด่วน",
}

export function buildTechnicianGroupNotifyFlex(
  ticket: TechGroupTicket
): FlexMessagePayload {
  const code = ticket.ticket_code ? `#${ticket.ticket_code}` : `#${ticket.id.slice(0, 8).toUpperCase()}`
  const urgency = ticket.urgency ?? "medium"
  const urgencyColor = URGENCY_COLORS[urgency] ?? "#F59E0B"
  const urgencyLabel = URGENCY_LABELS[urgency] ?? urgency
  const location = [ticket.building_name, ticket.room_number].filter(Boolean).join(" ห้อง ")
  const webUrl = `${WEB_BASE}/th/admin/maintenance?ticket=${ticket.id}`

  return {
    type: "flex",
    altText: `🔧 แจ้งซ่อมใหม่ ${code} — ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "horizontal",
        backgroundColor: urgencyColor,
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [
              {
                type: "text",
                text: "🔧 แจ้งซ่อมใหม่",
                color: "#FFFFFF",
                size: "xs",
                weight: "bold",
              },
              {
                type: "text",
                text: code,
                color: "#FFFFFF",
                size: "lg",
                weight: "bold",
              },
            ],
          },
          {
            type: "text",
            text: urgencyLabel,
            color: "#FFFFFF",
            size: "xxs",
            align: "end",
            gravity: "bottom",
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
            type: "text",
            text: ticket.title,
            weight: "bold",
            size: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: ticket.description.slice(0, 80) + (ticket.description.length > 80 ? "..." : ""),
            size: "xs",
            color: "#666666",
            wrap: true,
          },
          { type: "separator", margin: "sm" },
          {
            type: "box",
            layout: "vertical",
            spacing: "xs",
            contents: [
              location
                ? {
                    type: "text",
                    text: `🏠 ${location}`,
                    size: "xs",
                    color: "#555555",
                  }
                : null,
              ticket.requester_name
                ? {
                    type: "text",
                    text: `👤 ${ticket.requester_name}`,
                    size: "xs",
                    color: "#555555",
                  }
                : null,
              {
                type: "text",
                text: `📂 ${ticket.category}`,
                size: "xs",
                color: "#555555",
              },
            ].filter(Boolean) as object[],
          },
        ],
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
              label: "📋 ดูรายละเอียดในเว็บ",
              uri: webUrl,
            },
          },
        ],
      },
    },
  }
}
