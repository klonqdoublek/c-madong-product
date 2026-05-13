import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationType } from "@/lib/supabase/types"
import { createHash } from "crypto"

const QUIET_START_HOUR = 22 // 22:00 Asia/Bangkok
const QUIET_END_HOUR = 7   // 07:00 Asia/Bangkok
const MAX_PUSHES_PER_DAY = 3
const DEDUP_WINDOW_DAYS = 7
const TZ = "Asia/Bangkok"

function getCurrentBangkokHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: TZ })
      .format(new Date()),
    10
  )
}

function isQuietHours(): boolean {
  const hour = getCurrentBangkokHour()
  return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR
}

/** sha1-based hash for payload dedup keys */
export function hashPayload(key: string): string {
  return createHash("sha1").update(key).digest("hex")
}

export interface PushGateResult {
  ok: boolean
  reason?: "no_line_uid" | "push_disabled" | "quiet_hours" | "rate_limit" | "duplicate"
}

/**
 * Guard for system-initiated proactive LINE pushes.
 * Checks: line_uid, push_enabled, quiet hours, 3/day rate limit, dedup.
 */
export async function canPushNow(opts: {
  userId: string
  lineUid: string | null | undefined
  type: NotificationType
  payloadHash: string
  bypassQuietHours?: boolean
}): Promise<PushGateResult> {
  if (!opts.lineUid) return { ok: false, reason: "no_line_uid" }

  const adminDb = createAdminClient()

  // Check push_enabled on profile
  const { data: profile } = await adminDb
    .from("profiles")
    .select("push_enabled")
    .eq("id", opts.userId)
    .single()

  if (!profile?.push_enabled) return { ok: false, reason: "push_disabled" }

  // Check quiet hours (unless critical bypass)
  if (!opts.bypassQuietHours && isQuietHours()) {
    return { ok: false, reason: "quiet_hours" }
  }

  // 24h rate limit: max 3 proactive pushes per user per day
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await adminDb
    .from("notification_dispatch_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", opts.userId)
    .gte("sent_at", since24h)

  if ((count ?? 0) >= MAX_PUSHES_PER_DAY) {
    return { ok: false, reason: "rate_limit" }
  }

  // Dedup: same payload_hash within 7 days → skip
  const since7d = new Date(Date.now() - DEDUP_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { count: dupCount } = await adminDb
    .from("notification_dispatch_log")
    .select("id", { count: "exact", head: true })
    .eq("payload_hash", opts.payloadHash)
    .eq("user_id", opts.userId)
    .gte("sent_at", since7d)

  if ((dupCount ?? 0) > 0) {
    return { ok: false, reason: "duplicate" }
  }

  return { ok: true }
}

/** Record a push in the dispatch log (call after successful push) */
export async function recordDispatch(opts: {
  userId: string
  type: NotificationType
  payloadHash: string
}): Promise<void> {
  const adminDb = createAdminClient()
  await adminDb.from("notification_dispatch_log").insert({
    user_id: opts.userId,
    notification_type: opts.type,
    payload_hash: opts.payloadHash,
  })
}
