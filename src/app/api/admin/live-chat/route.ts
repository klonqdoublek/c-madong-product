/**
 * Admin Live Chat Queue
 * GET /api/admin/live-chat — List escalation queue (active + history)
 *
 * Note: chat_escalations is added by migration 20260331_admin_features.sql
 * but not yet in generated Supabase types. Using `as any` casts.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ADMIN_ROLES = ["admin", "super_admin", "head", "admin_staff"]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab") ?? "active" // "active" | "history"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (adminDb as any)
      .from("chat_escalations")
      .select("id, session_id, student_id, admin_id, status, reason, ai_context, closed_summary, created_at, claimed_at, closed_at")

    if (tab === "history") {
      query = query
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(50)
    } else {
      query = query
        .in("status", ["waiting", "active"])
        .order("created_at", { ascending: true })
    }

    const { data: escalations, error } = await query
    if (error) throw error

    // Enrich with student + admin profiles
    const userIds: string[] = [
      ...new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (escalations ?? []).flatMap((e: any) =>
          [e.student_id, e.admin_id].filter((id: string | null): id is string => !!id)
        ) as string[]
      ),
    ]

    const { data: profiles } =
      userIds.length > 0
        ? await adminDb
            .from("profiles")
            .select("id, display_name, full_name_th, avatar_url, building_id")
            .in("id", userIds)
        : { data: [] as { id: string; display_name: string | null; full_name_th: string | null; avatar_url: string | null; building_id: string | null }[] }

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    )

    // Get building names for students
    const buildingIds = [
      ...new Set(
        (profiles ?? [])
          .map((p) => p.building_id)
          .filter((id): id is string => !!id)
      ),
    ]
    const { data: buildings } =
      buildingIds.length > 0
        ? await adminDb
            .from("buildings")
            .select("id, name_th")
            .in("id", buildingIds)
        : { data: [] as { id: string; name_th: string }[] }
    const buildingMap = new Map(
      (buildings ?? []).map((b) => [b.id, b.name_th])
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = (escalations ?? []).map((e: any) => {
      const student = e.student_id ? profileMap.get(e.student_id) : null
      const admin = e.admin_id ? profileMap.get(e.admin_id) : null
      return {
        ...e,
        student: student
          ? {
              ...student,
              building_name: student.building_id
                ? buildingMap.get(student.building_id) ?? null
                : null,
            }
          : null,
        admin: admin
          ? {
              name: admin.display_name ?? admin.full_name_th,
              avatar_url: admin.avatar_url,
            }
          : null,
      }
    })

    return NextResponse.json({ escalations: enriched })
  } catch (error) {
    console.error("[Live Chat] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    )
  }
}
