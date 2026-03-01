/**
 * RBAC Test API Route
 *
 * GET /api/admin/rbac-test - Test RBAC system
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Test 1: Check if types exist (by trying to call has_role function)
    const { data: types, error: typesError } = await supabase
      .rpc("has_role", {
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_role: "admin",
      });

    // Test 2: List user_roles table (if empty, that's ok)
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*")
      .limit(1);

    // Test 3: Check profile table structure
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role")
      .limit(1);

    // Test 4: Check if we can query the types directly
    const { data: pgTypes, error: pgTypesError } = await supabase
      .from("pg_type")
      .select("typname")
      .in("typname", ["app_role", "building_scope", "building_code"]);

    return NextResponse.json({
      success: true,
      tests: {
        types: {
          success: !typesError || typesError.code !== "42883", // 42883 = function does not exist
          error: typesError?.message,
          note: typesError?.code === "22P02" ? "Type app_role exists! (invalid uuid error is expected)" : null,
        },
        userRolesTable: {
          success: !rolesError || rolesError.code !== "42P01", // 42P01 = table does not exist
          error: rolesError?.message,
          count: userRoles?.length ?? 0,
        },
        profiles: {
          success: !profilesError,
          error: profilesError?.message,
          sample: profiles?.[0] ?? null,
        },
        pgTypes: {
          success: !pgTypesError,
          types: pgTypes ?? [],
        },
      },
      message: (pgTypes && pgTypes.length >= 3)
        ? "✅ RBAC types (app_role, building_scope, building_code) exist!"
        : "⚠️ Some RBAC types may be missing",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
