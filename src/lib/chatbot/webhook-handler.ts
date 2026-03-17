import { replyTextMessage, replyFlexMessage, replyMessage } from "@/lib/line/client"
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
        await sendResponse(event.replyToken, {
          type: "text",
          text: "สวัสดีจ้า! 🏠 น้องซีมะโด่งยินดีต้อนรับเข้าหอพักนะ\n\nเลือกเมนูด้านล่าง หรือพิมพ์อะไรมาก็ได้เลยจ้า ✨",
          quickReply: MAIN_MENU_QUICK_REPLY,
        })
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
