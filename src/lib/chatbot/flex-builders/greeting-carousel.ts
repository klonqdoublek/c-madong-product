import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const CU_PINK = "#DD598B"
const CU_PINK_BORDER = "#F9E1E9"
const CTA_GREEN = "#23BE47"
const TEXT_DARK = "#1E1E1E"
const TEXT_PRIMARY = "#333333"
const TEXT_SECONDARY = "#666666"
const TEXT_MUTED = "#878787"
const WEB_BASE = "https://c-madong-product.vercel.app/th"

// TODO: Replace with uploaded banner image URL when ready
// Should be 1040x520 (2:1) HTTPS image — pink background + mascot illustration
const WELCOME_BANNER_URL: string | null = null

function buildWelcomeStep(num: string, title: string, subtitleContents: unknown[]) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    margin: "md",
    contents: [
      {
        type: "box",
        layout: "vertical",
        width: "26px",
        height: "26px",
        backgroundColor: CU_PINK,
        cornerRadius: "13px",
        justifyContent: "center",
        contents: [
          {
            type: "text",
            text: num,
            color: "#FFFFFF",
            weight: "bold",
            size: "sm",
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
            text: title,
            size: "sm",
            weight: "bold",
            color: TEXT_DARK,
            wrap: true,
          },
          {
            type: "text",
            size: "xxs",
            color: TEXT_MUTED,
            wrap: true,
            contents: subtitleContents,
          },
        ],
      },
    ],
  }
}

/** Welcome single bubble for new users — shown on follow event before carousel */
export function buildWelcomeNewEntryFlex(
  displayName: string
): FlexMessagePayload {
  // Header: hero image if banner uploaded, else colored box header
  const header = WELCOME_BANNER_URL
    ? undefined // hero used instead — see below
    : {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            flex: 3,
            spacing: "xs",
            contents: [
              {
                type: "text",
                text: "ยินดีต้อนรับนิสิตหอพัก",
                size: "xs",
                color: "#FFFFFF",
              },
              {
                type: "text",
                text: "🎉 WELCOME!",
                size: "xxl",
                color: "#FFFFFF",
                weight: "bold",
              },
              {
                type: "text",
                text: "C-MADONG ระบบหอพักนิสิตอัจฉริยะ",
                size: "xxs",
                color: "#FFFFFF",
                wrap: true,
              },
            ],
          },
        ],
        backgroundColor: CU_PINK,
        paddingAll: "lg",
        paddingTop: "xl",
        paddingBottom: "xl",
      }

  const hero = WELCOME_BANNER_URL
    ? {
        type: "image",
        url: WELCOME_BANNER_URL,
        size: "full",
        aspectRatio: "2:1",
        aspectMode: "cover",
      }
    : undefined

  return {
    type: "flex",
    altText: `ยินดีต้อนรับนิสิตหอพัก C-Madong, ${displayName}! 🎉`,
    contents: {
      type: "bubble",
      size: "mega",
      ...(hero ? { hero } : {}),
      ...(header ? { header } : {}),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "เริ่มต้นใช้งานกันเลย!",
            size: "sm",
            weight: "bold",
            color: TEXT_DARK,
          },
          buildWelcomeStep("1", "สร้างบัญชี/เข้าสู่ระบบบน Line Mini App", [
            {
              type: "span",
              text: "สร้างบัญชี/เข้าสู่ระบบบน Line Mini App",
            },
          ]),
          buildWelcomeStep("2", "ทดสอบพิมพ์ข้อความหาน้องซีมะโด่ง", [
            { type: "span", text: "พิมพ์ " },
            { type: "span", text: "‘น้องซีมะโด่ง’ ", color: CU_PINK },
            { type: "span", text: "เพื่อเริ่มต้นใช้งานได้เลย!" },
          ]),
          buildWelcomeStep("3", "เริ่มต้นใช้งานได้เลย!", [
            {
              type: "span",
              text: "ใช้งานบน LINE CHAT หรือ LINE MINI APP ก็ได้เหมือนกันนะ!",
            },
          ]),
        ],
        paddingAll: "lg",
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "separator",
            color: CU_PINK_BORDER,
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: CTA_GREEN,
            cornerRadius: "8px",
            paddingAll: "md",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "👩🏻‍💻 สร้างบัญชีใหม่ หรือ เข้าสู่ระบบ",
                color: "#FFFFFF",
                weight: "bold",
                size: "sm",
                align: "center",
                wrap: true,
              },
            ],
            action: {
              type: "uri",
              label: "สร้างบัญชี/เข้าสู่ระบบ",
              uri: `${WEB_BASE}/login`,
            },
          },
          {
            type: "box",
            layout: "vertical",
            borderColor: CU_PINK_BORDER,
            borderWidth: "1px",
            cornerRadius: "8px",
            paddingAll: "md",
            contents: [
              {
                type: "text",
                text: "📚 ดูคู่มือการใช้งานน้องซีมะโด่ง",
                color: CU_PINK,
                weight: "bold",
                size: "sm",
                align: "center",
                wrap: true,
              },
            ],
            action: {
              type: "message",
              label: "ดูคู่มือ",
              text: "ดูคู่มือการใช้งานน้องซีมะโด่ง",
            },
          },
        ],
        paddingAll: "md",
      },
    },
  }
}

