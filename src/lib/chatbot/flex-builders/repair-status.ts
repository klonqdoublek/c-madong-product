import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"
import { CATEGORY_NAMES_TH } from "../constants"

const PRIMARY = "#7C3AED"

interface RepairTicket {
  id: string
  category: string
  title: string
  photoCount?: number
}

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/** Confirmation Flex after ticket is successfully created */
export function buildRepairStatusFlex(ticket: RepairTicket): FlexMessagePayload {
  const categoryName = CATEGORY_NAMES_TH[ticket.category] ?? ticket.category
  const ticketUrl = LIFF_URL ? `${LIFF_URL}/maintenance/${ticket.id}` : null

  const bodyContents: unknown[] = [
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
  ]

  if (ticket.photoCount && ticket.photoCount > 0) {
    bodyContents.push(buildRow("รูปภาพ", `${ticket.photoCount} รูป 📸`))
  }

  bodyContents.push(
    buildRow("สถานะ", "รอดำเนินการ"),
    { type: "separator", color: "#E5E7EB" },
    {
      type: "text",
      text: "เจ้าหน้าที่จะรับเรื่องเร็วๆ นี้นะ 🙌",
      size: "xs",
      color: "#888888",
      wrap: true,
    }
  )

  const result: FlexMessagePayload = {
    type: "flex",
    altText: `✅ แจ้งซ่อมสำเร็จ: ${ticket.title}`,
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: bodyContents,
        paddingAll: "xl",
      },
      ...(ticketUrl
        ? {
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: PRIMARY,
                  height: "sm",
                  action: {
                    type: "uri",
                    label: "ดูรายละเอียด",
                    uri: ticketUrl,
                  },
                },
              ],
              paddingAll: "lg",
            },
          }
        : {}),
    },
  }

  return result
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
