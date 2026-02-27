import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"
import type { RepairDetection } from "../types"

const PRIMARY = "#7C3AED"
const URGENCY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
}
const URGENCY_LABELS: Record<string, string> = {
  low: "ปกติ",
  medium: "ค่อนข้างด่วน",
  high: "ด่วนมาก",
}

/** Repair confirmation Flex with Confirm/Edit/Cancel postback buttons */
export function buildRepairConfirmFlex(
  detection: RepairDetection,
  photoCount: number = 0
): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[detection.category] ?? detection.category
  const urgencyColor = URGENCY_COLORS[detection.urgency] ?? URGENCY_COLORS.medium
  const urgencyLabel = URGENCY_LABELS[detection.urgency] ?? "ปกติ"

  return {
    type: "flex",
    altText: `แจ้งซ่อม: ${detection.title}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🔧 แจ้งซ่อม — ยืนยันข้อมูล",
            size: "sm",
            color: "#FFFFFF",
            weight: "bold",
          },
        ],
        backgroundColor: PRIMARY,
        paddingAll: "lg",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          buildInfoRow("หมวดหมู่", categoryName),
          buildInfoRow("หัวข้อ", detection.title),
          buildInfoRow("รายละเอียด", detection.description),
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ความเร่งด่วน",
                size: "sm",
                color: "#888888",
                flex: 3,
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: urgencyLabel,
                    size: "xs",
                    color: "#FFFFFF",
                    align: "center",
                    weight: "bold",
                  },
                ],
                backgroundColor: urgencyColor,
                cornerRadius: "xl",
                paddingAll: "xs",
                flex: 2,
                justifyContent: "center",
              },
            ],
            alignItems: "center",
          },
          ...(photoCount > 0
            ? [buildInfoRow("รูปภาพ", `${photoCount} รูป 📸`)]
            : []),
          { type: "separator", color: "#E5E7EB", margin: "md" },
          {
            type: "text",
            text: "ข้อมูลถูกต้องไหมนะ? 🤔",
            size: "sm",
            color: "#555555",
            margin: "md",
          },
        ],
        paddingAll: "xl",
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: PRIMARY,
            height: "sm",
            action: {
              type: "postback",
              label: "✅ ยืนยัน",
              data: `action=repair_confirm&category=${detection.category}&title=${encodeURIComponent(detection.title)}&description=${encodeURIComponent(detection.description)}&urgency=${detection.urgency}`,
              displayText: "ยืนยันแจ้งซ่อม ✅",
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "postback",
              label: "✏️ แก้ไข",
              data: "action=repair_edit",
              displayText: "ขอแก้ไขข้อมูล",
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            color: "#EF4444",
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

function buildInfoRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: "#888888",
        flex: 3,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: "#333333",
        wrap: true,
        flex: 5,
      },
    ],
  }
}
