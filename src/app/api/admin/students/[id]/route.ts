import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const adminRoles = ["admin", "head", "super_admin", "admin_staff"];
    if (!profile || !adminRoles.includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      full_name_th, student_id, building_id, room_id, bed_id, tags, status,
    } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name_th !== undefined) updateData.full_name_th = full_name_th;
    if (student_id !== undefined) updateData.student_id = student_id;
    if (building_id !== undefined) updateData.building_id = building_id;
    if (room_id !== undefined) updateData.room_id = room_id;
    if (bed_id !== undefined) updateData.bed_id = bed_id;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    const adminDb = createAdminClient();
    const { error } = await adminDb
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating student:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/admin/students/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
