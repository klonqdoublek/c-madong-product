import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DocumentExtractionError,
  extractDocumentText,
  isSupportedKnowledgeFile,
} from "@/lib/knowledge/extract-document-text";
import { chunkText } from "@/lib/knowledge/chunk-text";

const ADMIN_ROLES = ["admin", "head", "super_admin", "admin_staff"];

// Allow up to 60s for upload + processing
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabaseAuth.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !ADMIN_ROLES.includes(profile.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;
    const tagIds = formData.get("tagIds") as string | null; // comma-separated

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isSupportedKnowledgeFile(file.name, file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a TXT, MD, PDF, or DOCX document." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const buffer = await file.arrayBuffer();

    // Extract text content
    let content = "";
    try {
      content = await extractDocumentText({
        fileName: file.name,
        contentType: file.type,
        buffer,
      });
    } catch (error) {
      console.error("[Upload] Text extraction error:", error);

      const message =
        error instanceof DocumentExtractionError
          ? error.message
          : "Failed to extract text from the uploaded document";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Upload to storage only after extraction succeeds
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "txt";
    const filePath = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("dorm-knowledge")
      .upload(filePath, file);

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Insert document record
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: file.name,
        content,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        status: "pending",
        folder_id: folderId || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Assign tags if provided
    if (tagIds) {
      const ids = tagIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        await supabase
          .from("document_tag_assignments")
          .insert(ids.map((tagId) => ({ document_id: data.id, tag_id: tagId })));
      }
    }

    // Process embeddings inline (fire-and-forget gets killed on Vercel)
    if (content) {
      try {
        await processDocument(supabase, data.id, content);
      } catch (err) {
        console.error("[Upload] Processing failed:", err);
        // Document is saved — user can retry processing later
      }
    }

    // Re-fetch to get latest status after processing
    const { data: updated } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .single();

    return NextResponse.json({ document: updated ?? data });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

/** Chunk text, embed with OpenAI, insert into document_sections */
async function processDocument(supabase: SupabaseClient, documentId: string, content: string) {
  await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", documentId);

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    await supabase.from("documents").update({ status: "error" }).eq("id", documentId);
    return;
  }

  const chunks = chunkText(content, 800, 100);

  if (chunks.length === 0) {
    await supabase.from("documents").update({ status: "error" }).eq("id", documentId);
    return;
  }

  // Delete existing sections
  await supabase.from("document_sections").delete().eq("document_id", documentId);

  // Batch embed all chunks in one API call
  const embRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: chunks,
    }),
  });

  if (!embRes.ok) {
    console.error("[Upload] OpenAI embedding error:", await embRes.text());
    await supabase.from("documents").update({ status: "error" }).eq("id", documentId);
    return;
  }

  const embData = await embRes.json();
  const embeddings = embData.data as { embedding: number[]; index: number }[];

  const sections = embeddings
    .sort((a, b) => a.index - b.index)
    .map((emb) => ({
      document_id: documentId,
      content: chunks[emb.index],
      embedding: JSON.stringify(emb.embedding),
      token_count: Math.ceil(chunks[emb.index].length / 4),
    }));

  if (sections.length > 0) {
    const { error: insertError } = await supabase
      .from("document_sections")
      .insert(sections);

    if (insertError) {
      console.error("[Upload] Insert sections error:", insertError);
      await supabase.from("documents").update({ status: "error" }).eq("id", documentId);
      return;
    }
  }

  await supabase.from("documents").update({ status: "ready" }).eq("id", documentId);
}

