import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a Thai UX writer for a university dormitory app called C-Madong.
Write in a friendly, helpful tone suitable for Gen-Z Thai students.
Use gender-neutral particles (นะ, จ้า, not ครับ/ค่ะ).
Keep the text concise and clear.

User request: ${prompt}

Respond with only the generated Thai text, no explanations.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "ไม่สามารถสร้างข้อความได้";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
