import type { FlexMessagePayload } from "./bill-reminder"

const BANNER_URL = "https://i.postimg.cc/3NZ7xRnP/Inbox.jpg"

export interface ParcelNotificationData {
  recipientName: string // "@ข้าวกล้อง :)"
  parcelCount: number // 2
  parcelTypes: string[] // ["💌 ซองจดหมาย", "📦 กล่องพัสดุ"]
  arrivedAt: string // "12 กุมภาพันธ์ 2569 เวลา 13.00 น."
  pickupLocation: string // "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกพุดซ้อน"
  pickupMapUrl?: string // Google Maps link
  liffId?: string // LIFF app ID for student card
}

function buildDetailRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: "#565655",
        flex: 2,
        wrap: true,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: "#1E1E1E",
        weight: "bold",
        flex: 4,
        wrap: true,
      },
    ],
    spacing: "sm",
  }
}

export function buildParcelNotificationFlex(
  data: ParcelNotificationData
): FlexMessagePayload {
  const liffId =
    data.liffId ?? process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? "{liffId}"

  const bubble = {
    type: "bubble",
    size: "mega",
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
            // Top row: badge + mascot emoji
            {
              type: "box",
              layout: "horizontal",
              contents: [
                // "แจ้งเตือน" pill badge
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "แจ้งเตือน",
                      size: "xxs",
                      color: "#DD598B",
                      weight: "bold",
                      align: "center",
                    },
                  ],
                  backgroundColor: "#FFFFFF",
                  cornerRadius: "xl",
                  paddingAll: "xs",
                  paddingStart: "md",
                  paddingEnd: "md",
                  flex: 0,
                  height: "22px",
                  justifyContent: "center",
                },
                { type: "filler" },
                // Mascot emoji in white circle
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "📦",
                      size: "xl",
                      align: "center",
                    },
                  ],
                  backgroundColor: "#FFFFFF",
                  cornerRadius: "xxl",
                  width: "40px",
                  height: "40px",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 0,
                },
              ],
              alignItems: "center",
            },
            // Title
            {
              type: "text",
              text: "มีพัสดุมาส่ง!",
              size: "xl",
              color: "#FFFFFF",
              weight: "bold",
              wrap: true,
              margin: "lg",
            },
            // Subtitle (recipient name)
            {
              type: "text",
              text: data.recipientName,
              size: "sm",
              color: "#FFFFFF",
              wrap: true,
              margin: "sm",
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
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      contents: [
        // Detail rows
        {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            buildDetailRow("จำนวน:", `${data.parcelCount} ชิ้น`),
            buildDetailRow("ประเภท:", data.parcelTypes.join("\n")),
            buildDetailRow("มาถึงเมื่อ:", data.arrivedAt),
          ],
        },
        { type: "separator", color: "#E5E7EB" },
        // Pickup info
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: `พี่ ${data.recipientName} สามารถไปรับพัสดุได้ที่`,
              size: "sm",
              color: "#565655",
              wrap: true,
            },
            {
              type: "text",
              text: `📍${data.pickupLocation}`,
              size: "sm",
              color: "#565655",
              weight: "bold",
              wrap: true,
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
        // Confirm received (postback)
        {
          type: "button",
          style: "link",
          height: "sm",
          action: {
            type: "postback",
            label: "✅ ฉันรับพัสดุเรียบร้อยแล้ว",
            data: "action=confirm_parcel_received",
            displayText: "ฉันรับพัสดุเรียบร้อยแล้ว",
          },
          color: "#0059FF",
        },
        // Open LIFF student card (URI)
        {
          type: "button",
          style: "primary",
          color: "#DD598B",
          height: "sm",
          action: {
            type: "uri",
            label: "📩 เปิดบัตรนิสิตหอพักเพื่อรับพัสดุ",
            uri: `https://liff.line.me/${liffId}/student-card`,
          },
        },
        // View map (URI, conditional)
        ...(data.pickupMapUrl
          ? [
              {
                type: "button",
                style: "link",
                height: "sm",
                action: {
                  type: "uri",
                  label: "ดูแผนที่",
                  uri: data.pickupMapUrl,
                },
                color: "#0059FF",
              },
            ]
          : []),
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
    altText: `📦 มีพัสดุ ${data.parcelCount} ชิ้นมาส่ง — ไปรับได้เลยนะ`,
    contents: bubble,
  }
}

/** Sample data for demo/preview */
export const DEMO_PARCEL_DATA: ParcelNotificationData = {
  recipientName: "@ข้าวกล้อง :)",
  parcelCount: 2,
  parcelTypes: ["💌 ซองจดหมาย", "📦 กล่องพัสดุ"],
  arrivedAt: "12 กุมภาพันธ์ 2569 เวลา 13.00 น.",
  pickupLocation: "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกพุดซ้อน",
  pickupMapUrl: "https://maps.app.goo.gl/example",
  liffId: "2009201565-AbCdEfGh",
}
