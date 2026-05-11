import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    // Load source announcement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: source, error: srcErr } = await (adminDb as any)
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (srcErr || !source) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Determine root and next version number
    const rootId = source.parent_announcement_id ?? source.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: maxVersionData } = await (adminDb as any)
      .from("announcements")
      .select("version_number")
      .or(`id.eq.${rootId},parent_announcement_id.eq.${rootId}`)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (maxVersionData?.version_number ?? 0) + 1;

    // Create new version (copy of source)
    const newAnnouncement = {
      title: source.title,
      title_th: source.title_th,
      title_en: source.title_en,
      content_th: source.content_th,
      content_en: source.content_en,
      message_type: source.message_type,
      flex_json: source.flex_json,
      target_type: source.target_type,
      target_tags: source.target_tags,
      is_pinned: source.is_pinned,
      cover_image: source.cover_image,
      status: source.status,
      category: source.category,
      folder_id: source.folder_id,
      event_date: source.event_date,
      location: source.location,
      has_dorm_score: source.has_dorm_score,
      score_points: source.score_points,
      ai_extracted: source.ai_extracted,
      ocr_text: source.ocr_text,
      ai_confidence: source.ai_confidence,
      ai_provider: source.ai_provider,
      extraction_mode: source.extraction_mode,
      is_bot_searchable: source.is_bot_searchable,
      embedding: source.embedding,
      // Version fields
      parent_announcement_id: rootId,
      version_number: nextVersionNumber,
      is_current: true,
      // Metadata
      author_id: user.id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert new version
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newVersion, error: insertErr } = await (adminDb as any)
      .from("announcements")
      .insert(newAnnouncement)
      .select("id")
      .single();

    if (insertErr || !newVersion) {
      console.error("Error creating version:", insertErr);
      return NextResponse.json(
        { error: "Failed to create version" },
        { status: 500 }
      );
    }

    // Update old versions to is_current=false
    await adminDb
      .from("announcements")
      .update({ is_current: false })
      .or(`id.eq.${rootId},parent_announcement_id.eq.${rootId}`)
      .neq("id", newVersion.id);

    return NextResponse.json({ id: newVersion.id }, { status: 201 });
  } catch (err) {
    console.error("[announcements create-version] Error:", err);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
