import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SYSTEM_PROMPT = `คุณคือผู้ช่วยตอบคำถามของเจ้าหน้าที่หอพักนิสิตจุฬาลงกรณ์มหาวิทยาลัย

กฎสำคัญ:
- ตอบจากบริบทที่ให้มาเท่านั้น ห้ามแต่งเติมข้อมูลที่ไม่มีในบริบท
- ตอบกระชับ ตรงประเด็น ใช้ภาษาไทยที่เข้าใจง่าย
- ถ้าคำตอบอยู่ในบริบทแม้จะไม่ตรงคำถามทั้งหมด ให้สรุปข้อมูลที่เกี่ยวข้องมากที่สุด
- ถ้าในบริบทไม่มีข้อมูลที่เกี่ยวข้องเลย ให้บอกว่า "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"
- อ้างอิงหมายเลขข้อ/มาตรา/ส่วนจากเอกสารต้นฉบับเมื่อเป็นไปได้`;

export async function POST(request: Request) {
  try {
    const { question, documentId } = await request.json();
    if (!question) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    // Embed question
    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: question,
      }),
    });

    if (!embRes.ok) {
      return NextResponse.json({ error: "Embedding failed" }, { status: 502 });
    }

    const embData = await embRes.json();
    const queryEmbedding = embData.data?.[0]?.embedding;

    // Search similar documents
    const supabase = createAdminClient();

    // If documentId specified, search ONLY within that document's sections
    if (documentId) {
      // Use dedicated per-document RPC — searches within this document only
      // Lower threshold (0.15) + more results (8) for better recall on Thai text
      const { data: docMatches, error: docMatchError } = await (supabase as any).rpc(
        "match_document_sections",
        {
          query_embedding: JSON.stringify(queryEmbedding),
          target_document_id: documentId,
          match_count: 8,
          match_threshold: 0.15,
        }
      );

      if (docMatchError) {
        console.error("[Query] Per-document search error:", docMatchError);
        return NextResponse.json({ error: docMatchError.message }, { status: 500 });
      }

      const matches = (docMatches ?? []) as { id: string; content: string; similarity: number }[];

      if (matches.length === 0) {
        return NextResponse.json({
          answer: "ไม่พบเนื้อหาในเอกสารนี้ที่ตรงกับคำถาม",
          sources: [],
        });
      }

      // Take top 5 sections for richer context
      const topMatches = matches.slice(0, 5);
      const docContext = topMatches
        .map((m, i) => `[ส่วนที่ ${i + 1}] ${m.content}`)
        .join("\n\n");

      const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `บริบทจากเอกสาร (${topMatches.length} ส่วน):\n\n${docContext}\n\nคำถาม: ${question}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      let answer = "ไม่สามารถตอบคำถามได้ในขณะนี้";
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        answer = chatData?.choices?.[0]?.message?.content ?? answer;
      }

      return NextResponse.json({
        answer,
        sources: topMatches.map((m) => ({
          content: m.content,
          similarity: m.similarity,
        })),
      });
    }

    const { data: matches, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: 3,
        match_threshold: 0.3,
      }
    );

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    const context = (matches ?? []).map((m: { content: string }) => m.content).join("\n\n");

    if (!context) {
      return NextResponse.json({
        answer: "ไม่พบเอกสารที่เกี่ยวข้องกับคำถามนี้",
        sources: [],
      });
    }

    // Generate answer with OpenAI gpt-4o-mini
    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `บริบทจากเอกสาร:\n${context}\n\nคำถาม: ${question}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    let answer = "ไม่สามารถตอบคำถามได้ในขณะนี้";
    if (chatRes.ok) {
      const chatData = await chatRes.json();
      answer = chatData?.choices?.[0]?.message?.content ?? answer;
    } else {
      console.error("[Query] OpenAI chat error:", await chatRes.text());
    }

    return NextResponse.json({
      answer,
      sources: (matches ?? []).map((m: { content: string; similarity: number }) => ({
        content: m.content,
        similarity: m.similarity,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
