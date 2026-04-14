import { createAdminClient } from "@/lib/supabase/admin"
import { SESSION_TIMEOUT_MINUTES } from "./constants"
import type { ChatSession, SessionState } from "./types"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * Get or create a chatbot session for a LINE user.
 * Auto-resets if session is older than SESSION_TIMEOUT_MINUTES.
 */
export async function getOrCreateSession(lineUid: string): Promise<ChatSession> {
  if (IS_DEMO) return mockSession(lineUid)

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("chatbot_sessions")
    .select("*")
    .eq("line_uid", lineUid)
    .single()

  if (existing) {
    // Auto-reset stale sessions
    const updatedAt = new Date(existing.updated_at).getTime()
    const now = Date.now()
    if (now - updatedAt > SESSION_TIMEOUT_MINUTES * 60 * 1000) {
      return resetSession(lineUid)
    }
    return existing as ChatSession
  }

  // Create new session
  const { data, error } = await supabase
    .from("chatbot_sessions")
    .insert({ line_uid: lineUid, state: "idle", state_data: {} })
    .select()
    .single()

  if (error) throw error
  return data as ChatSession
}

/** Update session state and data */
export async function updateSessionState(
  lineUid: string,
  state: SessionState,
  stateData: Record<string, unknown> = {}
): Promise<void> {
  if (IS_DEMO) return

  const supabase = createAdminClient()
  await supabase
    .from("chatbot_sessions")
    .update({ state, state_data: stateData as any, updated_at: new Date().toISOString() })
    .eq("line_uid", lineUid)
}

/** Reset session to idle */
export async function resetSession(lineUid: string): Promise<ChatSession> {
  if (IS_DEMO) return mockSession(lineUid)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chatbot_sessions")
    .update({ state: "idle", state_data: {}, updated_at: new Date().toISOString() })
    .eq("line_uid", lineUid)
    .select()
    .single()

  if (error) throw error
  return data as ChatSession
}

/** Clear session entirely (on unfollow) */
export async function clearSession(lineUid: string): Promise<void> {
  if (IS_DEMO) return

  const supabase = createAdminClient()
  await supabase.from("chatbot_sessions").delete().eq("line_uid", lineUid)
}

function mockSession(lineUid: string): ChatSession {
  return {
    id: "mock-session",
    line_uid: lineUid,
    state: "idle",
    state_data: {},
    context_summary: null,
    message_count: 0,
    updated_at: new Date().toISOString(),
  }
}
