import { replyTextMessage, replyFlexMessage, replyMessage, replyMessages } from "@/lib/line/client"
import { classifyIntent } from "./intent-router"
import { getOrCreateSession, resetSession } from "./session-manager"
import { saveMessage, countRecentUserMessages, getRecentMessages } from "./chat-history"
import { getConversationContext, incrementAndMaybeSummarize } from "./context-manager"
import { getSuggestionsForIntent } from "./suggestions"
import { RATE_LIMIT_PER_MINUTE } from "./constants"
import { isMenuTrigger, MAIN_MENU_QUICK_REPLY } from "./quick-reply"
import {
  handleChitchat,
  handleRepair,
  handleKnowledge,
  handleScore,
  handleEvents,
  handleParcel,
  handlePostback,
} from "./handlers"
import type {
  LineWebhookBody,
  LineEvent,
  LineMessageEvent,
  LinePostbackEvent,
  HandlerResponse,
  ChatIntent,
} from "./types"

/** Short trigger phrases that mean "I want to report a repair" but have no details yet */
const REPAIR_TRIGGER_PHRASES = [
  "แจ้งซ่อม",
  "แจ้งซ่อมห้อง",
  "แจ้งซ่อมหน่อย",
  "อยากแจ้งซ่อม",
  "ขอแจ้งซ่อม",
  "จะแจ้งซ่อม",
  "ซ่อม",
  "repair",
]

/** Keywords that mean the user wants to talk to a human admin */
const ESCALATION_KEYWORDS = [
  "ขอคุยกับคน",
  "คุยกับคน",
  "ขอคุยกับเจ้าหน้าที่",
  "ขอคุยกับทีมงาน",
  "ช่วยเหลือ",
  "คนจริง",
  "ขอพูดกับคน",
  "talk to human",
  "human",
  "agent",
]

