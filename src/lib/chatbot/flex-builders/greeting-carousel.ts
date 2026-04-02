import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const CU_PINK = "#DD598B"
const TEXT_PRIMARY = "#333333"
const TEXT_SECONDARY = "#666666"
const WEB_BASE = "https://c-madong-product.vercel.app/th"

/** Greeting carousel for new (unregistered) users — 4 bubbles */
export function buildGreetingCarousel(
  displayName: string
): FlexMessagePayload {
  const bubble1 = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "🏠 ยินดีต้อนรับ!",
          size: "sm",
          color: "#FFFFFF",
          weight: "bold",
        },
      ],
      backgroundColor: CU_PINK,
      paddingAll: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: `สวัสดีจ้า ${displayName}! 👋`,
          size: "md",
          weight: "bold",
          color: TEXT_PRIMARY,
          wrap: true,
        },
        {
          type: "text",
          text: "น้องซีมะโด่งเป็นผู้ช่วยดิจิทัลของหอพักจุฬาฯ พร้อมช่วยเรื่องหอพักทุกอย่างเลยจ้า",
          size: "sm",
          color: TEXT_SECONDARY,
          wrap: true,
        },
        {
          type: "text",
          text: "🤖 น้องซีมะโด่งพร้อมช่วยเสมอ!",
          size: "sm",
          color: CU_PINK,
          weight: "bold",
          margin: "md",
        },
      ],
      paddingAll: "lg",
    },
  }

  const bubble2 = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "⭐ ฟีเจอร์หลัก",
          size: "sm",
          color: "#FFFFFF",
          weight: "bold",
        },
      ],
      backgroundColor: CU_PINK,
      paddingAll: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "สิ่งที่น้องซีช่วยได้",
          size: "md",
          weight: "bold",
          color: TEXT_PRIMARY,
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "🔧 แจ้งซ่อม — ถ่ายรูป แจ้งปัญหาได้เลย",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: "📊 คะแนนหอ — เช็คคะแนนความประพฤติ",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: "📦 พัสดุ — แจ้งเตือนเมื่อพัสดุมาถึง",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: "💰 ค่าหอ — ตรวจสอบยอดค้างชำระ",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
          ],
        },
      ],
      paddingAll: "lg",
    },
  }

  const bubble3 = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "📋 เริ่มต้นใช้งาน",
          size: "sm",
          color: "#FFFFFF",
          weight: "bold",
        },
      ],
      backgroundColor: CU_PINK,
      paddingAll: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "3 ขั้นตอนง่ายๆ",
          size: "md",
          weight: "bold",
          color: TEXT_PRIMARY,
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "1️⃣ ลงทะเบียนผ่านเว็บแอป",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: "2️⃣ เลือกเมนูที่ต้องการ",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: "3️⃣ หรือพิมพ์ถามน้องซีได้เลย!",
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
          ],
        },
      ],
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: CU_PINK,
          height: "sm",
          action: {
            type: "uri",
            label: "ลงทะเบียน",
            uri: `${WEB_BASE}/register`,
          },
        },
      ],
      paddingAll: "md",
    },
    styles: { footer: { separator: true } },
  }

  const bubble4 = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "💬 ลองคุยเลย!",
          size: "sm",
          color: "#FFFFFF",
          weight: "bold",
        },
      ],
      backgroundColor: CU_PINK,
      paddingAll: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "ลองพิมพ์ได้เลย",
          size: "md",
          weight: "bold",
          color: TEXT_PRIMARY,
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: '💡 "แนะนำตัวหน่อย"',
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: '💡 "เช็คคะแนนหอ"',
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: '💡 "มีพัสดุมั้ย"',
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
            {
              type: "text",
              text: '💡 "ค่าหอเดือนนี้"',
              size: "sm",
              color: TEXT_SECONDARY,
              wrap: true,
            },
          ],
        },
      ],
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: CU_PINK,
          height: "sm",
          action: {
            type: "message",
            label: "แนะนำตัวหน่อย",
            text: "แนะนำตัวหน่อย",
          },
        },
      ],
      paddingAll: "md",
    },
    styles: { footer: { separator: true } },
  }

  return {
    type: "flex",
    altText: "🏠 ยินดีต้อนรับสู่หอพัก C-Madong!",
    contents: {
      type: "carousel",
      contents: [bubble1, bubble2, bubble3, bubble4],
    },
  }
}

/** Welcome back flex for returning (registered) users — single bubble */
export function buildWelcomeBackFlex(
  displayName: string
): FlexMessagePayload {
  return {
    type: "flex",
    altText: `ยินดีต้อนรับกลับ ${displayName}!`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🎉 ยินดีต้อนรับกลับ!",
            size: "sm",
            color: "#FFFFFF",
            weight: "bold",
          },
        ],
        backgroundColor: CU_PINK,
        paddingAll: "md",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: `สวัสดีจ้า ${displayName}! 👋`,
            size: "md",
            weight: "bold",
            color: TEXT_PRIMARY,
            wrap: true,
          },
          {
            type: "text",
            text: "น้องซีมะโด่งพร้อมช่วยเสมอจ้า เลือกเมนูด้านล่าง หรือพิมพ์อะไรมาก็ได้เลย ✨",
            size: "sm",
            color: TEXT_SECONDARY,
            wrap: true,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "เมนูด่วน:",
                size: "sm",
                weight: "bold",
                color: TEXT_PRIMARY,
              },
              {
                type: "text",
                text: '🔧 "แจ้งซ่อม" · 📊 "คะแนนหอ" · 📦 "พัสดุ" · 💰 "ค่าหอ"',
                size: "xs",
                color: TEXT_SECONDARY,
                wrap: true,
              },
            ],
          },
        ],
        paddingAll: "lg",
      },
    },
  }
}
