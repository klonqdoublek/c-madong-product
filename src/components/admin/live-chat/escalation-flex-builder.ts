/**
 * LINE Flex Message builder for admin escalation notifications.
 * Sends a Flex bubble to admin with student info + LIFF link to open live chat.
 */

import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const CU_PINK = "#E5487A"
const ALERT_YELLOW = "#F59E0B"
const TEXT_SECONDARY = "#00000099"

interface EscalationFlexData {
  escalationId: string
  studentName: string
  issueSummary: string
  sessionId: string
}

export function buildEscalationFlexMessage(
  data: EscalationFlexData,
  liffUrl?: string
): FlexMessagePayload {
  const webUrl = liffUrl
    ? `${liffUrl}/admin/live-chat?session=${data.escalationId}`
    : `https://c-madong-product.vercel.app/th/admin/live-chat?session=${data.escalationId}`

  return {
    type: "flex",
    altText: `🔔 ${data.studentName} ต้องการความช่วยเหลือ`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: CU_PINK,
        paddingAll: "16px",
        contents: [
          {
            type: "text",
            text: "🔔 มีนิสิตต้องการความช่วยเหลือ",
            color: "#FFFFFF",
            weight: "bold",
            size: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "20px",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                width: "40px",
                height: "40px",
                backgroundColor: `${ALERT_YELLOW}20`,
                cornerRadius: "20px",
                justifyContent: "center",
                alignItems: "center",
                contents: [
                  {
                    type: "text",
                    text: "👤",
                    size: "lg",
                    align: "center",
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: data.studentName,
                    weight: "bold",
                    size: "md",
                  },
                  {
                    type: "text",
                    text: "ขอคุยกับทีมงาน",
                    size: "xs",
                    color: TEXT_SECONDARY,
                  },
                ],
              },
            ],
          },
          {
            type: "separator",
            color: "#00000010",
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "เรื่อง:",
                size: "xs",
                color: TEXT_SECONDARY,
              },
              {
                type: "text",
                text: data.issueSummary || "ต้องการความช่วยเหลือ",
                size: "sm",
                wrap: true,
                maxLines: 3,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "16px",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "เปิดห้องแชท",
              uri: webUrl,
            },
            style: "primary",
            color: CU_PINK,
            height: "sm",
          },
        ],
      },
    },
  }
}