function isEscalationRequest(message: string): boolean {
  const lower = message.trim().toLowerCase()
  return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

/** Keywords that mean "check repair status" — should NOT create a new ticket */
const REPAIR_STATUS_KEYWORDS = [
  "สถานะแจ้งซ่อม",
  "สถานะการซ่อม",
  "สถานะงานซ่อม",
  "ติดตามสถานะ",
  "ติดตามการซ่อม",
  "ติดตามสถานะซ่อม",
  "เช็คสถานะ",
  "เช็คสถานะซ่อม",
  "ดูสถานะ",
  "ดูสถานะซ่อม",
  "ประวัติแจ้งซ่อม",
  "ประวัติการซ่อม",
  "ดูประวัติซ่อม",
  "งานซ่อม",
  "track",
  "status",
]

function isRepairTriggerOnly(message: string): boolean {
  const trimmed = message.trim().toLowerCase()
  return REPAIR_TRIGGER_PHRASES.some((phrase) => trimmed === phrase.toLowerCase())
}

function isRepairStatusCheck(message: string): boolean {
  const lower = message.trim().toLowerCase()
  return REPAIR_STATUS_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL
const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/** Process all events in a webhook body */
export async function handleWebhookEvents(body: LineWebhookBody): Promise<void> {
  const promises = body.events.map((event) => processEvent(event))
  await Promise.allSettled(promises)
}

async function processEvent(event: LineEvent): Promise<void> {
  try {
    switch (event.type) {
      case "message":
        await handleMessageEvent(event)
        break
      case "postback":
        await handlePostbackEvent(event)
        break
      case "follow": {
        const followUid = event.source.userId
        console.log("[Webhook] Follow event from:", followUid)
        const isRegistered = followUid ? await checkUserRegistered(followUid) : false
        console.log("[Webhook] User registered:", isRegistered)

        if (isRegistered && followUid) {
          // Returning user → link Menu B + welcome back flex
          const { linkRegisteredMenu } = await import("@/lib/line/rich-menu")
          await linkRegisteredMenu(followUid)

          const profile = await getProfileByLineUid(followUid)
          const displayName = profile?.display_name || profile?.full_name_th || "เพื่อน"
          console.log("[Webhook] Welcome back:", displayName)
          const { buildWelcomeBackFlex } = await import("./flex-builders/greeting-carousel")
          // Send flex + separate text with quickReply (LINE attaches quickReply to LAST message;
          // Flex + quickReply in same object is unreliable on some LINE clients)
          await replyMessages(event.replyToken, [
            buildWelcomeBackFlex(displayName) as unknown as Record<string, unknown>,
            {
              type: "text",
              text: "เลือกเมนูด่วนด้านล่างได้เลยจ้า 👇",
              quickReply: MAIN_MENU_QUICK_REPLY,
            },
          ])
        } else {
          // New user → stays on Menu A (default) + greeting carousel
          console.log("[Webhook] New user → greeting carousel")
          const { buildGreetingCarousel } = await import("./flex-builders/greeting-carousel")
          await replyMessages(event.replyToken, [
            buildGreetingCarousel("เพื่อน") as unknown as Record<string, unknown>,
            {
              type: "text",
              text: "ลองพิมพ์ถามน้องซี หรือเลือกเมนูด่วนด้านล่างเลยจ้า 👇",
              quickReply: MAIN_MENU_QUICK_REPLY,
            },
          ])
        }
        break
      }
      case "unfollow": {
        const uid = event.source.userId
        if (uid) {
          const { clearSession } = await import("./session-manager")
          await clearSession(uid)
        }
        break
      }
    }
  } catch (err) {
    console.error("[Webhook] Error processing event:", err)
  }
}

async function handleMessageEvent(event: LineMessageEvent): Promise<void> {
  const lineUid = event.source.userId
  if (!lineUid) return

  // Handle image messages
  if (event.message.type === "image") {
    await handleImageMessage(event, lineUid)
    return
  }

  // Handle unsupported message types
  if (event.message.type !== "text") {
    await replyTextMessage(
      event.replyToken,
      "ซีมะโด่งอ่านได้แค่ข้อความกับรูปภาพตอนนี้น้า 📝 พิมพ์หรือส่งรูปมาเลยจ้า"
    )
    return
  }

  const message = event.message.text.trim()
  if (!message) return

  // Quick Reply menu trigger — "น้องซีมะโด่ง", "เมนู", etc.
  if (isMenuTrigger(message)) {
    await sendResponse(event.replyToken, {
      type: "text",
      text: "สวัสดีจ้า! 🏠 น้องซีมะโด่งพร้อมช่วยเสมอนะ\n\nเลือกเมนูด้านล่าง หรือพิมพ์อะไรมาก็ได้เลยจ้า ✨",
      quickReply: MAIN_MENU_QUICK_REPLY,
    })
    return
  }

  // Rate limiting
  const recentCount = await countRecentUserMessages(lineUid)
  if (recentCount >= RATE_LIMIT_PER_MINUTE) {
    await replyTextMessage(
      event.replyToken,
      "เดี๋ยวๆ ส่งข้อความเร็วไปหน่อยน้า 😅 รอสักครู่แล้วลองใหม่นะ"
    )
    return
  }

  // Check if user is registered (has profile with line_uid)
  const isRegistered = IS_DEMO || (await checkUserRegistered(lineUid))
  if (!isRegistered) {
    const registerUrl = LIFF_URL ? `${LIFF_URL}/register` : "แอปหอพัก"
    await replyTextMessage(
      event.replyToken,
      `สวัสดีจ้า! 🏠 น้องยังไม่ได้ลงทะเบียนในระบบน้า\n\nลงทะเบียนได้ที่: ${registerUrl}\n\nหลังลงทะเบียนแล้วจะใช้งานซีมะโด่งได้เต็มที่เลยนะ ✨`
    )
    return
  }

  // Get session
  const session = await getOrCreateSession(lineUid)

  // If user asks about repair status, always route to history — even mid-flow
  if (isRepairStatusCheck(message)) {
    try {
      await handlePostback(event.replyToken, "action=repair_history", lineUid)
      await saveMessages(lineUid, session.id, message, {
        type: "text",
        text: "ดูประวัติแจ้งซ่อม",
      })
      return
    } catch {
      // Fallback below
    }
  }

  // If user requests escalation (talk to human), create escalation and redirect to web
  if (isEscalationRequest(message)) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin")
      const adminDb = createAdminClient()

      // Get student profile
      const { data: profile } = await adminDb
        .from("profiles")
        .select("id, display_name, full_name_th")
        .eq("line_uid", lineUid)
        .single()

      if (profile) {
        const recentHistory = await getRecentMessages(lineUid, 5)
        const lineSessionId = `line_${lineUid}`

        // Create escalation (new table — not in generated types)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (adminDb as any).from("chat_escalations").insert({
          session_id: lineSessionId,
          student_id: profile.id,
          status: "waiting",
          reason: "user_request",
          ai_context: {
            last_messages: recentHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            trigger: "line_keyword",
          },
        })

        // Notify admins
        const { notifyChatEscalation } = await import("@/lib/notifications/triggers")
        await notifyChatEscalation({
          escalationId: lineSessionId,
          studentName: profile.display_name ?? profile.full_name_th ?? "นิสิต",
          studentId: profile.id,
          issueSummary: message.slice(0, 100),
          sessionId: lineSessionId,
        }).catch(() => {})
      }
    } catch (err) {
      console.error("[Webhook] Escalation error:", err)
    }

    const webUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"
    await replyTextMessage(
      event.replyToken,
      `พี่ทีมงานจะเข้ามาช่วยเร็วๆ นี้นะ 🙂\n\nสามารถคุยต่อได้ที่แอปเลยจ้า:\n${webUrl}/th/dashboard`
    )
    await saveMessages(lineUid, session.id, message, {
      type: "text",
      text: "ส่งคำขอคุยกับทีมงานแล้ว",
    })
    return
  }

  // If in active flow (repair confirming/editing/collecting photos), route to repair handler
  if (
    session.state === "repair_confirming" ||
    session.state === "repair_editing" ||
    session.state === "repair_collecting_photos"
  ) {
    // User sent a new text while in repair flow — treat as new repair description
    const response = await handleRepair(message, lineUid)
    await sendResponse(event.replyToken, response)
    await saveMessages(lineUid, session.id, message, response)
    return
  }

  // Classify intent
  const { intent } = await classifyIntent(message)

  // Get conversation context for enhanced responses
  const context = await getConversationContext(lineUid, session.id)

  // Route to handler
  let response: HandlerResponse

  switch (intent) {
    case "repair":
      // Check if user is asking about repair STATUS (not creating a new one)
      if (isRepairStatusCheck(message)) {
        response = {
          type: "text",
          text: "📋 ดูสถานะแจ้งซ่อมได้เลยจ้า!\n\nกดปุ่ม \"🔍 ติดตามสถานะ\" ในการ์ดแจ้งซ่อม หรือพิมพ์ \"ประวัติแจ้งซ่อม\" เพื่อดูรายการทั้งหมดนะ",
        }
        // Also trigger repair history as a helpful follow-up
        try {
          const { handlePostback } = await import("./handlers")
          await handlePostback(event.replyToken, "action=repair_history", lineUid)
          await saveMessages(lineUid, session.id, message, response)
          return
        } catch {
          // Fallback to text response
        }
        break
      }
      // If message is just a short trigger like "แจ้งซ่อม" without details, guide the user
      if (isRepairTriggerOnly(message)) {
        response = {
          type: "text",
          text: "🔧 พร้อมแจ้งซ่อมแล้วใช่มั้ย!\nพิมพ์รายละเอียดปัญหามาได้เลยจ้า เช่น \"ก๊อกน้ำรั่ว\" หรือ \"แอร์ไม่เย็น\"\n\n💡 บอกความเร่งด่วนได้ด้วยนะ เช่น \"ด่วนมาก\" หรือ \"ไม่เร่ง\"\n📸 ถ้ามีรูปก็ส่งมาเลย ช่วยให้ช่างเห็นปัญหาชัดขึ้นจ้า",
        }
        break
      }
      response = await handleRepair(message, lineUid)
      break
    case "knowledge":
      response = await handleKnowledge(message)
      break
    case "score":
      response = await handleScore(lineUid)
      break
    case "events":
      response = await handleEvents()
      break
    case "parcel":
      response = await handleParcel(lineUid)
      break
    case "chitchat":
    default: {
      const history = await getRecentMessages(lineUid)
      // Fetch profile context for personalized chitchat
      let profileContext: { name?: string; building?: string; room?: string; summary?: string | null } | undefined
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin")
        const adminDb = createAdminClient()
        const { data: profile } = await adminDb
          .from("profiles")
          .select("full_name_th, display_name, building_id, room_id")
          .eq("line_uid", lineUid)
          .single()
        if (profile) {
          profileContext = {
            name: profile.display_name || profile.full_name_th || undefined,
            building: profile.building_id || undefined,
            room: profile.room_id || undefined,
            summary: context.summary,
          }
        }
      } catch {
        // Non-critical
      }
      response = await handleChitchat(message, history, { profileContext })
      break
    }
  }

  // Append suggestion Quick Replies if handler didn't already set them
  if (!response.quickReply && intent !== "chitchat") {
    const suggestions = getSuggestionsForIntent(intent as ChatIntent)
    if (suggestions) {
      response = { ...response, quickReply: { items: suggestions } }
    }
  }

  await sendResponse(event.replyToken, response)
  await saveMessages(lineUid, session.id, message, response, intent)

  // Increment message count and maybe generate summary (fire-and-forget)
  incrementAndMaybeSummarize(lineUid, session.id).catch(() => {})
}

