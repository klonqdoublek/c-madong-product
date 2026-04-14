/**
 * API Route for Admin Settings
 * GET /api/admin/settings — Read all app_settings (ai.* keys)
 * PUT /api/admin/settings — Update multiple settings
 *
 * Note: app_settings is added by migration 20260331_admin_features.sql
 * but not yet in generated Supabase types. Using `as any` casts.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { invalidateSettingsCache } from "@/lib/ai/settings"

const ADMIN_ROLES = ["admin", "super_admin", "head"]

export async function GET() {
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

    if (!profile || !ADMIN_ROLES.includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminDb as any)
      .from("app_settings")
      .select("key, value, updated_at")
      .like("key", "ai.%")

    if (error) throw error

    // Convert array to object
    const settings: Record<string, unknown> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (data ?? []) as any[]) {
      settings[row.key] = row.value
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[Admin Settings] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    if (!profile || !ADMIN_ROLES.includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body as { settings: Record<string, unknown> }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "settings object is required" },
        { status: 400 }
      )
    }

    // Upsert each setting
    const entries = Object.entries(settings).filter(([key]) =>
      key.startsWith("ai.")
    )

    for (const [key, value] of entries) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminDb as any)
        .from("app_settings")
        .upsert(
          {
            key,
            value: value as Record<string, unknown>,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        )
      if (error) {
        console.error(`[Admin Settings] Upsert ${key} error:`, error)
        throw error
      }
    }

    // Invalidate server-side cache
    invalidateSettingsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Settings] PUT error:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
