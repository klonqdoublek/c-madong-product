import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEmbedding } from "@/lib/chatbot/rag/embeddings";

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
    const year = searchParams.get("year");

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

    // Year filter — derived from created_at
    if (year && /^\d{4}$/.test(year)) {
      query = query
        .gte("created_at", `${year}-01-01`)
        .lte("created_at", `${year}-12-31`);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "head", "super_admin"].includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title_th, title_en, content_th, content_en,
      message_type, flex_json, target_type, target_tags,
      is_pinned, cover_image, status,
      // AI fields
      event_date, location, has_dorm_score, score_points,
      category, folder_id,
      ai_extracted, ocr_text, ai_confidence, ai_provider, extraction_mode,
      is_bot_searchable = true,
      embed_text,
    } = body;

    const adminDb = createAdminClient();

    const insertData: Record<string, unknown> = {
      title_th,
      title_en: title_en || title_th,
      content_th,
      content_en: content_en || content_th,
      message_type: message_type ?? "text",
      flex_json: flex_json ?? null,
      target_type: target_type ?? "broadcast",
      target_tags: target_tags ?? [],
      is_pinned: is_pinned ?? false,
      cover_image: cover_image ?? null,
      status: status ?? "draft",
      category: category ?? "announcement",
      folder_id: folder_id ?? null,
      event_date: event_date ?? null,
      location: location ?? null,
      has_dorm_score: has_dorm_score ?? false,
      score_points: score_points ?? null,
      ai_extracted: (ai_extracted ?? null) as any,
      ocr_text: ocr_text ?? null,
      ai_confidence: ai_confidence ?? null,
      ai_provider: ai_provider ?? null,
      extraction_mode: extraction_mode ?? null,
      is_bot_searchable,
      author_id: user.id,
      created_by: user.id,
    };

    if (status === "sent") {
      insertData.sent_at = new Date().toISOString();
      insertData.published_at = new Date().toISOString();
    }

    const { data: announcement, error } = await (adminDb as any)
      .from("announcements")
      .insert(insertData)
      .select("id")
      .single();

    if (error || !announcement) {
      console.error("Error creating announcement:", error);
      return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }

    // Generate embedding asynchronously (don't block save)
    if (is_bot_searchable) {
      const textToEmbed = embed_text || [title_th, content_th, ocr_text].filter(Boolean).join(" ");
      if (textToEmbed.trim()) {
        generateEmbedding(textToEmbed)
          .then((embedding) =>
            (adminDb as any)
              .from("announcements")
              .update({ embedding: JSON.stringify(embedding) })
              .eq("id", announcement.id)
          )
          .catch((err) => console.error("[POST announcement] Embed failed:", err));
      }
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