async function handlePostbackEvent(event: LinePostbackEvent): Promise<void> {
  const lineUid = event.source.userId
  if (!lineUid) return

  await handlePostback(event.replyToken, event.postback.data, lineUid)
}

async function handleImageMessage(
  event: LineMessageEvent,
  lineUid: string
): Promise<void> {
  const messageId = event.message.id

  // Check registration
  const isRegistered = IS_DEMO || (await checkUserRegistered(lineUid))
  if (!isRegistered) {
    const registerUrl = LIFF_URL ? `${LIFF_URL}/register` : "แอปหอพัก"
    await replyTextMessage(
      event.replyToken,
      `สวัสดีจ้า! 🏠 น้องยังไม่ได้ลงทะเบียนในระบบน้า\n\nลงทะเบียนได้ที่: ${registerUrl}`
    )
    return
  }

  const session = await getOrCreateSession(lineUid)

  // If in repair flow or idle, download and store the image
  try {
    const { downloadLineImage } = await import("@/lib/line/image-download")
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const { uploadPhotoBuffer } = await import("@/lib/supabase/storage")

    const { buffer, contentType } = await downloadLineImage(messageId)
    const supabase = createAdminClient()

    // Look up profile for user ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()

    const userId = profile?.id ?? lineUid
    const { url } = await uploadPhotoBuffer(supabase, buffer, contentType, userId)

    // Get existing photos from session
    const existingPhotos = (session.state_data?.photos as string[]) ?? []
    const photos = [...existingPhotos, url]

    if (photos.length >= 5) {
      // Max photos reached
      const { updateSessionState } = await import("./session-manager")
      await updateSessionState(lineUid, session.state === "idle" ? "repair_collecting_photos" : session.state, {
        ...session.state_data,
        photos,
      })
      await replyTextMessage(
        event.replyToken,
        `ได้รูปแล้วจ้า 📸 (${photos.length}/5 รูป) ครบแล้วน้า!\n\nพิมพ์อธิบายปัญหามาเลยนะ เช่น "แอร์ไม่เย็น" หรือ "น้ำรั่ว"`
      )
    } else {
      const { updateSessionState } = await import("./session-manager")
      await updateSessionState(lineUid, session.state === "idle" ? "repair_collecting_photos" : session.state, {
        ...session.state_data,
        photos,
      })
      await replyTextMessage(
        event.replyToken,
        `ได้รูปแล้วจ้า 📸 (${photos.length}/5 รูป)\n\nส่งเพิ่มได้อีก หรือพิมพ์อธิบายปัญหามาเลยนะ`
      )
    }

    // Save chat message
    await saveMessage(lineUid, session.id, {
      role: "user",
      content: `[ส่งรูปภาพ]`,
      metadata: { imageUrl: url },
    })
  } catch (err) {
    console.error("[Webhook] Image handling error:", err)
    await replyTextMessage(
      event.replyToken,
      "อุ๊ปส์! รับรูปไม่ได้น้า 😅 ลองส่งใหม่อีกทีนะ"
    )
  }
}

