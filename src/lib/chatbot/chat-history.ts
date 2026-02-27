import { createAdminClient } from "@/lib/supabase/admin"
import type { ChatIntent } from "./types"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  intent?: ChatIntent
  metadata?: Record<string, unknown>
}

/** Save a message to chat history */
export async function saveMessage(
  lineUid: string,
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  if (IS_DEMO) return

  const supabase = createAdminClient()

  // Look up profile by line_uid
  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("line_uid", lineUid)
    .single()

  await supabase.from("ai_chat_messages").insert({
    student_id: profile?.student_id ?? null,
    session_id: sessionId,
    role: message.role,
    content: message.content,
    intent: message.intent ?? null,
    line_uid: lineUid,
    metadata: message.metadata ?? {},
  })
}

/** Get recent messages for context (last N messages) */
export async function getRecentMessages(
  lineUid: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  if (IS_DEMO) return []

  const supabase = createAdminClient()

  const { data } = await supabase
    .from("ai_chat_messages")
    .select("role, content, intent")
    .eq("line_uid", lineUid)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!data) return []
  return data.reverse() as ChatMessage[]
}

/** Check rate limit: count messages in the last minute */
export async function countRecentUserMessages(
  lineUid: string,
  windowMinutes: number = 1
): Promise<number> {
  if (IS_DEMO) return 0

  const supabase = createAdminClient()
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

  const { count } = await supabase
    .from("ai_chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("line_uid", lineUid)
    .eq("role", "user")
    .gte("created_at", since)

  return count ?? 0
}
