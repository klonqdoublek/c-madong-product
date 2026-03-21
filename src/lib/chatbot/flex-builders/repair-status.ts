import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"

// Design tokens matching Figma designs (nodes 28:370 & 53:336)
const SUCCESS_GREEN = "#23BE47"
const CU_PINK = "#DD598B"
const CU_PINK_BG = "#F3B9D04D"
const CANCEL_RED = "#E44548"
const LINK_BLUE = "#0059FF"
const TEXT_PRIMARY = "#000000"
const TEXT_SECONDARY = "#00000099"

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: "\u{1F4A7}",
  electrical: "\u{1F4A1}",
  aircon: "\u{2744}\u{FE0F}",
  furniture: "\u{1FA91}",
  pest: "\u{1F41C}",
  internet: "\u{1F4F6}",
  other: "\u{1F527}",
}

const URGENCY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#E44548",
}
const URGENCY_LABELS: Record<string, string> = {
  low: "🟢 ปกติ",
  medium: "🟡 ค่อนข้างด่วน",
  high: "⚡️ ด่วนมาก",
}

export interface RepairTicket {
  id: string
  category: string
  title: string
  description: string
  urgency: string
  reporterName: string
  roomInfo: string
  photoCount?: number
}

export interface AppointmentInfo {
  date: string // e.g. "จันทร์ที่ 29 มิถุนายน 2569"
  time: string // e.g. "13.00-14.00 น."
}

const WEB_BASE = "https://c-madong-product.vercel.app/th"

// ─── Shared helpers ───

function buildTicketNumberBox(shortId: string) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "หมายเลขใบแจ้งซ่อม",
        size: "xxs",
        color: TEXT_SECONDARY,
        align: "center",
      },
      {
        type: "text",
        text: `#${shortId}`,
        size: "xxl",
        color: CU_PINK,
        weight: "bold",
        align: "center",
        margin: "xs",
      },
    ],
    backgroundColor: CU_PINK_BG,
    cornerRadius: "md",
    paddingAll: "md",
  }
}

function buildDetailRows(ticket: RepairTicket) {
  const categoryName = CATEGORY_NAMES_TH[ticket.category] ?? ticket.category
  const categoryEmoji = CATEGORY_EMOJI[ticket.category] ?? "🔧"
  const urgencyColor = URGENCY_COLORS[ticket.urgency] ?? URGENCY_COLORS.medium
  const urgencyLabel = URGENCY_LABELS[ticket.urgency] ?? "ปกติ"

  return [
    buildDetailRow("ประเภท:", `${categoryEmoji} ${categoryName}`),
    buildDetailRow("รายละเอียด:", ticket.description),
    {
      type: "box",
      layout: "horizontal",
      spacing: "lg",
      contents: [
        {
          type: "text",
          text: "ความเร่งด่วน:",
          size: "sm",
          color: TEXT_SECONDARY,
          flex: 3,
        },
        {
          type: "text",
          text: urgencyLabel,
          size: "sm",
          color: urgencyColor,
          weight: "bold",
          flex: 5,
          wrap: true,
        },
      ],
    },
    buildDetailRow("ห้องพัก:", ticket.roomInfo),
    buildDetailRow("ผู้แจ้ง:", ticket.reporterName),
  ]
}

function buildDetailRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "lg",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: TEXT_SECONDARY,
        flex: 3,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: TEXT_PRIMARY,
        flex: 5,
        wrap: true,
      },
    ],
  }
}

// ─── Design 28:370 — "สร้างใบแจ้งซ่อมใหม่" (Ticket Creating) ───

/**
 * Shown immediately after ticket is created — prompts user to book appointment.
 * Green header "📝 สร้างใบแจ้งซ่อมใหม่" + ticket details + booking CTA
 */
