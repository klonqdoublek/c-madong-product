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
// 6-bubble tour based on Figma nodes 73:389 → 73:395
// Banner images will be uploaded later — constants below are null until ready.
// When bannerUrl is set, bubble swaps from styled header+body to hero image + body.

const CREAM_BG = "#FBF6E9"
const CREAM_LIGHT = "#FFFEF5"
const TEXT_DARK_GREY = "#3F3F3D"
const CTA_PILL_BG = "#585856"

// Banner images served from /public/line-banners/ — 1800x1800 square JPEGs
const BANNER_BASE = "https://c-madong-product.vercel.app/line-banners"
const ONBOARDING_BANNERS = {
  start: `${BANNER_BASE}/onboarding-1-start.jpg` as string | null, // 73:389 — เริ่มต้นใช้งานง่ายๆ (pink)
  ask: `${BANNER_BASE}/onboarding-2-ask.jpg` as string | null, // 73:391 — ถามอะไรตอบได้! (cream)
  repair: `${BANNER_BASE}/onboarding-3-repair.jpg` as string | null, // 73:390 — แจ้งซ่อมได้ ง่ายกว่าที่เคย! (pink)
  notify: `${BANNER_BASE}/onboarding-4-notify.jpg` as string | null, // 73:392 — แจ้งเตือนอัจฉริยะ (cream)
  miniApp: `${BANNER_BASE}/onboarding-5-miniapp.jpg` as string | null, // 73:394 — LINE MINI APP (cream)
  more: `${BANNER_BASE}/onboarding-6-more.jpg` as string | null, // 73:395 — ยังมีอีกเยอะ! (pink)
}

type BubbleTheme = "pink" | "cream"

type CtaAction =
  | { kind: "message"; label: string; text: string }
  | { kind: "uri"; label: string; uri: string }

interface OnboardingBubbleConfig {
  theme: BubbleTheme
  bannerUrl: string | null
  title: string
  description: string
  cta: CtaAction
}

function buildCtaPill(cta: CtaAction) {
  const action =
    cta.kind === "message"
      ? { type: "message", label: cta.label, text: cta.text }
      : { type: "uri", label: cta.label, uri: cta.uri }

  return {
    type: "box",
    layout: "vertical",
    backgroundColor: CTA_PILL_BG,
    cornerRadius: "xxl",
    paddingTop: "md",
    paddingBottom: "md",
    paddingStart: "lg",
    paddingEnd: "lg",
    contents: [
      {
        type: "text",
        text: cta.label,
        color: "#FFFFFF",
        weight: "bold",
        size: "md",
        align: "center",
        wrap: true,
      },
    ],
    action,
  }
}

function buildOnboardingBubble(config: OnboardingBubbleConfig) {
  const isPink = config.theme === "pink"
  const bgColor = isPink ? CU_PINK : CREAM_BG
  const titleColor = isPink ? "#FFFFFF" : CU_PINK
  const descColor = isPink ? CREAM_LIGHT : TEXT_DARK_GREY

  // When banner is uploaded → use hero image + white body/footer
  if (config.bannerUrl) {
    return {
      type: "bubble",
      size: "kilo",
      hero: {
        type: "image",
        url: config.bannerUrl,
        size: "full",
        aspectRatio: "1:1",
        aspectMode: "cover",
        backgroundColor: bgColor,
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: config.title,
            weight: "bold",
            size: "lg",
            color: CU_PINK,
            wrap: true,
          },
          {
            type: "text",
            text: config.description,
            size: "sm",
            color: TEXT_DARK_GREY,
            wrap: true,
            margin: "sm",
          },
        ],
        paddingAll: "lg",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [buildCtaPill(config.cta)],
        paddingAll: "md",
      },
    }
  }

  // No banner yet → styled colored bubble with header + body + footer
  return {
    type: "bubble",
    size: "kilo",
    styles: {
      header: { backgroundColor: bgColor },
      body: { backgroundColor: bgColor },
      footer: { backgroundColor: bgColor },
    },
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: config.title,
          weight: "bold",
          size: "lg",
          color: titleColor,
          wrap: true,
        },
      ],
      paddingTop: "xl",
      paddingStart: "lg",
      paddingEnd: "lg",
      paddingBottom: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: config.description,
          size: "sm",
          color: descColor,
          wrap: true,
        },
      ],
      paddingStart: "lg",
      paddingEnd: "lg",
      paddingTop: "none",
      paddingBottom: "xl",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [buildCtaPill(config.cta)],
      paddingAll: "lg",
      paddingTop: "none",
    },
  }
}

