import { messagingApi } from "@line/bot-sdk"
import type { FlexMessagePayload } from "./flex-builders/bill-reminder"

let client: messagingApi.MessagingApiClient | null = null

function getClient(): messagingApi.MessagingApiClient {
  if (client) return client

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    throw new Error(
      "LINE_CHANNEL_ACCESS_TOKEN is not set. Add it to .env.local to send LINE messages."
    )
  }

  client = new messagingApi.MessagingApiClient({ channelAccessToken: token })
  return client
}

export async function pushFlexMessage(
  lineUid: string,
  flexMessage: FlexMessagePayload
): Promise<void> {
  const api = getClient()
  await api.pushMessage({
    to: lineUid,
    // The SDK messaging API types are stricter than the actual LINE API accepts.
    // Flex JSON is a well-known pass-through structure, safe to cast.
    messages: [flexMessage as unknown as messagingApi.Message],
  })
}

export async function broadcastFlexMessage(
  flexMessage: FlexMessagePayload
): Promise<void> {
  const api = getClient()
  await api.broadcast({
    messages: [flexMessage as unknown as messagingApi.Message],
  })
}

/** Reply to a LINE event using the reply token (text message) */
export async function replyTextMessage(
  replyToken: string,
  text: string
): Promise<void> {
  const api = getClient()
  await api.replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  })
}

/** Reply to a LINE event with a Flex Message */
export async function replyFlexMessage(
  replyToken: string,
  flexMessage: FlexMessagePayload
): Promise<void> {
  const api = getClient()
  await api.replyMessage({
    replyToken,
    messages: [flexMessage as unknown as messagingApi.Message],
  })
}

/** Reply with a raw message object (for attaching quickReply etc.) */
export async function replyMessage(
  replyToken: string,
  message: Record<string, unknown>
): Promise<void> {
  const api = getClient()
  await api.replyMessage({
    replyToken,
    messages: [message as unknown as messagingApi.Message],
  })
}

/**
 * Reply with multiple raw messages in a single API call (up to 5).
 * Useful for Flex + Quick Reply combos — LINE attaches quickReply to the LAST message,
 * so send the Flex first and a tiny text with quickReply last for reliable display.
 */
export async function replyMessages(
  replyToken: string,
  messages: Record<string, unknown>[]
): Promise<void> {
  const api = getClient()
  await api.replyMessage({
    replyToken,
    messages: messages as unknown as messagingApi.Message[],
  })
}

/** Push a text message to a user (no reply token needed) */
export async function pushTextMessage(
  lineUid: string,
  text: string
): Promise<void> {
  const api = getClient()
  await api.pushMessage({
    to: lineUid,
    messages: [{ type: "text", text }],
  })
}

export async function broadcastTextMessage(text: string): Promise<void> {
  const api = getClient()
  await api.broadcast({
    messages: [{ type: "text", text }],
  })
}

export async function broadcastImageMessage(
  originalContentUrl: string,
  previewImageUrl: string
): Promise<void> {
  const api = getClient()
  await api.broadcast({
    messages: [
      {
        type: "image",
        originalContentUrl,
        previewImageUrl,
      } as unknown as import("@line/bot-sdk").messagingApi.Message,
    ],
  })
}

export async function broadcastImageCarousel(
  columns: Array<{ imageUrl: string; ctaUrl?: string; label?: string }>
): Promise<void> {
  const api = getClient()
  await api.broadcast({
    messages: [
      {
        type: "template",
        altText: "รูปภาพประกาศ",
        template: {
          type: "image_carousel",
          columns: columns.slice(0, 10).map((col) => ({
            imageUrl: col.imageUrl,
            action: col.ctaUrl
              ? { type: "uri", label: col.label ?? "ดูรายละเอียด", uri: col.ctaUrl }
              : { type: "message", label: "ดูประกาศ", text: "ดูประกาศ" },
          })),
        },
      } as unknown as import("@line/bot-sdk").messagingApi.Message,
    ],
  })
}

export async function pushImageCarousel(
  lineUid: string,
  columns: Array<{ imageUrl: string; ctaUrl?: string; label?: string }>
): Promise<void> {
  const api = getClient()
  await api.pushMessage({
    to: lineUid,
    messages: [
      {
        type: "template",
        altText: "รูปภาพประกาศ",
        template: {
          type: "image_carousel",
          columns: columns.slice(0, 10).map((col) => ({
            imageUrl: col.imageUrl,
            action: col.ctaUrl
              ? { type: "uri", label: col.label ?? "ดูรายละเอียด", uri: col.ctaUrl }
              : { type: "message", label: "ดูประกาศ", text: "ดูประกาศ" },
          })),
        },
      } as unknown as import("@line/bot-sdk").messagingApi.Message,
    ],
  })
}

/**
 * Mark all messages up to and including the one with this token as read.
 * Token comes from event.message.markAsReadToken in the webhook payload.
 */
export async function markAsRead(markAsReadToken: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return
  await fetch("https://api.line.me/v2/bot/chat/markAsRead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ markAsReadToken }),
  })
}

/**
 * Show typing/loading dots in LINE chat while bot processes.
 * Only works in 1-on-1 chat (userId). Silently ignored for groups.
 * loadingSeconds: 5–60 in multiples of 5 (default 20).
 */
export async function showLoadingAnimation(
  userId: string,
  loadingSeconds = 20
): Promise<void> {
  const api = getClient()
  const seconds = Math.min(60, Math.max(5, Math.round(loadingSeconds / 5) * 5))
  await api.showLoadingAnimation({ chatId: userId, loadingSeconds: seconds })
}

export async function pushImageMessage(
  lineUid: string,
  originalContentUrl: string,
  previewImageUrl: string
): Promise<void> {
  const api = getClient()
  await api.pushMessage({
    to: lineUid,
    messages: [
      {
        type: "image",
        originalContentUrl,
        previewImageUrl,
      } as unknown as import("@line/bot-sdk").messagingApi.Message,
    ],
  })
}
