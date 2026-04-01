/**
 * Student-side escalation API
 * POST /api/chat/escalate — Create escalation (student requests human)
 * DELETE /api/chat/escalate — Cancel pending escalation
 * PATCH /api/chat/escalate — Student closes active escalation ("จบการสนทนา")
 *
 * Note: chat_escalations + sender_type columns are added by migration
 * 20260331_admin_features.sql but not yet in generated Supabase types.
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getRecentMessages } from "@/lib/chatbot/chat-history"
import { notifyChatEscalation } from "@/lib/notifications/triggers"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const sessionId = `web_${user.id}`

    // Check for existing active escalation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, status")
      .eq("session_id", sessionId)
      .in("status", ["waiting", "active"])
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        escalationId: existing.id,
        status: existing.status,
        message: "Escalation already exists",
      })
    }

    // Get profile
    const { data: profile } = await adminDb
      .from("profiles")
      .select("display_name, full_name_th, line_uid, building_id")
      .eq("id", user.id)
      .single()

    // Get recent messages for AI context
    const identifier = profile?.line_uid ?? user.id
    const recentMessages = await getRecentMessages(identifier, 5)
    const aiContext = {
      last_messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      trigger: "user_request",
    }

    // Create escalation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation, error } = await (adminDb as any)
      .from("chat_escalations")
      .insert({
        session_id: sessionId,
        student_id: user.id,
        status: "waiting",
        reason: "user_request",
        ai_context: aiContext,
      })
      .select("id, status, created_at")
      .single()

    if (error) throw error

    // Notify admins
    const studentName =
      profile?.display_name ?? profile?.full_name_th ?? "นิสิต"

    // Get issue summary from last message
    const lastUserMsg = recentMessages.find((m) => m.role === "user")
    const issueSummary = lastUserMsg?.content?.slice(0, 100) ?? "ต้องการความช่วยเหลือ"

    await notifyChatEscalation({
      escalationId: escalation.id,
      studentName,
      studentId: user.id,
      issueSummary,
      sessionId,
    }).catch((err) => {
      console.error("[Escalation] Notification failed:", err)
    })

    return NextResponse.json({
      escalationId: escalation.id,
      status: "waiting",
    })
  } catch (error) {
    console.error("[Escalation] POST error:", error)
    return NextResponse.json(
      { error: "Failed to create escalation" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const sessionId = `web_${user.id}`

    // Find and close the waiting escalation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, status")
      .eq("session_id", sessionId)
      .eq("status", "waiting")
      .limit(1)
      .maybeSingle()

    if (!escalation) {
      return NextResponse.json({ message: "No pending escalation" })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminDb as any)
      .from("chat_escalations")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closed_summary: { cancelled_by: "student" },
      })
      .eq("id", escalation.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Escalation] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to cancel escalation" },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const sessionId = `web_${user.id}`

    // Find active escalation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, status, admin_id, created_at")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (!escalation) {
      return NextResponse.json(
        { error: "No active escalation" },
        { status: 404 }
      )
    }

    // Count messages during escalation
    const { count } = await adminDb
      .from("ai_chat_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", escalation.created_at)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminDb as any)
      .from("chat_escalations")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closed_summary: {
          closed_by: "student",
          message_count: count ?? 0,
          duration_seconds: Math.floor(
            (Date.now() - new Date(escalation.created_at).getTime()) / 1000
          ),
        },
      })
      .eq("id", escalation.id)

    // Save system message (sender_type is new column)
    const identifier = user.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminDb as any).from("ai_chat_messages").insert({
      line_uid: identifier,
      role: "system",
      content:
        "นิสิตปิดการสนทนา น้องซีมะโด่งกลับมาช่วยต่อนะจ้า",
      sender_type: "system",
      metadata: { escalation_id: escalation.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Escalation] PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to close escalation" },
      { status: 500 }
    )
  }
}
