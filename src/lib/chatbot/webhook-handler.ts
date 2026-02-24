import { replyTextMessage, replyFlexMessage } from "@/lib/line/client"
import { classifyIntent } from "./intent-router"
import { getOrCreateSession, resetSession } from "./session-manager"
import { saveMessage, countRecentUserMessages, getRecentMessages } from "./chat-history"
import { RATE_LIMIT_PER_MINUTE } from "./constants"
import {
  handleChitchat,
  handleRepair,
  handleKnowledge,
  handleScore,
  handleEvents,
  handlePostback,
} from "./handlers"
import type {
  LineWebhookBody,
  LineEvent,
  LineMessageEvent,
  LinePostbackEvent,
  HandlerResponse,
} from "./types"

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
      case "follow":
        await replyTextMessage(
          event.replyToken,
          "สวัสดีจ้า! 🏠 น้องซีมะโด่งยินดีต้อนรับเข้าหอพักนะ\n\nพิมพ์อะไรมาก็ได้ เช่น:\n• แจ้งซ่อม: \"แอร์ไม่เย็น\"\n• ถามข้อมูล: \"กฎหอพัก\"\n• เช็คคะแนน: \"คะแนนหอ\"\n• ดูกิจกรรม: \"กิจกรรมหอ\"\n• หรือคุยเล่นก็ได้น้า 💬"
        )
        break
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
  if (event.message.type !== "text") {
    await replyTextMessage(
      event.replyToken,
      "ซีมะโด่งอ่านได้แค่ข้อความตอนนี้น้า 📝 พิมพ์มาเลยจ้า"
    )
    return
  }

  const lineUid = event.source.userId
  if (!lineUid) return

  const message = event.message.text.trim()
  if (!message) return

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

  // If in active flow (repair confirming/editing), route to repair handler
  if (session.state === "repair_confirming" || session.state === "repair_editing") {
    // User sent a new text while in repair flow — treat as new repair description
    const response = await handleRepair(message, lineUid)
    await sendResponse(event.replyToken, response)
    await saveMessages(lineUid, session.id, message, response)
    return
  }

  // Classify intent
  const { intent } = await classifyIntent(message)

  // Route to handler
  let response: HandlerResponse

  switch (intent) {
    case "repair":
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
    case "chitchat":
    default: {
      const history = await getRecentMessages(lineUid)
      response = await handleChitchat(message, history)
      break
    }
  }

  await sendResponse(event.replyToken, response)
  await saveMessages(lineUid, session.id, message, response, intent)
}

async function handlePostbackEvent(event: LinePostbackEvent): Promise<void> {
  const lineUid = event.source.userId
  if (!lineUid) return

  await handlePostback(event.replyToken, event.postback.data, lineUid)
}

async function sendResponse(
  replyToken: string,
  response: HandlerResponse
): Promise<void> {
  try {
    if (response.type === "flex" && response.flex) {
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
