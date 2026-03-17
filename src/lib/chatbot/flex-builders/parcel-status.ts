import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const PRIMARY = "#DD598B"
const RED = "#E44548"
const GREEN = "#23BE47"
const GRAY = "#7A7A7A"
const LIFF_URL = "https://liff.line.me/2009201565"

interface ParcelItem {
  tracking: string
  typeLabel: string
  arrivedAt: string
}

interface ParcelStatusData {
  recipientName: string
  parcels: ParcelItem[]
  pickupLocation: string
}

/** Single parcel bubble for carousel use */
function buildParcelBubble(
  parcel: ParcelItem,
  index: number,
  total: number,
  recipientName: string,
  pickupLocation: string,
) {
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "📦 รายการพัสดุ",
          size: "sm",
          color: "#FFFFFF",
          weight: "bold",
          flex: 3,
        },
        {
          type: "text",
          text: `${index + 1}/${total}`,
          size: "xs",
          color: "#FFFFFFAA",
          align: "end",
          flex: 1,
        },
      ],
      backgroundColor: PRIMARY,
      paddingAll: "md",
      alignItems: "center",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: parcel.typeLabel,
          size: "sm",
          weight: "bold",
          color: "#333333",
        },
        {
          type: "text",
          text: parcel.tracking,
          size: "xs",
          color: "#555555",
          wrap: true,
        },
        {
          type: "text",
          text: `มาถึงเมื่อ ${parcel.arrivedAt}`,
          size: "xxs",
          color: GRAY,
          margin: "xs",
        },
        { type: "separator", color: "#F3F4F6", margin: "sm" },
        {
          type: "text",
          text: `พี่${recipientName} สามารถไปรับพัสดุได้ที่`,
          size: "xxs",
          color: "#555555",
          wrap: true,
        },
        {
          type: "text",
          text: `📍 ${pickupLocation}`,
          size: "xs",
          weight: "bold",
          color: "#333333",
          margin: "xs",
        },
      ],
      paddingAll: "md",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "เปิดดูใน Mini App เลย",
            uri: `${LIFF_URL}/parcels`,
          },
          style: "primary",
          color: PRIMARY,
          height: "sm",
        },
      ],
      paddingAll: "md",
    },
  }
}

/** Design 1: "รายการพัสดุ" — pending parcels (single bubble ≤2, carousel >2) */
export function buildParcelStatusFlex(data: ParcelStatusData): FlexMessagePayload {
  const { parcels, recipientName, pickupLocation } = data

  // 2+ parcels → carousel (one bubble per parcel)
  if (parcels.length >= 2) {
    const bubbles = parcels.slice(0, 10).map((p, i) =>
      buildParcelBubble(p, i, parcels.length, recipientName, pickupLocation)
    )

    return {
      type: "flex",
      altText: `📦 มีพัสดุรอรับ ${parcels.length} ชิ้น`,
      contents: {
        type: "carousel",
        contents: bubbles,
      },
    }
  }

  // 1-2 parcels → single bubble with numbered list
  const parcelRows = parcels.flatMap((p, i) => [
    {
      type: "text" as const,
      text: `${i + 1}. ${p.tracking}  ${p.typeLabel}`,
      size: "xs" as const,
      weight: "bold" as const,
      color: "#333333",
      wrap: true,
    },
    {
      type: "text" as const,
      text: `มาถึงเมื่อ ${p.arrivedAt}`,
      size: "xxs" as const,
      color: GRAY,
      margin: "xs" as const,
    },
    ...(i < parcels.length - 1
      ? [{ type: "spacer" as const, size: "sm" as const }]
      : []),
  ])

  return {
    type: "flex",
    altText: `📦 มีพัสดุรอรับ ${parcels.length} ชิ้น`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📦 รายการพัสดุ",
            size: "sm",
            color: "#FFFFFF",
            weight: "bold",
          },
        ],
        backgroundColor: PRIMARY,
        paddingAll: "md",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: `มีรายการที่ยังไม่ได้รับ ${parcels.length} ชิ้น`,
            size: "xs",
            color: RED,
            weight: "bold",
            wrap: true,
          },
          { type: "separator", color: "#F3F4F6", margin: "sm" },
          ...parcelRows,
          { type: "separator", color: "#F3F4F6", margin: "sm" },
          {
            type: "text",
            text: `พี่${recipientName} สามารถไปรับพัสดุได้ที่`,
            size: "xxs",
            color: "#555555",
            wrap: true,
          },
          {
            type: "text",
            text: `📍 ${pickupLocation}`,
            size: "xs",
            weight: "bold",
            color: "#333333",
            margin: "xs",
          },
        ],
        paddingAll: "md",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "เปิดดูใน Mini App เลย",
              uri: `${LIFF_URL}/parcels`,
            },
            style: "primary",
            color: PRIMARY,
            height: "sm",
          },
        ],
        paddingAll: "md",
      },
    },
  }
}

/** Design 2: "รับพัสดุทั้งหมดแล้ว" — no pending parcels card */
export function buildParcelAllReceivedFlex(): FlexMessagePayload {
  return {
    type: "flex",
    altText: "📦 รับพัสดุทั้งหมดแล้ว! ✅",
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "📦 รับพัสดุทั้งหมดแล้ว! ✅",
            size: "lg",
            weight: "bold",
            color: GREEN,
            wrap: true,
          },
          {
            type: "text",
            text: "สามารถกดปุ่มด้านล่างเพื่อดูประวัติการรับพัสดุได้เลยนะ",
            size: "xxs",
            color: GRAY,
            wrap: true,
            margin: "sm",
          },
          { type: "separator", color: "#F3F4F6", margin: "sm" },
        ],
        paddingAll: "md",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "เปิดดูใน Mini App เลย",
              uri: `${LIFF_URL}/parcels`,
            },
            style: "primary",
            color: GREEN,
            height: "sm",
          },
        ],
        paddingAll: "md",
      },
    },
  }
}
