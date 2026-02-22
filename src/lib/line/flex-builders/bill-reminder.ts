import type { BillData } from "../types"

/** Flex Message JSON structure (plain object, compatible with LINE API) */
export interface FlexMessagePayload {
  type: "flex"
  altText: string
  contents: Record<string, unknown>
}

const DEFAULT_BANNER_URL =
  "https://ik.imagekit.io/atlantis65/Banner%20-%20flex%20test.jpg"

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function buildItemRow(label: string, amount: number) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: "#565655",
        flex: 4,
      },
      {
        type: "text",
        text: fmt(amount),
        size: "sm",
        color: "#565655",
        weight: "bold",
        align: "end",
        flex: 2,
      },
    ],
  }
}

export function buildBillReminderFlex(data: BillData): FlexMessagePayload {
  const bannerUrl = data.bannerImageUrl ?? DEFAULT_BANNER_URL
  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? "{liffId}"
  const itemsTotal = data.items.reduce((sum, item) => sum + item.amount, 0)

  const bubble = {
    type: "bubble",
    size: "mega",
    hero: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "image",
          url: bannerUrl,
          size: "full",
          aspectRatio: "16:9",
          aspectMode: "cover",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `ค่าหอพักเดือน${data.month}`,
              color: "#FFFFFF",
              size: "xs",
              wrap: true,
            },
            {
              type: "text",
              text: `฿${fmt(data.totalAmount)}`,
              color: "#FFFFFF",
              size: "3xl",
              weight: "bold",
            },
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
                      text: `รอบที่ ${data.dueRound}`,
                      size: "xxs",
                      color: "#565655",
                      weight: "bold",
                      align: "center",
                    },
                  ],
                  backgroundColor: "#F9E1E9",
                  cornerRadius: "xl",
                  paddingAll: "xs",
                  flex: 0,
                  width: "52px",
                  height: "18px",
                  justifyContent: "center",
                },
                {
                  type: "text",
                  text: `${data.dueDate} เวลา ${data.dueTime}`,
                  color: "#FFFFFF",
                  size: "xs",
                  margin: "sm",
                  flex: 1,
                },
              ],
              alignItems: "center",
              margin: "md",
            },
            {
              type: "text",
              text: `*นำเงินเข้าก่อนเวลา ${data.dueTime} ${data.dueDate}`,
              color: "#FFFFFF99",
              size: "xxs",
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
      action: {
        type: "uri",
        label: "ดูรายละเอียด",
        uri: `https://liff.line.me/${liffId}/billing/${data.billId}`,
      },
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      contents: [
        {
          type: "text",
          text: `• ${data.studentName} - ${data.buildingName} - ${data.roomNumber} - เตียง ${data.bedLabel} •`,
          size: "xs",
          color: "#565655",
          align: "center",
          wrap: true,
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: data.items.map((item) =>
            buildItemRow(item.label, item.amount)
          ),
        },
        { type: "separator", color: "#E5E7EB" },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "รวมทั้งหมด",
              size: "sm",
              color: "#1E1E1E",
              weight: "bold",
              flex: 4,
            },
            {
              type: "text",
              text: fmt(itemsTotal),
              size: "sm",
              color: "#1E1E1E",
              weight: "bold",
              align: "end",
              flex: 2,
            },
          ],
        },
      ],
      paddingAll: "xl",
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#DD598B",
          height: "sm",
          action: {
            type: "postback",
            label: "🔔 เตือนฉันอีกครั้ง!",
            data: `action=remind_bill&bill_id=${data.billId}`,
            displayText: "เตือนฉันอีกครั้งนะ",
          },
        },
        {
          type: "button",
          style: "link",
          height: "sm",
          action: {
            type: "postback",
            label: "✅ ฉันนำเงินเข้าบัญชีแล้ว",
            data: `action=confirm_payment&bill_id=${data.billId}`,
            displayText: "ฉันนำเงินเข้าบัญชีแล้ว",
          },
          color: "#0059FF",
        },
      ],
      paddingAll: "lg",
    },
    styles: {
      footer: {
        separator: true,
      },
    },
  }

  return {
    type: "flex",
    altText: `💸 ค่าหอพักเดือน${data.month} ฿${fmt(data.totalAmount)} — อย่าลืมจ่ายนะ`,
    contents: bubble,
  }
}

/** Sample data for demo/preview */
export const DEMO_BILL_DATA: BillData = {
  billId: "bill-demo-001",
  month: "มกราคม",
  totalAmount: 3921.08,
  dueRound: 1,
  dueDate: "5 กุมภาพันธ์ 2569",
  dueTime: "17.30น.",
  studentName: "พิชญา พูลเพียร",
  buildingName: "ชวนชม",
  roomNumber: "1116",
  bedLabel: "B",
  items: [
    { label: "ค่าห้อง", amount: 3500.0 },
    { label: "ค่าประกัน", amount: 0.0 },
    { label: "ค่าไฟเดือนที่แล้ว", amount: 314.0 },
    { label: "ค่าน้ำเดือนที่แล้ว", amount: 17.0 },
    { label: "ค่าปรับ", amount: 0.0 },
  ],
}
