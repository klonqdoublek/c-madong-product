import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEmbedding } from "@/lib/chatbot/rag/embeddings";

export async function POST(
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

    if (!profile || !["admin", "head", "super_admin"].includes(profile.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const adminDb = createAdminClient();

    // Fetch announcement to build embed text
    const { data: ann, error } = await (adminDb as any)
      .from("announcements")
      .select("title_th, title_en, content_th, content_en, ocr_text")
      .eq("id", id)
      .single();

    if (error || !ann) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const embedText = [
      ann.title_th,
      ann.title_en,
      ann.content_th,
      ann.content_en,
      ann.ocr_text,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 8000);

    const embedding = await generateEmbedding(embedText);

    await (adminDb as any)
      .from("announcements")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[embed] Error:", err);
    return NextResponse.json({ error: "Embed failed" }, { status: 500 });
  }
}