// --- Onboarding Carousel (from "ดูคู่มือ" CTA) ---
// 6-bubble tour - image-only format with tappable actions
// Banner images served from /public/line-banners/ — 1040x1040 square JPEGs
const BANNER_BASE = "https://c-madong-product.vercel.app/line-banners"
const ONBOARDING_BANNERS = {
  start: `${BANNER_BASE}/onboarding-1-start.jpg`, // เริ่มต้นใช้งานง่ายๆ
  ask: `${BANNER_BASE}/onboarding-2-ask.jpg`, // ถามอะไรตอบได้!
  repair: `${BANNER_BASE}/onboarding-3-repair.jpg`, // แจ้งซ่อมได้ ง่ายกว่าที่เคย!
  notify: `${BANNER_BASE}/onboarding-4-notify.jpg`, // แจ้งเตือนอัจฉริยะ
  miniApp: `${BANNER_BASE}/onboarding-5-miniapp.jpg`, // LINE MINI APP
  more: `${BANNER_BASE}/onboarding-6-more.jpg`, // ยังมีอีกเยอะ!
}

type FlexAction =
  | { type: "message"; label: string; text: string }
  | { type: "uri"; label: string; uri: string }

interface OnboardingBubbleConfig {
  bannerUrl: string
  action: FlexAction
}

function buildOnboardingBubble(config: OnboardingBubbleConfig) {
  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "image",
          url: config.bannerUrl,
          size: "full",
          aspectRatio: "1:1",
          aspectMode: "cover",
        },
      ],
      paddingAll: "0px",
      action: config.action,
    },
  }
}

/** 6-bubble onboarding carousel — shown when user taps "ดูคู่มือ" CTA on welcome bubble */
export function buildOnboardingCarousel(): FlexMessagePayload {
  const bubbles = [
    // 1 — เริ่มต้นใช้งานง่ายๆ (pink)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.start,
      action: { type: "message", label: "ลองส่งข้อความ", text: "น้องซีมะโด่ง" },
    }),
    // 2 — ถามอะไรตอบได้! (cream)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.ask,
      action: { type: "message", label: "ถามคำถาม", text: "ถามคำถาม" },
    }),
    // 3 — แจ้งซ่อมได้ ง่ายกว่าที่เคย! (pink)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.repair,
      action: { type: "message", label: "คู่มือแจ้งซ่อม", text: "คู่มือแจ้งซ่อม" },
    }),
    // 4 — แจ้งเตือนอัจฉริยะ (cream)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.notify,
      action: { type: "message", label: "ดูเมนูแจ้งเตือน", text: "แจ้งเตือนอัจฉริยะ" },
    }),
    // 5 — LINE MINI APP (cream)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.miniApp,
      action: { type: "uri", label: "เปิด LINE MINI APP", uri: `${WEB_BASE}/login` },
    }),
    // 6 — ยังมีอีกเยอะ! (pink)
    buildOnboardingBubble({
      bannerUrl: ONBOARDING_BANNERS.more,
      action: { type: "message", label: "ดูเพิ่มเติม", text: "ดูเพิ่มเติม" },
    }),
  ]

  return {
    type: "flex",
    altText: "คู่มือการใช้งานน้องซีมะโด่ง",
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  }
}

// --- How-To Carousel (from "ดูเพิ่มเติม" CTA on card 6) ---
// 5-bubble set 2 - image-only format (no text/CTAs)

const HOWTO_BANNERS = {
  contact: `${BANNER_BASE}/howto-1-contact.jpg`,
  gettingStarted: `${BANNER_BASE}/howto-2-getting-started.jpg`,
  shortcuts: `${BANNER_BASE}/howto-3-shortcuts.jpg`,
  account: `${BANNER_BASE}/howto-4-account.jpg`,
  faq: `${BANNER_BASE}/howto-5-faq.jpg`,
}

/** 5-bubble how-to carousel — shown when user taps "ดูเพิ่มเติม" on card 6 */
export function buildHowToCarousel(): FlexMessagePayload {
  const bubbles = [
    // 1 — ติดต่อสอบถาม (pink)
    buildOnboardingBubble({
      bannerUrl: HOWTO_BANNERS.contact,
      action: { type: "message", label: "ติดต่อเจ้าหน้าที่", text: "ติดต่อเจ้าหน้าที่" },
    }),
    // 2 — วิธีการใช้งานเบื้องต้น (cream)
    buildOnboardingBubble({
      bannerUrl: HOWTO_BANNERS.gettingStarted,
      action: { type: "uri", label: "ดูคู่มือการใช้งาน", uri: `${WEB_BASE}/guide/getting-started` },
    }),
    // 3 — คีย์ลัด (pink)
    buildOnboardingBubble({
      bannerUrl: HOWTO_BANNERS.shortcuts,
      action: { type: "uri", label: "ดูคีย์ลัดทั้งหมด", uri: `${WEB_BASE}/guide/shortcuts` },
    }),
    // 4 — เกี่ยวกับบัญชี (cream)
    buildOnboardingBubble({
      bannerUrl: HOWTO_BANNERS.account,
      action: { type: "uri", label: "ดูข้อมูลบัญชี", uri: `${WEB_BASE}/guide/account` },
    }),
    // 5 — คำถามที่พบบ่อย (pink)
    buildOnboardingBubble({
      bannerUrl: HOWTO_BANNERS.faq,
      action: { type: "uri", label: "ดูคำถามที่พบบ่อย", uri: `${WEB_BASE}/guide/faq` },
    }),
  ]

  return {
    type: "flex",
    altText: "ข้อมูลเพิ่มเติมเกี่ยวกับน้องซีมะโด่ง",
    contents: {
      type: "carousel",
      contents: bubbles,
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
