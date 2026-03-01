import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const supabase = await createClient();

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

    // Generate embeddings and insert sections
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

    for (const chunk of chunks) {
      // Get embedding
      const embRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: chunk,
        }),
      });

      if (!embRes.ok) continue;

      const embData = await embRes.json();
      const embedding = embData.data?.[0]?.embedding;
      if (!embedding) continue;

      await supabase.from("document_sections").insert({
        document_id: documentId,
        content: chunk,
        embedding: JSON.stringify(embedding),
        token_count: Math.ceil(chunk.length / 4),
      });
    }

    await supabase
      .from("documents")
      .update({ status: "ready" })
      .eq("id", documentId);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch {
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