/** 6-bubble onboarding carousel — shown when user taps "ดูคู่มือ" CTA on welcome bubble */
export function buildOnboardingCarousel(): FlexMessagePayload {
  const bubbles = [
    // 1 — เริ่มต้นใช้งานง่ายๆ (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: ONBOARDING_BANNERS.start,
      title: "👩🏻‍💻 เริ่มต้นใช้งานง่ายๆ",
      description:
        "แค่พิมพ์คุยกับน้องซีมะโด่งในช่องแชทได้เลย โดยไม่ต้องกดเมนู! ถามอะไรมาได้ตลอดเลย",
      cta: {
        kind: "message",
        label: "👋 ลองส่งข้อความ",
        text: "น้องซีมะโด่ง",
      },
    }),
    // 2 — ถามอะไรตอบได้! (cream)
    buildOnboardingBubble({
      theme: "cream",
      bannerUrl: ONBOARDING_BANNERS.ask,
      title: "💡 ถามอะไรตอบได้!",
      description:
        "มีคำถามเรื่องหอพัก ระเบียบ หรือข้อมูลต่างๆ ถามน้องซีได้เลยน้า ตอบได้หมดจ้า! 🤓",
      cta: {
        kind: "message",
        label: "💡 ลองถามคำถาม",
        text: "น้องซีมะโด่ง",
      },
    }),
    // 3 — แจ้งซ่อมได้ ง่ายกว่าที่เคย! (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: ONBOARDING_BANNERS.repair,
      title: "🔨 แจ้งซ่อมได้ ง่ายกว่าที่เคย!",
      description:
        "แค่ถ่ายรูปส่งมาเลยก็พอ น้องซีช่วยแจ้งให้ได้เลย! ติดตามสถานะได้ตลอด 👩🏻‍🔧",
      cta: {
        kind: "message",
        label: "🔨 ลองแจ้งซ่อม",
        text: "น้องซีมะโด่ง",
      },
    }),
    // 4 — แจ้งเตือนอัจฉริยะ (cream)
    buildOnboardingBubble({
      theme: "cream",
      bannerUrl: ONBOARDING_BANNERS.notify,
      title: "🔔 แจ้งเตือนอัจฉริยะ",
      description:
        "พัสดุมาถึง ค่าหอใกล้ครบ กิจกรรมใกล้ถึง น้องซีจะแจ้งเตือนให้ไม่พลาดเลยจ้า 🔔",
      cta: {
        kind: "message",
        label: "📦 ลองเช็คพัสดุ",
        text: "น้องซีมะโด่ง",
      },
    }),
    // 5 — LINE MINI APP (cream)
    buildOnboardingBubble({
      theme: "cream",
      bannerUrl: ONBOARDING_BANNERS.miniApp,
      title: "📱 LINE MINI APP",
      description:
        "เพิ่มไปหน้าจอโทรศัพท์ได้โดยไม่ต้องโหลดแอพ! ใช้งานง่ายเหมือนแอพปกติ เข้าถึงฟีเจอร์ได้ทั้งหมดเลย",
      cta: {
        kind: "uri",
        label: "📱 เปิด LINE MINI APP",
        uri: `${WEB_BASE}/login`,
      },
    }),
    // 6 — ยังมีอีกเยอะ! (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: ONBOARDING_BANNERS.more,
      title: "🎉 ยังมีอีกเยอะ!",
      description:
        "น้องซียังมีฟีเจอร์เจ๋งๆ อีกเยอะ! กดดูเพิ่มเติมได้เลยนะ 🎉",
      cta: {
        kind: "message",
        label: "ดูเพิ่มเติม",
        text: "ดูเพิ่มเติม",
      },
    }),
  ]

  return {
    type: "flex",
    altText: "🎉 คู่มือการใช้งานน้องซีมะโด่ง",
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  }
}

