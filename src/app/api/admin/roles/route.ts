/**
 * API Route for Role Management
 *
 * GET /api/admin/roles - List all roles (or filter by user_id)
 * POST /api/admin/roles - Assign role to user
 * DELETE /api/admin/roles - Revoke role from user
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

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

    // Check if user is admin/head
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from("user_roles")
      .select(
        `
        id,
        role,
        building_scope,
        granted_at,
        is_active,
        metadata,
        user_id,
        user:profiles!user_roles_user_id_fkey (
          id,
          full_name_th,
          full_name_en,
          student_id,
          email
        ),
        granted_by_user:profiles!user_roles_granted_by_fkey (
          id,
          full_name_th,
          full_name_en
        )
      `
      )
      .eq("is_active", true)
      .order("granted_at", { ascending: false });

    // Filter by user if specified
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: roles, error } = await query;

    if (error) throw error;

    return NextResponse.json({ roles });
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

    // Validate input
    const validatedData = assignRoleSchema.parse(body);

    // Check if user is admin/head
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if building_scope is provided for registrar role
    if (
      validatedData.role === "registrar" &&
      !validatedData.buildingScope
    ) {
      return NextResponse.json(
        { error: "Building scope is required for registrar role" },
        { status: 400 }
      );
    }

    // Check if role already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id, is_active")
      .eq("user_id", validatedData.userId)
      .eq("role", validatedData.role)
      .eq(
        "building_scope",
        validatedData.buildingScope ?? "all"
      )
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: "User already has this role" },
          { status: 400 }
        );
      }
      // Reactivate existing role
      const { data: updated, error: updateError } = await supabase
        .from("user_roles")
        .update({ is_active: true, granted_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select(
          `
          id,
          role,
          building_scope,
          granted_at,
          user:profiles!user_roles_user_id_fkey (
            id,
            full_name_th
          )
        `
        )
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ role: updated });
    }

    // Assign new role
    const { data: newRole, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: validatedData.userId,
        role: validatedData.role,
        building_scope: validatedData.buildingScope,
        granted_by: user.id,
      })
      .select(
        `
        id,
        role,
        building_scope,
        granted_at,
        user:profiles!user_roles_user_id_fkey (
          id,
          full_name_th
        )
        `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (error) {
    console.error("Error assigning role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to assign role" },
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

    // Validate input
    const validatedData = revokeRoleSchema.parse(body);

    // Check if user is admin/head
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete (set is_active = false)
    const { error } = await supabase
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
