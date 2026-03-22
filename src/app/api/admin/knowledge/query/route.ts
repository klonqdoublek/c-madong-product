import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SYSTEM_PROMPT = `คุณคือผู้ช่วยตอบคำถามของเจ้าหน้าที่หอพักนิสิตจุฬาลงกรณ์มหาวิทยาลัย

กฎสำคัญ:
- ตอบเฉพาะสิ่งที่ถูกถามเท่านั้น ห้ามเอาข้อมูลอื่นมาใส่เพิ่ม
- ตอบกระชับ ตรงประเด็น ใช้ภาษาไทยที่เข้าใจง่าย
- ถ้าในบริบทไม่มีข้อมูลที่เกี่ยวข้องกับคำถาม ให้บอกว่า "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"
- ห้ามแต่งเติมข้อมูลที่ไม่มีในบริบท`;

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

    // If documentId specified, search only within that document's sections
    if (documentId) {
      const { data: sections } = await supabase
        .from("document_sections")
        .select("id, content")
        .eq("document_id", documentId);

      if (!sections || sections.length === 0) {
        return NextResponse.json({
          answer: "ไม่พบเนื้อหาในเอกสารนี้",
          sources: [],
        });
      }

      // Use match_documents but filter results to only this document
      const { data: allMatches } = await supabase.rpc("match_documents", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: 10,
        match_threshold: 0.3,
      });

      const sectionIds = new Set(sections.map((s) => s.id));
      const filteredMatches = (allMatches ?? []).filter(
        (m: { id: string }) => sectionIds.has(m.id)
      ).slice(0, 3);

      const docContext = filteredMatches.map((m: { content: string }) => m.content).join("\n\n");

      if (!docContext) {
        return NextResponse.json({
          answer: "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสารนี้",
          sources: [],
        });
      }

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
              content: `บริบทจากเอกสาร:\n${docContext}\n\nคำถาม: ${question}`,
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
      }

      return NextResponse.json({
        answer,
        sources: filteredMatches.map((m: { content: string; similarity: number }) => ({
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
