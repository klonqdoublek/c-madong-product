import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const { action, announcementIds, folderId, tagIds } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    if (!announcementIds || !Array.isArray(announcementIds) || announcementIds.length === 0) {
      return NextResponse.json(
        { error: "Announcement IDs are required" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Perform bulk operation based on action
    switch (action) {
      case "move": {
        if (folderId === undefined) {
          return NextResponse.json(
            { error: "Folder ID is required for move action" },
            { status: 400 }
          );
        }

        // Update folder_id for all announcements
        const { error } = await adminDb
          .from("announcements")
          .update({ folder_id: folderId || null })
          .in("id", announcementIds);

        if (error) {
          console.error("Error moving announcements:", error);
          return NextResponse.json(
            { error: "Failed to move announcements" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          count: announcementIds.length,
          action: "move"
        });
      }

      case "tag": {
        if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
          return NextResponse.json(
            { error: "Tag IDs are required for tag action" },
            { status: 400 }
          );
        }

        // Create tag assignments (ignore duplicates with ON CONFLICT)
        const assignments = announcementIds.flatMap((announcementId) =>
          tagIds.map((tagId) => ({
            announcement_id: announcementId,
            tag_id: tagId,
          }))
        );

        const { error } = await adminDb
          .from("announcement_tag_assignments")
          .upsert(assignments, { onConflict: "announcement_id,tag_id" });

        if (error) {
          console.error("Error tagging announcements:", error);
          return NextResponse.json(
            { error: "Failed to tag announcements" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          count: announcementIds.length,
          action: "tag"
        });
      }

      case "archive": {
        // Update archived_at to current timestamp
        const { error } = await adminDb
          .from("announcements")
          .update({ archived_at: new Date().toISOString() })
          .in("id", announcementIds);

        if (error) {
          console.error("Error archiving announcements:", error);
          return NextResponse.json(
            { error: "Failed to archive announcements" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          count: announcementIds.length,
          action: "archive"
        });
      }

      case "restore": {
        // Update archived_at to NULL
        const { error } = await adminDb
          .from("announcements")
          .update({ archived_at: null })
          .in("id", announcementIds);

        if (error) {
          console.error("Error restoring announcements:", error);
          return NextResponse.json(
            { error: "Failed to restore announcements" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          count: announcementIds.length,
          action: "restore"
        });
      }

      default: {
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("Error in POST /api/admin/announcements/bulk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