export function buildTicketCreatingFlex(
  ticket: RepairTicket,
  displayName: string = "คุณ"
): FlexMessagePayload {
  const shortId = ticket.id.slice(0, 8).toUpperCase()
  const bookingUrl = `https://c-madong-product.vercel.app/th/booking/${ticket.id}`

  return {
    type: "flex",
    altText: `📝 สร้างใบแจ้งซ่อมใหม่: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Green header: "📝 สร้างใบแจ้งซ่อมใหม่" ──
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📝",
            size: "xl",
            color: "#FFFFFF",
          },
          {
            type: "text",
            text: "สร้างใบแจ้งซ่อมใหม่",
            size: "xl",
            color: "#FFFFFF",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "text",
            text: `@${displayName}`,
            size: "md",
            color: "#FFFFFF",
            margin: "sm",
          },
        ],
        backgroundColor: SUCCESS_GREEN,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // ── Body: ticket number + details + booking CTA ──
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          buildTicketNumberBox(shortId),
          ...buildDetailRows(ticket),
          { type: "separator", color: "#E5E7EB" },

          // Booking prompt
          {
            type: "text",
            text: "📅 ขั้นตอนต่อไปนัดหมายกับพี่ช่างได้เลย!",
            size: "sm",
            color: TEXT_SECONDARY,
            weight: "bold",
            align: "center",
            wrap: true,
          },

          // Green button: เลือกวันเวลานัดหมาย
          {
            type: "button",
            style: "primary",
            color: SUCCESS_GREEN,
            height: "sm",
            action: {
              type: "uri",
              label: "🗓️ เลือกวันเวลานัดหมาย",
              uri: bookingUrl,
            },
          },

          // Red text: ยกเลิกการแจ้งซ่อม
          {
            type: "button",
            style: "link",
            color: CANCEL_RED,
            height: "sm",
            action: {
              type: "postback",
              label: "❌ ยกเลิกการแจ้งซ่อม",
              data: `action=repair_cancel_ticket&id=${shortId}`,
              displayText: "ยกเลิกการแจ้งซ่อม",
            },
          },
        ],
        paddingAll: "xl",
      },
    },
  }
}

// ─── Design 53:336 — "แจ้งซ่อมแล้ว" (Ticket Created with appointment) ───

/**
 * Shown after user books appointment — ticket confirmed with appointment time.
 * Green header "✅ แจ้งซ่อมแล้ว" + details + appointment section + 3 actions
 */
export function buildRepairStatusFlex(
  ticket: RepairTicket,
  displayName: string = "คุณ",
  appointment?: AppointmentInfo
): FlexMessagePayload {
  const shortId = ticket.id.slice(0, 8).toUpperCase()

  const bodyContents: Record<string, unknown>[] = [
    buildTicketNumberBox(shortId),
    ...buildDetailRows(ticket),
  ]

  // Appointment section (if booked)
  if (appointment) {
    bodyContents.push({ type: "separator", color: "#E5E7EB" })
    bodyContents.push({
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "📅 เวลานัดหมาย",
          size: "sm",
          color: TEXT_PRIMARY,
          weight: "bold",
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "lg",
          contents: [
            {
              type: "text",
              text: appointment.date,
              size: "sm",
              color: TEXT_PRIMARY,
              flex: 5,
            },
            {
              type: "text",
              text: appointment.time,
              size: "sm",
              color: TEXT_PRIMARY,
              flex: 3,
            },
          ],
        },
      ],
    })
  }

  bodyContents.push({ type: "separator", color: "#E5E7EB" })

  return {
    type: "flex",
    altText: `✅ แจ้งซ่อมแล้ว: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Green header: "✅ แจ้งซ่อมแล้ว" ──
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "✅ แจ้งซ่อมแล้ว",
            size: "xxl",
            color: "#FFFFFF",
            weight: "bold",
          },
          {
            type: "text",
            text: `@${displayName}`,
            size: "md",
            color: "#FFFFFF",
            margin: "sm",
          },
        ],
        backgroundColor: SUCCESS_GREEN,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // ── Body ──
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: bodyContents,
        paddingAll: "xl",
      },

      // ── Footer: 3 actions ──
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: SUCCESS_GREEN,
            height: "sm",
            action: {
              type: "postback",
              label: "🔍 ติดตามสถานะ",
              data: `action=repair_track&id=${shortId}`,
              displayText: "ติดตามสถานะการแจ้งซ่อม",
            },
          },
          {
            type: "button",
            style: "link",
            color: CANCEL_RED,
            height: "sm",
            action: {
              type: "postback",
              label: "❌ ยกเลิกการแจ้งซ่อม",
              data: `action=repair_cancel_ticket&id=${shortId}`,
              displayText: "ยกเลิกการแจ้งซ่อม",
            },
          },
          {
            type: "button",
            style: "link",
            color: LINK_BLUE,
            height: "sm",
            action: {
              type: "uri",
              label: "ดูประวัติการแจ้งซ่อม",
              uri: `${WEB_BASE}/maintenance`,
            },
          },
        ],
        paddingAll: "lg",
      },
    },
  }
}
