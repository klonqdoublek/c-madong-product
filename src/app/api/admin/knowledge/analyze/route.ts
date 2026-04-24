import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectVersion } from "@/lib/knowledge/detect-version";
import { analyzeDocument } from "@/lib/knowledge/ai-analyze";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { documentId } = (await request.json()) as { documentId?: string };
    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Load document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error: docErr } = await (supabase as any)
      .from("documents")
      .select("id, title, filename, content, folder_id, version_number")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Load existing folders + tags in parallel
    const [foldersRes, tagsRes] = await Promise.all([
      supabase.from("knowledge_folders").select("id, name, description"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("document_tags").select("id, name"),
    ]);

    const existingFolders = (foldersRes.data ?? []) as Array<{
      id: string;
      name: string;
      description: string | null;
    }>;
    const existingTags = (tagsRes.data ?? []) as Array<{
      id: string;
      name: string;
    }>;

    // Run detect-version + ai-analyze in parallel
    const [versionMatch, aiResult] = await Promise.all([
      detectVersion({
        filename: doc.filename ?? doc.title ?? "",
        content: doc.content ?? "",
        currentDocumentId: doc.id,
        supabase,
      }).catch((err) => {
        console.error("[analyze] detectVersion failed:", err);
        return null;
      }),
      analyzeDocument({
        filename: doc.filename ?? doc.title ?? "",
        content: doc.content ?? "",
        existingFolders,
        existingTags,
      }).catch((err) => {
        console.error("[analyze] analyzeDocument failed:", err);
        return null;
      }),
    ]);

    return NextResponse.json({
      documentId: doc.id,
      filename: doc.filename,
      suggestion: aiResult,
      versionMatch,
    });
  } catch (err) {
    console.error("[analyze] Error:", err);
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
