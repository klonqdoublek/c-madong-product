import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get single folder by ID
    const adminDb = createAdminClient();
    const { data: folder, error } = await adminDb
      .from("announcement_folders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching folder:", error);
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error in GET /api/admin/announcements/folders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head", "super_admin"].includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, parentId, icon, color, description, sortOrder } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name?.trim()) {
      updates.name = name.trim();
    }
    if (parentId !== undefined) {
      updates.parent_id = parentId || null;
    }
    if (icon) {
      updates.icon = icon;
    }
    if (color) {
      updates.color = color;
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }
    if (sortOrder !== undefined) {
      updates.sort_order = sortOrder;
    }

    // Update folder
    const adminDb = createAdminClient();
    const { data: folder, error } = await adminDb
      .from("announcement_folders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating folder:", error);
      return NextResponse.json(
        { error: "Failed to update folder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error in PATCH /api/admin/announcements/folders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head", "super_admin"].includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete folder (CASCADE will delete child folders, SET NULL for announcements)
    const adminDb = createAdminClient();
    const { error } = await adminDb
      .from("announcement_folders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting folder:", error);
      return NextResponse.json(
        { error: "Failed to delete folder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/announcements/folders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
