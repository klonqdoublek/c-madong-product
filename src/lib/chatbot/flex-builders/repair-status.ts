import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"

// Design tokens matching Figma "Ticket Create" (node 28:370)
const SUCCESS_GREEN = "#23BE47"
const CU_PINK = "#DD598B"
const CU_PINK_BG = "#F3B9D04D"
const CANCEL_RED = "#E44548"
const LINK_BLUE = "#0059FF"
const TEXT_PRIMARY = "#000000"
const TEXT_SECONDARY = "#00000099"

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: "💧",
  electrical: "💡",
  aircon: "❄️",
  furniture: "🪑",
  pest: "🐜",
  internet: "📶",
  other: "🔧",
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

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/**
 * Flex message after ticket is created — matches Figma "Ticket Create" design
 * Green header "✅ แจ้งซ่อมแล้ว" + pink ticket number box + details + 3 actions
 */
export function buildRepairStatusFlex(
  ticket: RepairTicket,
  displayName: string = "คุณ"
): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[ticket.category] ?? ticket.category
  const categoryEmoji = CATEGORY_EMOJI[ticket.category] ?? "🔧"
  const urgencyColor = URGENCY_COLORS[ticket.urgency] ?? URGENCY_COLORS.medium
  const urgencyLabel = URGENCY_LABELS[ticket.urgency] ?? "ปกติ"
  const shortId = ticket.id.slice(0, 8).toUpperCase()
  const ticketUrl = LIFF_URL ? `${LIFF_URL}/maintenance/${ticket.id}` : null

  return {
    type: "flex",
    altText: `✅ แจ้งซ่อมแล้ว: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Green header with "✅ แจ้งซ่อมแล้ว" ──
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
        contents: [
          // Ticket number highlight box
          {
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
          },

          // Detail rows
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

          // Separator before actions
          { type: "separator", color: "#E5E7EB" },
        ],
        paddingAll: "xl",
      },

      // ── Footer: 3 actions ──
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Green button: ติดตามสถานะ (always postback to show timeline flex)
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
          // Blue link: ดูประวัติการแจ้งซ่อม
          {
            type: "button",
            style: "link",
            color: LINK_BLUE,
            height: "sm",
            action: ticketUrl
              ? {
                  type: "uri",
                  label: "ดูประวัติการแจ้งซ่อม",
                  uri: `${LIFF_URL}/maintenance`,
                }
              : {
                  type: "postback",
                  label: "ดูประวัติการแจ้งซ่อม",
                  data: "action=repair_history",
                  displayText: "ดูประวัติการแจ้งซ่อม",
                },
          },
        ],
        paddingAll: "lg",
      },
    },
  }
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
