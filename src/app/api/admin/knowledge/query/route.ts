import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

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
    const supabase = await createClient();
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: 5,
        match_threshold: 0.5,
      }
    );

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    const context = (matches ?? []).map((m: { content: string }) => m.content).join("\n\n");

    // Generate answer with Gemini
    if (!geminiKey) {
      return NextResponse.json({
        answer: context || "No relevant documents found.",
        sources: matches ?? [],
      });
    }

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful assistant for Chulalongkorn University dormitory staff.
Answer the question based on the context provided. Respond in Thai.
If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${question}`,
                },
              ],
            },
          ],
        }),
      }
    );

    let answer = "ไม่สามารถตอบคำถามได้ในขณะนี้";
    if (genRes.ok) {
      const genData = await genRes.json();
      answer = genData?.candidates?.[0]?.content?.parts?.[0]?.text ?? answer;
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
