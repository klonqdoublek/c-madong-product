import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPosterText } from "@/lib/ai/typhoon-ocr";
import { structureAnnouncementFromOCR } from "@/lib/ai/agents/announcement-agent";
import { generateEmbedding } from "@/lib/chatbot/rag/embeddings";

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

    const { imageUrl, mode = "image_with_text" } = await request.json() as {
      imageUrl: string;
      mode?: "image_only" | "image_with_text";
    };

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // Fetch existing folders + tags for suggestion validation
    const [{ data: folders }, { data: tags }] = await Promise.all([
      adminDb.from("announcement_folders").select("id, name").order("name"),
      adminDb.from("announcement_tags").select("id, name").order("name"),
    ]);

    // Stage 1: OCR
    const ocrResult = await extractPosterText(imageUrl);

    // Stage 2: Structure (even for image_only mode — we still extract for embedding)
    let suggestion = null;
    try {
      suggestion = await structureAnnouncementFromOCR({
        ocrMarkdown: ocrResult.markdown,
        existingFolders: folders ?? [],
        existingTags: tags ?? [],
      });
      // Merge OCR confidence with agent confidence
      suggestion.confidence = Math.min(ocrResult.confidence, suggestion.confidence);
    } catch (err) {
      console.error("[analyze-poster] Structuring failed:", err);
      // Return OCR text only — admin fills manually
    }

    // Stage 3: Pre-generate embedding text (for later use on save)
    const embedText = [
      suggestion?.title_th,
      suggestion?.content_th,
      ocrResult.markdown,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 8000);

    return NextResponse.json({
      ocr_text: mode === "image_with_text" ? ocrResult.markdown : null,
      ocr_provider: ocrResult.provider,
      suggestion,
      embed_text: embedText, // client sends this back on save
    });
  } catch (err) {
    console.error("[analyze-poster] Error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
