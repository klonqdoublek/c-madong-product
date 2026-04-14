import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all folders ordered by sort_order
    const adminDb = createAdminClient();
    const { data: folders, error } = await adminDb
      .from("announcement_folders")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching folders:", error);
      return NextResponse.json(
        { error: "Failed to fetch folders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error in GET /api/admin/announcements/folders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { name, parentId, icon, color, description } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Auto-increment sort_order (find max for siblings + 1)
    const { data: siblings } = await adminDb
      .from("announcement_folders")
      .select("sort_order")
      .eq("parent_id", parentId || null)
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxSortOrder = siblings?.[0]?.sort_order || 0;

    // Create folder
    const { data: folder, error } = await adminDb
      .from("announcement_folders")
      .insert({
        name: name.trim(),
        parent_id: parentId || null,
        icon: icon || "Folder",
        color: color || "#6B7280",
        description: description?.trim() || null,
        sort_order: maxSortOrder + 1,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating folder:", error);
      return NextResponse.json(
        { error: "Failed to create folder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/announcements/folders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
