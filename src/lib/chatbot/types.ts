/** LINE Webhook event types (subset we handle) */

export interface LineWebhookBody {
  destination: string
  events: LineEvent[]
}

export type LineEvent =
  | LineMessageEvent
  | LinePostbackEvent
  | LineFollowEvent
  | LineUnfollowEvent

interface LineEventBase {
  replyToken?: string
  source: LineSource
  timestamp: number
  mode: "active" | "standby"
}

export interface LineMessageEvent extends LineEventBase {
  type: "message"
  replyToken: string
  message: LineTextMessage | LineImageMessage | LineUnsupportedMessage
}

export interface LinePostbackEvent extends LineEventBase {
  type: "postback"
  replyToken: string
  postback: { data: string; params?: Record<string, string> }
}

export interface LineFollowEvent extends LineEventBase {
  type: "follow"
  replyToken: string
}

export interface LineUnfollowEvent extends LineEventBase {
  type: "unfollow"
}

export interface LineTextMessage {
  type: "text"
  id: string
  text: string
}

export interface LineImageMessage {
  type: "image"
  id: string
  contentProvider: { type: "line" | "external"; originalContentUrl?: string }
}

export interface LineUnsupportedMessage {
  type: "video" | "audio" | "file" | "location" | "sticker"
  id: string
}

export interface LineSource {
  type: "user" | "group" | "room"
  userId?: string
  groupId?: string
  roomId?: string
}

/** Chatbot intent types */
export type ChatIntent =
  | "repair"
  | "knowledge"
  | "score"
  | "events"
  | "chitchat"

/** Intent classification result from Gemini */
export interface IntentResult {
  intent: ChatIntent
  confidence: number
  extractedInfo?: Record<string, string>
}

/** Session states for multi-step flows */
export type SessionState =
  | "idle"
  | "repair_confirming"
  | "repair_editing"
  | "repair_collecting_photos"

export interface ChatSession {
  id: string
  line_uid: string
  state: SessionState
  state_data: Record<string, unknown>
  updated_at: string
}

/** Repair detection result */
export interface RepairDetection {
  category: string
  title: string
  description: string
  urgency: "low" | "medium" | "high"
}

/** Handler response - what to send back to LINE */
export interface HandlerResponse {
  type: "text" | "flex"
  text?: string
  flex?: import("../line/flex-builders/bill-reminder").FlexMessagePayload
}
