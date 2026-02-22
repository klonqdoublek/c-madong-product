import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const PRIMARY = "#7C3AED"

/** Generic chatbot response bubble with น้องซีมะโด่ง branding */
export function buildChatbotResponseFlex(
  text: string,
  altText?: string
): FlexMessagePayload {
  return {
    type: "flex",
    altText: altText ?? text.slice(0, 60),
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🏠 น้องซีมะโด่ง",
            size: "xs",
            color: PRIMARY,
            weight: "bold",
          },
          {
            type: "text",
            text,
            size: "sm",
            color: "#333333",
            wrap: true,
            margin: "md",
          },
        ],
        paddingAll: "lg",
      },
    },
  }
}
