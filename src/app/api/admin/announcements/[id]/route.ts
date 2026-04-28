import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEmbedding } from "@/lib/chatbot/rag/embeddings";
import { hasAnnouncementPermission } from "@/lib/rbac/announcement-permissions";
import { Permission } from "@/lib/rbac/permissions";

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

    if (!hasAnnouncementPermission(profile?.role, Permission.ANNOUNCEMENTS_EDIT)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title_th, title_en, content_th, content_en,
      message_type, flex_json, target_type, target_tags,
      is_pinned, cover_image, status,
      event_date, location, has_dorm_score, score_points,
      category, folder_id,
      ai_extracted, ocr_text, ai_confidence, ai_provider, extraction_mode,
      is_bot_searchable,
      embed_text,
      carousel_images,
      event_end_date, event_all_day, event_start_time, event_end_time,
    } = body;

    const adminDb = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title_th !== undefined) { updateData.title_th = title_th; updateData.title = title_th; }
    if (title_en !== undefined) updateData.title_en = title_en || title_th;
    if (content_th !== undefined) updateData.content_th = content_th;
    if (content_en !== undefined) updateData.content_en = content_en || content_th;
    if (message_type !== undefined) updateData.message_type = message_type;
    if (flex_json !== undefined) updateData.flex_json = message_type === "flex" ? flex_json : null;
    if (target_type !== undefined) updateData.target_type = target_type;
    if (target_tags !== undefined) updateData.target_tags = target_tags;
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (event_date !== undefined) updateData.event_date = event_date || null;
    if (location !== undefined) updateData.location = location || null;
    if (has_dorm_score !== undefined) updateData.has_dorm_score = has_dorm_score;
    if (score_points !== undefined) updateData.score_points = score_points;
    if (is_bot_searchable !== undefined) updateData.is_bot_searchable = is_bot_searchable;
    if (ocr_text !== undefined) updateData.ocr_text = ocr_text;
    if (ai_extracted !== undefined) updateData.ai_extracted = ai_extracted as any;
    if (ai_confidence !== undefined) updateData.ai_confidence = ai_confidence;
    if (ai_provider !== undefined) updateData.ai_provider = ai_provider;
    if (extraction_mode !== undefined) updateData.extraction_mode = extraction_mode;
    if (folder_id !== undefined) updateData.folder_id = folder_id || null;
    if (carousel_images !== undefined) updateData.carousel_images = carousel_images ?? [];
    if (event_end_date !== undefined) updateData.event_end_date = event_end_date || null;
    if (event_all_day !== undefined) updateData.event_all_day = event_all_day;
    if (event_start_time !== undefined) updateData.event_start_time = event_start_time || null;
    if (event_end_time !== undefined) updateData.event_end_time = event_end_time || null;

    if (status === "sent") {
      updateData.sent_at = new Date().toISOString();
      updateData.published_at = new Date().toISOString();
    }

    const { data: announcement, error } = await (adminDb as any)
      .from("announcements")
      .update(updateData)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("Error updating announcement:", error);
      return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
    }

    if (is_bot_searchable !== false) {
      const textToEmbed = embed_text || [title_th, content_th, ocr_text].filter(Boolean).join(" ");
      if (textToEmbed?.trim()) {
        generateEmbedding(textToEmbed)
          .then((embedding) =>
            (adminDb as any)
              .from("announcements")
              .update({ embedding: JSON.stringify(embedding) })
              .eq("id", id)
          )
          .catch((err) => console.error("[PATCH announcement] Embed failed:", err));
      }
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error in PATCH /api/admin/announcements/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
