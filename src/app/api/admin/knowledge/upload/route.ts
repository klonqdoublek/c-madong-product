import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractText } from "unpdf";

// Allow up to 60s for upload + processing
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upload to storage — use sanitized path (Supabase Storage doesn't support non-ASCII)
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "txt";
    const filePath = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("dorm-knowledge")
      .upload(filePath, file);

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Extract text content
    let content = "";
    const lowerName = file.name.toLowerCase();
    if (file.type.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
      content = await file.text();
    } else if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const { text } = await extractText(buffer, { mergePages: true });
        content = text;
      } catch (err) {
        console.error("[Upload] PDF parse error:", err);
      }
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
        status: content ? "pending" : "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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

  const chunks = chunkText(content, 500, 50);

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

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}
