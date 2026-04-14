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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const tagId = searchParams.get("tagId");
    const search = searchParams.get("search");
    const archived = searchParams.get("archived");

    const adminDb = createAdminClient();

    // Build query
    let query = adminDb
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    // Folder filter
    if (folderId && folderId !== "all") {
      if (folderId === "null") {
        query = query.is("folder_id", null);
      } else {
        query = query.eq("folder_id", folderId);
      }
    }

    // Archive filter
    if (archived === "true") {
      query = query.not("archived_at", "is", null);
    } else if (archived === "false") {
      query = query.is("archived_at", null);
    }

    // Search filter
    if (search) {
      query = query.or(`title_th.ilike.%${search}%,title_en.ilike.%${search}%`);
    }

    const { data: announcements, error } = await query;

    if (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      );
    }

    // Fetch tag assignments for these announcements
    let announcementsWithTags = announcements || [];

    if (announcementsWithTags.length > 0) {
      const announcementIds = announcementsWithTags.map((a: any) => a.id);

      // Get tag assignments
      const { data: tagAssignments } = await adminDb
        .from("announcement_tag_assignments")
        .select("announcement_id, tag_id")
        .in("announcement_id", announcementIds);

      // Get all tags
      const { data: allTags } = await adminDb
        .from("announcement_tags")
        .select("*");

      // Get all folders
      const { data: allFolders } = await adminDb
        .from("announcement_folders")
        .select("*");

      // Create lookup maps
      const tagMap = new Map((allTags ?? []).map((t: any) => [t.id, t]));
      const folderMap = new Map((allFolders ?? []).map((f: any) => [f.id, f]));

      // Enrich announcements with tags and folder objects
      announcementsWithTags = announcementsWithTags.map((ann: any) => {
        const annTagIds = (tagAssignments ?? [])
          .filter((ta: any) => ta.announcement_id === ann.id)
          .map((ta: any) => ta.tag_id);

        const tags = annTagIds
          .map((id: any) => tagMap.get(id))
          .filter(Boolean);

        const folder = ann.folder_id ? folderMap.get(ann.folder_id) : null;

        return {
          ...ann,
          tags,
          folder,
        };
      });

      // Filter by tagId if specified
      if (tagId) {
        announcementsWithTags = announcementsWithTags.filter((ann: any) =>
          ann.tags?.some((t: any) => t.id === tagId)
        );
      }
    }

    return NextResponse.json({ announcements: announcementsWithTags });
  } catch (error) {
    console.error("Error in GET /api/admin/announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
