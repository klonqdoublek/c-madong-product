import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"
import type { RepairDetection } from "../types"

// Design tokens
const CONFIRM_GREEN = "#23BE47"
const EDIT_BLUE = "#0059FF"
const CANCEL_RED = "#E44548"
const BANNER_URL = "https://i.postimg.cc/QCqsdt0v/New_Request.jpg"
const TEXT_PRIMARY = "#000000"
const TEXT_SECONDARY = "#00000099"
const DIVIDER = "#E5E7EB"

const URGENCY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#E44548",
}
const URGENCY_LABELS: Record<string, string> = {
  low: "🟢 ปกติ",
  medium: "🟡 ค่อนข้างด่วน",
  high: "🔴 ด่วนมาก",
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
    altText: `🔧 ยืนยันแจ้งซ่อม: ${detection.title}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Hero banner with confirmation message overlay ──
      hero: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url: BANNER_URL,
            size: "full",
            aspectRatio: "16:9",
            aspectMode: "cover",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "🔧",
                    size: "3xl",
                    flex: 0,
                  },
                  { type: "filler" },
                  {
                    type: "text",
                    text: "👩🏻‍🔧",
                    size: "3xl",
                    align: "end",
                    flex: 0,
                  },
                ],
              },
              {
                type: "text",
                text: "ยืนยันการแจ้งซ่อม",
                size: "xxl",
                color: "#FFFFFF",
                weight: "bold",
                margin: "sm",
              },
              {
                type: "text",
                text: "กรุณาตรวจสอบข้อมูลก่อนยืนยัน",
                size: "sm",
                color: "#FFFFFF",
                wrap: true,
                margin: "xs",
              },
            ],
            position: "absolute",
            offsetTop: "0px",
            offsetStart: "0px",
            width: "100%",
            height: "100%",
            paddingAll: "xl",
            justifyContent: "center",
          },
        ],
        paddingAll: "0px",
      },

      // ── Body: detail rows with better hierarchy ──
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Title highlight
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: detection.title,
                size: "lg",
                color: TEXT_PRIMARY,
                weight: "bold",
                wrap: true,
              },
              {
                type: "text",
                text: `${categoryEmoji} ${categoryName}`,
                size: "sm",
                color: TEXT_SECONDARY,
                margin: "xs",
              },
            ],
          },

          { type: "separator", color: DIVIDER },

          // Description
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "รายละเอียด",
                size: "xs",
                color: TEXT_SECONDARY,
              },
              {
                type: "text",
                text: detection.description,
                size: "sm",
                color: TEXT_PRIMARY,
                wrap: true,
                margin: "xs",
              },
            ],
          },

          // Urgency badge
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "ความเร่งด่วน",
                size: "xs",
                color: TEXT_SECONDARY,
                flex: 0,
              },
              {
                type: "text",
                text: urgencyLabel,
                size: "sm",
                color: urgencyColor,
                weight: "bold",
                flex: 0,
              },
            ],
            alignItems: "center",
          },

          { type: "separator", color: DIVIDER },

          // Location & Reporter
          buildDetailRow("ห้องพัก", context.roomInfo),
          buildDetailRow("ผู้แจ้ง", context.reporterName),
          ...(photoCount > 0
            ? [buildDetailRow("รูปภาพ", `📸 ${photoCount} รูป`)]
            : []),
        ],
        paddingAll: "xl",
      },

      // ── Footer: action buttons ──
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          // Primary action: Confirm
          {
            type: "button",
            style: "primary",
            color: CONFIRM_GREEN,
            height: "sm",
            action: {
              type: "postback",
              label: "✅ ยืนยันการแจ้งซ่อม",
              data: "action=repair_confirm",
              displayText: "ยืนยันการแจ้งซ่อม ✅",
            },
          },
          // Secondary actions
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "link",
                height: "sm",
                color: EDIT_BLUE,
                action: {
                  type: "postback",
                  label: "✏️ แก้ไข",
                  data: "action=repair_edit",
                  displayText: "ขอแก้ไขรายละเอียด",
                },
                flex: 1,
              },
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
                flex: 1,
              },
            ],
          },
          // Info text
          {
            type: "text",
            text: "💡 ตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันนะ",
            size: "xxs",
            color: TEXT_SECONDARY,
            align: "center",
            wrap: true,
            margin: "sm",
          },
        ],
        paddingAll: "lg",
      },
      styles: { footer: { separator: true } },
    },
  }
}

function buildDetailRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "md",
    contents: [
      {
        type: "text",
        text: label,
        size: "xs",
        color: TEXT_SECONDARY,
        flex: 2,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: TEXT_PRIMARY,
        wrap: true,
        flex: 3,
      },
    ],
  }
}
