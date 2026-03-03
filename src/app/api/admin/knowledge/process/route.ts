import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allow up to 60s for processing (Pro plan), Hobby = 10s
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get document
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Chunk content
    const chunks = chunkText(doc.content, 500, 50);

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      await supabase
        .from("documents")
        .update({ status: "error" })
        .eq("id", documentId);
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    // Delete existing sections
    await supabase
      .from("document_sections")
      .delete()
      .eq("document_id", documentId);

    // Batch embed all chunks in one API call (much faster than per-chunk)
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
      const err = await embRes.text();
      console.error("[Process] OpenAI embedding error:", err);
      await supabase
        .from("documents")
        .update({ status: "error" })
        .eq("id", documentId);
      return NextResponse.json({ error: "Embedding failed" }, { status: 502 });
    }

    const embData = await embRes.json();
    const embeddings = embData.data as { embedding: number[]; index: number }[];

    // Insert all sections in one batch
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
        console.error("[Process] Insert sections error:", insertError);
        await supabase
          .from("documents")
          .update({ status: "error" })
          .eq("id", documentId);
        return NextResponse.json({ error: "Insert failed" }, { status: 500 });
      }
    }

    await supabase
      .from("documents")
      .update({ status: "ready" })
      .eq("id", documentId);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (err) {
    console.error("[Process] Unexpected error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
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
