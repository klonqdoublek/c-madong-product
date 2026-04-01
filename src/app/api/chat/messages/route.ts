/**
 * Student polling endpoint for new messages during escalation
 * GET /api/chat/messages?after={timestamp} — Poll for new messages + escalation status
 *
 * Note: chat_escalations + sender_type columns are added by migration
 * 20260331_admin_features.sql but not yet in generated Supabase types.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after")
    const sessionId = `web_${user.id}`

    const adminDb = createAdminClient()

    // Check escalation status (new table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, status, admin_id, claimed_at, closed_at")
      .eq("session_id", sessionId)
      .in("status", ["waiting", "active", "closed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get admin name if claimed
    let adminName: string | null = null
    if (escalation?.admin_id) {
      const { data: adminProfile } = await adminDb
        .from("profiles")
        .select("display_name, full_name_th")
        .eq("id", escalation.admin_id)
        .single()
      adminName =
        adminProfile?.display_name ?? adminProfile?.full_name_th ?? "ทีมงาน"
    }

    // Fetch new messages since `after` timestamp (sender_type is new column)
    let messages: { role: string; content: string; sender_type: string; created_at: string }[] = []
    if (after) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (adminDb as any)
        .from("ai_chat_messages")
        .select("role, content, sender_type, created_at")
        .eq("line_uid", user.id)
        .gt("created_at", after)
        .order("created_at", { ascending: true })
        .limit(50)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages = (data ?? []).map((m: any) => ({
        role: m.role,
        content: m.content,
        sender_type: m.sender_type ?? "ai",
        created_at: m.created_at,
      }))
    }

    return NextResponse.json({
      escalation: escalation
        ? {
            id: escalation.id,
            status: escalation.status,
            adminName,
            claimedAt: escalation.claimed_at,
            closedAt: escalation.closed_at,
          }
        : null,
      messages,
    })
  } catch (error) {
    console.error("[Chat Messages] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
