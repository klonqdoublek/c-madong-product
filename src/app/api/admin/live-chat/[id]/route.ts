/**
 * Admin Live Chat — Per-escalation operations
 * GET /api/admin/live-chat/{id} — Get messages (with ?after= for polling)
 * POST /api/admin/live-chat/{id} — Send admin reply
 * PATCH /api/admin/live-chat/{id} — Claim or close escalation
 *
 * Note: chat_escalations + sender_type/sender_id columns are added by migration
 * 20260331_admin_features.sql but not yet in generated Supabase types.
 * Using `as any` casts until types are regenerated.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ADMIN_ROLES = ["admin", "super_admin", "head", "admin_staff"]

async function verifyAdmin(adminDb: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role, display_name, full_name_th")
    .eq("id", userId)
    .single()
  if (!profile || !ADMIN_ROLES.includes(profile.role!)) return null
  return profile
}

// GET — Fetch messages for this escalation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    if (!(await verifyAdmin(adminDb, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get escalation details (new table — not in generated types yet)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation, error: escError } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, session_id, student_id, admin_id, status, reason, ai_context, created_at, claimed_at, closed_at")
      .eq("id", id)
      .single()

    if (escError || !escalation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after")

    // Get student's line_uid or user id
    const { data: studentProfile } = await adminDb
      .from("profiles")
      .select("line_uid, display_name, full_name_th, avatar_url, building_id")
      .eq("id", escalation.student_id)
      .single()

    const lineUid = studentProfile?.line_uid ?? escalation.student_id

    // Fetch messages (sender_type/sender_id are new columns — select via any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let msgQuery = (adminDb as any)
      .from("ai_chat_messages")
      .select("id, role, content, sender_type, sender_id, created_at")
      .eq("line_uid", lineUid)
      .order("created_at", { ascending: true })

    if (after) {
      msgQuery = msgQuery.gt("created_at", after)
    } else {
      // On first load, get messages around escalation time
      msgQuery = msgQuery
        .gte("created_at", new Date(new Date(escalation.created_at).getTime() - 5 * 60_000).toISOString())
        .limit(100)
    }

    const { data: messages } = await msgQuery

    return NextResponse.json({
      escalation,
      student: studentProfile,
      messages: messages ?? [],
    })
  } catch (error) {
    console.error("[Live Chat] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST — Admin sends a reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    if (!(await verifyAdmin(adminDb, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const message = body.message?.trim()
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Verify escalation is active and claimed by this admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, student_id, status, admin_id")
      .eq("id", id)
      .single()

    if (!escalation || escalation.status !== "active") {
      return NextResponse.json(
        { error: "Escalation is not active" },
        { status: 400 }
      )
    }

    // Get student's line_uid
    const { data: studentProfile } = await adminDb
      .from("profiles")
      .select("line_uid")
      .eq("id", escalation.student_id)
      .single()

    const lineUid = studentProfile?.line_uid ?? escalation.student_id

    // Save admin message (sender_type/sender_id are new columns)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminDb as any).from("ai_chat_messages").insert({
      line_uid: lineUid,
      role: "assistant",
      content: message,
      sender_type: "admin",
      sender_id: user.id,
      metadata: { escalation_id: id },
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Live Chat] POST error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

// PATCH — Claim or close escalation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const adminProfile = await verifyAdmin(adminDb, user.id)
    if (!adminProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const action = body.action as "claim" | "close"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: escalation } = await (adminDb as any)
      .from("chat_escalations")
      .select("id, student_id, status, created_at")
      .eq("id", id)
      .single()

    if (!escalation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (action === "claim") {
      if (escalation.status !== "waiting") {
        return NextResponse.json(
          { error: "Can only claim waiting escalations" },
          { status: 400 }
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminDb as any)
        .from("chat_escalations")
        .update({
          status: "active",
          admin_id: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", id)

      // Get student's line_uid and post system message
      const { data: studentProfile } = await adminDb
        .from("profiles")
        .select("line_uid")
        .eq("id", escalation.student_id)
        .single()

      const lineUid = studentProfile?.line_uid ?? escalation.student_id
      const adminName =
        adminProfile.display_name ?? adminProfile.full_name_th ?? "ทีมงาน"

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminDb as any).from("ai_chat_messages").insert({
        line_uid: lineUid,
        role: "system",
        content: `พี่ ${adminName} เข้ามาช่วยแล้วนะ!`,
        sender_type: "system",
        metadata: { escalation_id: id },
      })

      return NextResponse.json({ success: true, status: "active" })
    }

    if (action === "close") {
      if (escalation.status !== "active") {
        return NextResponse.json(
          { error: "Can only close active escalations" },
          { status: 400 }
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
            closed_by: "admin",
            admin_name:
              adminProfile.display_name ?? adminProfile.full_name_th,
            message_count: count ?? 0,
            duration_seconds: Math.floor(
              (Date.now() - new Date(escalation.created_at).getTime()) / 1000
            ),
          },
        })
        .eq("id", id)

      // Post system message
      const { data: studentProfile } = await adminDb
        .from("profiles")
        .select("line_uid")
        .eq("id", escalation.student_id)
        .single()

      const lineUid = studentProfile?.line_uid ?? escalation.student_id

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminDb as any).from("ai_chat_messages").insert({
        line_uid: lineUid,
        role: "system",
        content:
          "พี่ทีมงานปิดการสนทนาแล้ว น้องซีมะโด่งกลับมาช่วยต่อนะจ้า",
        sender_type: "system",
        metadata: { escalation_id: id },
      })

      return NextResponse.json({ success: true, status: "closed" })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'claim' or 'close'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[Live Chat] PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update escalation" },
      { status: 500 }
    )
  }
}
