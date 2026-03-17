import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"

// CU Pink design tokens
const SUCCESS_GREEN = "#23BE47"
const CU_PINK = "#FF90DC"
const TEXT_PRIMARY = "#000000"
const TEXT_SECONDARY = "#00000099"
const DIVIDER = "#E5E7EB"

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: "💧",
  electrical: "💡",
  aircon: "❄️",
  furniture: "🪑",
  pest: "🐜",
  internet: "📶",
  other: "🔧",
}

interface RepairTicket {
  id: string
  category: string
  title: string
  photoCount?: number
}

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/** Success confirmation after ticket is created */
export function buildRepairStatusFlex(ticket: RepairTicket): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[ticket.category] ?? ticket.category
  const categoryEmoji = CATEGORY_EMOJI[ticket.category] ?? "🔧"
  const ticketUrl = LIFF_URL ? `${LIFF_URL}/maintenance/${ticket.id}` : null
  const shortId = ticket.id.slice(0, 8).toUpperCase()

  return {
    type: "flex",
    altText: `✅ แจ้งซ่อมสำเร็จ: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // Success header with green background
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "✅",
                size: "3xl",
                flex: 0,
              },
              { type: "filler" },
            ],
          },
          {
            type: "text",
            text: "แจ้งซ่อมสำเร็จแล้ว!",
            size: "xxl",
            color: "#FFFFFF",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "text",
            text: "เจ้าหน้าที่จะรับเรื่องเร็วๆ นี้นะ",
            size: "sm",
            color: "#FFFFFF",
            wrap: true,
            margin: "xs",
          },
        ],
        backgroundColor: SUCCESS_GREEN,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // Body with ticket details
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Ticket number highlight
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "หมายเลขใบแจ้งซ่อม",
                size: "xs",
                color: TEXT_SECONDARY,
                align: "center",
              },
              {
                type: "text",
                text: `#${shortId}`,
                size: "xl",
                color: CU_PINK,
                weight: "bold",
                align: "center",
                margin: "xs",
              },
            ],
            backgroundColor: "#FFF5FD",
            cornerRadius: "md",
            paddingAll: "md",
          },

          { type: "separator", color: DIVIDER },

          // Details
          buildRow("หมวดหมู่", `${categoryEmoji} ${categoryName}`),
          buildRow("รายละเอียด", ticket.title),
          ...(ticket.photoCount && ticket.photoCount > 0
            ? [buildRow("รูปภาพ", `📸 ${ticket.photoCount} รูป`)]
            : []),
          buildRow("สถานะ", "รอดำเนินการ", true),
        ],
        paddingAll: "xl",
      },

      // Footer with action button
      ...(ticketUrl
        ? {
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: CU_PINK,
                  height: "sm",
                  action: {
                    type: "uri",
                    label: "ดูรายละเอียดเพิ่มเติม",
                    uri: ticketUrl,
                  },
                },
                {
                  type: "text",
                  text: "💬 ติดตามสถานะได้ในแอป C-Madong",
                  size: "xxs",
                  color: TEXT_SECONDARY,
                  align: "center",
                  wrap: true,
                },
              ],
              paddingAll: "lg",
            },
          }
        : {}),
    },
  }
}

function buildRow(label: string, value: string, highlight: boolean = false) {
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
        color: highlight ? CU_PINK : TEXT_PRIMARY,
        weight: highlight ? "bold" : "regular",
        flex: 5,
        wrap: true,
      },
    ],
  }
}
