import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"
import type { RepairDetection } from "../types"

const HEADER_BG = "#FFBF00"
const CONFIRM_GREEN = "#23BE47"
const EDIT_BLUE = "#0059FF"
const CANCEL_RED = "#E44548"
const LABEL_COLOR = "#00000099"
const TEXT_COLOR = "#000000"

const URGENCY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#E44548",
}
const URGENCY_LABELS: Record<string, string> = {
  low: "ปกติ",
  medium: "⚡️ ค่อนข้างด่วน",
  high: "⚡️ ด่วนมาก",
}

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: "💧",
  electrical: "💡",
  aircon: "❄️",
  furniture: "🪑",
  pest: "🐜",
  internet: "📶",
  other: "🔧",
}

export interface RepairConfirmContext {
  /** Ticket number (e.g. "0123456789A") */
  ticketNumber?: string
  /** Reporter display name */
  reporterName: string
  /** Room info (e.g. "ชั้น 11 ตึกชวนชม 1116B") */
  roomInfo: string
}

/** Repair confirmation Flex matching the Figma design — yellow header with mascot */
export function buildRepairConfirmFlex(
  detection: RepairDetection,
  context: RepairConfirmContext,
  photoCount: number = 0
): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[detection.category] ?? detection.category
  const categoryEmoji = CATEGORY_EMOJI[detection.category] ?? "🔧"
  const urgencyColor = URGENCY_COLORS[detection.urgency] ?? URGENCY_COLORS.medium
  const urgencyLabel = URGENCY_LABELS[detection.urgency] ?? "ปกติ"
  const ticketNumber = context.ticketNumber ?? "-"

  return {
    type: "flex",
    altText: `🔧 แจ้งซ่อม: ${detection.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Yellow header with badge + title + mascot ──
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          // "แจ้งซ่อม" badge (white pill)
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "แจ้งซ่อม",
                    size: "xxs",
                    color: "#565655",
                    weight: "bold",
                    align: "center",
                  },
                ],
                backgroundColor: "#FFFFFF",
                cornerRadius: "xxl",
                paddingStart: "md",
                paddingEnd: "md",
                paddingTop: "xs",
                paddingBottom: "xs",
                flex: 0,
              },
              // Spacer + mascot emoji
              { type: "filler" },
              {
                type: "text",
                text: "👩🏻‍🔧",
                size: "3xl",
                align: "end",
                flex: 0,
              },
            ],
            alignItems: "center",
          },
          // Title
          {
            type: "text",
            text: "การแจ้งซ่อมใหม่",
            size: "xxl",
            color: "#FFFFFF",
            weight: "bold",
            margin: "sm",
          },
          // Reporter name
          {
            type: "text",
            text: `@${context.reporterName}`,
            size: "md",
            color: "#FFFFFF",
            wrap: true,
            margin: "xs",
          },
        ],
        backgroundColor: HEADER_BG,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // ── Body: detail rows ──
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          // Ticket number
          buildDetailRow("หมายเลข:", ticketNumber, true),
          // Category
          buildDetailRow("ประเภท:", `${categoryEmoji} ${categoryName}`),
          // Description
          buildDetailRow("รายละเอียด:", detection.description),
          // Urgency
          {
            type: "box",
            layout: "horizontal",
            spacing: "lg",
            contents: [
              {
                type: "text",
                text: "ความเร่งด่วน:",
                size: "sm",
                color: LABEL_COLOR,
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
          // Room info
          buildDetailRow("ห้องพัก:", context.roomInfo),
          // Reporter
          buildDetailRow("ผู้แจ้ง:", context.reporterName),
          // Photos (if any)
          ...(photoCount > 0
            ? [buildDetailRow("รูปภาพ:", `📸 ${photoCount} รูป`)]
            : []),
        ],
        paddingAll: "xl",
      },

      // ── Footer: warning + action buttons ──
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Warning text
          {
            type: "text",
            text: "⚠️ โปรดตรวจสอบความถูกต้องก่อนยืนยันนะ ⚠️",
            size: "xxs",
            color: "#000000",
            align: "center",
            wrap: true,
          },
          { type: "separator", color: "#E5E7EB" },
          // Confirm button (green)
          {
            type: "button",
            style: "primary",
            color: CONFIRM_GREEN,
            height: "sm",
            action: {
              type: "postback",
              label: "✅ ยืนยันการแจ้งซ่อม",
              data: `action=repair_confirm&category=${detection.category}&urgency=${detection.urgency}`,
              displayText: "ยืนยันการแจ้งซ่อม ✅",
            },
          },
          // Edit button (blue link)
          {
            type: "button",
            style: "link",
            height: "sm",
            color: EDIT_BLUE,
            action: {
              type: "postback",
              label: "✏️ แก้ไขรายละเอียด",
              data: "action=repair_edit",
              displayText: "ขอแก้ไขรายละเอียด",
            },
          },
          // Cancel button (red link)
          {
            type: "button",
            style: "link",
            height: "sm",
            color: CANCEL_RED,
            action: {
              type: "postback",
              label: "❌ ยกเลิก",
              data: "action=repair_cancel",
              displayText: "ยกเลิกแจ้งซ่อม",
            },
          },
        ],
        paddingAll: "lg",
      },
      styles: { footer: { separator: true } },
    },
  }
}

function buildDetailRow(label: string, value: string, bold: boolean = false) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "lg",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: LABEL_COLOR,
        flex: 3,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: TEXT_COLOR,
        weight: bold ? "bold" : "regular",
        wrap: true,
        flex: 5,
      },
    ],
  }
}
