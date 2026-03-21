/**
 * API Route for Role Management
 *
 * GET /api/admin/roles - List all roles (or filter by user_id)
 * POST /api/admin/roles - Assign role to user
 * DELETE /api/admin/roles - Revoke role from user
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod/v4";

// Roles allowed to manage role assignments
const ROLE_MANAGER_ROLES = ["admin", "super_admin", "head"];

// ============================================================================
// Schemas
// ============================================================================

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([
    "super_admin",
    "head",
    "registrar",
    "finance",
    "parcel",
    "admin_staff",
    "service",
    "activity",
    "technician_head",
    "technician",
    "technician_it",
    "committee",
    "student",
  ]),
  buildingScope: z.enum([
    "chumpee",
    "chumpa",
    "pudson",
    "pudtan",
    "chuanchom",
    "male",
    "female",
    "all",
  ]).optional(),
});

const revokeRoleSchema = z.object({
  userRoleId: z.string().uuid(),
});

// ============================================================================
// GET - List roles
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ROLE_MANAGER_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Query user_roles without PostgREST join (FK points to auth.users, not profiles)
    let query = adminDb
      .from("user_roles")
      .select("id, role, building_scope, granted_at, is_active, metadata, user_id, granted_by")
      .eq("is_active", true)
      .order("granted_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: roles, error } = await query;
    if (error) throw error;

    // Enrich with profile data via separate query
    const userIds = [...new Set((roles ?? []).flatMap((r) => [r.user_id, r.granted_by].filter((id): id is string => !!id)))];
    const { data: profiles } = userIds.length > 0
      ? await adminDb
          .from("profiles")
          .select("id, full_name_th, full_name_en, student_id, email")
          .in("id", userIds)
      : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const enrichedRoles = (roles ?? []).map((r) => ({
      ...r,
      user: profileMap.get(r.user_id) ?? null,
      granted_by_user: r.granted_by ? profileMap.get(r.granted_by) ?? null : null,
    }));

    return NextResponse.json({ roles: enrichedRoles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Assign role
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const validatedData = assignRoleSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ROLE_MANAGER_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      validatedData.role === "registrar" &&
      !validatedData.buildingScope
    ) {
      return NextResponse.json(
        { error: "Building scope is required for registrar role" },
        { status: 400 }
      );
    }

    // Verify target user exists in auth.users (seeded profiles may not have auth records)
    const { data: authUser } = await adminDb.auth.admin.getUserById(validatedData.userId);
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "ผู้ใช้นี้ยังไม่ได้ลงทะเบียนในระบบ (ไม่มี auth record)" },
        { status: 400 }
      );
    }

    // Check if role already exists — handle null vs "all" for building_scope
    let existingQuery = adminDb
      .from("user_roles")
      .select("id, is_active")
      .eq("user_id", validatedData.userId)
      .eq("role", validatedData.role);

    if (validatedData.buildingScope) {
      existingQuery = existingQuery.eq("building_scope", validatedData.buildingScope);
    } else {
      existingQuery = existingQuery.is("building_scope", null);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: "User already has this role" },
          { status: 400 }
        );
      }
      // Reactivate existing role
      const { error: updateError } = await adminDb
        .from("user_roles")
        .update({ is_active: true, granted_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, reactivated: true });
    }

    // Assign new role
    const { data: newRole, error } = await adminDb
      .from("user_roles")
      .insert({
        user_id: validatedData.userId,
        role: validatedData.role,
        building_scope: validatedData.buildingScope ?? null,
        granted_by: user.id,
      })
      .select("id, role, building_scope, granted_at")
      .single();

    if (error) {
      console.error("Insert user_roles error:", error);
      throw error;
    }

    // Also update the profiles.role column to match (for legacy compatibility)
    await adminDb
      .from("profiles")
      .update({ role: validatedData.role })
      .eq("id", validatedData.userId);

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (error) {
    console.error("Error assigning role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to assign role";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Revoke role
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const validatedData = revokeRoleSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ROLE_MANAGER_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete (set is_active = false)
    const { error } = await adminDb
      .from("user_roles")
      .update({ is_active: false })
      .eq("id", validatedData.userRoleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to revoke role" },
      { status: 500 }
    );
  }
}