async function sendResponse(
  replyToken: string,
  response: HandlerResponse
): Promise<void> {
  try {
    if (response.quickReply) {
      // Use raw replyMessage to attach quickReply to any message type
      if (response.type === "flex" && response.flex) {
        await replyMessage(replyToken, {
          ...response.flex,
          quickReply: response.quickReply,
        } as Record<string, unknown>)
      } else if (response.text) {
        await replyMessage(replyToken, {
          type: "text",
          text: response.text,
          quickReply: response.quickReply,
        } as Record<string, unknown>)
      }
    } else if (response.type === "flex" && response.flex) {
      await replyFlexMessage(replyToken, response.flex)
    } else if (response.text) {
      await replyTextMessage(replyToken, response.text)
    }
  } catch (err) {
    // Don't throw — LINE reply failures (e.g. expired token) shouldn't block message saving
    console.error("[Webhook] Reply failed:", err)
  }
}

async function saveMessages(
  lineUid: string,
  sessionId: string,
  userMessage: string,
  response: HandlerResponse,
  intent?: string
): Promise<void> {
  try {
    await saveMessage(lineUid, sessionId, {
      role: "user",
      content: userMessage,
      intent: intent as import("./types").ChatIntent | undefined,
    })

    const assistantContent =
      response.text ?? response.flex?.altText ?? ""
    if (assistantContent) {
      await saveMessage(lineUid, sessionId, {
        role: "assistant",
        content: assistantContent,
      })
    }
  } catch {
    // Non-critical — don't fail the response
  }
}

async function checkUserRegistered(lineUid: string): Promise<boolean> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()
    return !!data
  } catch {
    // If Supabase not available, allow through
    return true
  }
}

async function getProfileByLineUid(
  lineUid: string
): Promise<{ display_name: string | null; full_name_th: string | null } | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("profiles")
      .select("display_name, full_name_th")
      .eq("line_uid", lineUid)
      .single()
    return data
  } catch {
    return null
  }
}
