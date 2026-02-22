import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"

const PRIMARY = "#7C3AED"

interface RepairTicket {
  id: string
  category: string
  title: string
}

/** Confirmation Flex after ticket is successfully created */
export function buildRepairStatusFlex(ticket: RepairTicket): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[ticket.category] ?? ticket.category

  return {
    type: "flex",
    altText: `✅ แจ้งซ่อมสำเร็จ: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "✅ แจ้งซ่อมเรียบร้อยแล้วจ้า!",
            size: "md",
            color: PRIMARY,
            weight: "bold",
          },
          { type: "separator", color: "#E5E7EB" },
          buildRow("หมายเลข", `#${ticket.id.slice(0, 8)}`),
          buildRow("หมวดหมู่", categoryName),
          buildRow("หัวข้อ", ticket.title),
          { type: "separator", color: "#E5E7EB" },
          {
            type: "text",
            text: "เจ้าหน้าที่จะรับเรื่องเร็วๆ นี้นะ 🙌",
            size: "xs",
            color: "#888888",
            wrap: true,
          },
        ],
        paddingAll: "xl",
      },
    },
  }
}

function buildRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: label, size: "xs", color: "#888888", flex: 3 },
      { type: "text", text: value, size: "sm", color: "#333333", flex: 5, wrap: true },
    ],
  }
}