// --- How-To Carousel (from "ดูเพิ่มเติม" CTA on card 6) ---
// 5-bubble set 2 carousel: contact, getting started, shortcuts, account, FAQ

const HOWTO_BANNERS = {
  contact: `${BANNER_BASE}/howto-1-contact.jpg` as string | null,
  gettingStarted: `${BANNER_BASE}/howto-2-getting-started.jpg` as string | null,
  shortcuts: `${BANNER_BASE}/howto-3-shortcuts.jpg` as string | null,
  account: `${BANNER_BASE}/howto-4-account.jpg` as string | null,
  faq: `${BANNER_BASE}/howto-5-faq.jpg` as string | null,
}

/** 5-bubble how-to carousel — shown when user taps "ดูเพิ่มเติม" on card 6 */
export function buildHowToCarousel(): FlexMessagePayload {
  const bubbles = [
    // 1 — ติดต่อสอบถาม (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: HOWTO_BANNERS.contact,
      title: "💬 ติดต่อสอบถาม หรือข้อมูลเพิ่มเติม",
      description:
        "มีคำถาม หรือต้องการความช่วยเหลือ? ติดต่อเจ้าหน้าที่หอพักได้เลยจ้า",
      cta: {
        kind: "message",
        label: "💬 ติดต่อเจ้าหน้าที่",
        text: "ติดต่อเจ้าหน้าที่",
      },
    }),
    // 2 — วิธีการใช้งานเบื้องต้น (cream)
    buildOnboardingBubble({
      theme: "cream",
      bannerUrl: HOWTO_BANNERS.gettingStarted,
      title: "📖 วิธีการใช้งาน C-MADONG เบื้องต้น",
      description:
        "เริ่มต้นใช้งานระบบหอพักอัจฉริยะ ดูขั้นตอนง่ายๆ ได้ที่นี่เลย",
      cta: {
        kind: "uri",
        label: "📖 ดูคู่มือการใช้งาน",
        uri: `${WEB_BASE}/guide/getting-started`,
      },
    }),
    // 3 — คีย์ลัด (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: HOWTO_BANNERS.shortcuts,
      title: "⚡️ คีย์ลัด และเมนูเพิ่มเติม",
      description:
        "รวมคำสั่งลัดและเมนูที่ช่วยให้ใช้งานได้เร็วขึ้น!",
      cta: {
        kind: "uri",
        label: "⚡️ ดูคีย์ลัดทั้งหมด",
        uri: `${WEB_BASE}/guide/shortcuts`,
      },
    }),
    // 4 — เกี่ยวกับบัญชี (cream)
    buildOnboardingBubble({
      theme: "cream",
      bannerUrl: HOWTO_BANNERS.account,
      title: "👤 เกี่ยวกับบัญชีผู้ใช้งาน",
      description:
        "ดูข้อมูลบัญชี แก้ไขโปรไฟล์ และจัดการการตั้งค่าต่างๆ",
      cta: {
        kind: "uri",
        label: "👤 ดูข้อมูลบัญชี",
        uri: `${WEB_BASE}/guide/account`,
      },
    }),
    // 5 — คำถามที่พบบ่อย (pink)
    buildOnboardingBubble({
      theme: "pink",
      bannerUrl: HOWTO_BANNERS.faq,
      title: "❓ คำถามที่พบบ่อย",
      description:
        "รวมคำตอบสำหรับคำถามยอดฮิตที่นิสิตถามบ่อย ดูได้เลยจ้า!",
      cta: {
        kind: "uri",
        label: "❓ ดูคำถามที่พบบ่อย",
        uri: `${WEB_BASE}/guide/faq`,
      },
    }),
  ]

  return {
    type: "flex",
    altText: "📚 ข้อมูลเพิ่มเติมเกี่ยวกับน้องซีมะโด่ง",
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
