export interface TyphoonOCRResult {
  markdown: string;
  confidence: number;
  provider: "typhoon-ocr" | "gpt-4o-fallback";
}

/**
 * Extract Thai/EN text from an image using Typhoon OCR API.
 * Tailored for Canva-style dorm announcement posters.
 * Falls back to GPT-4o vision on 5xx or timeout.
 */
export async function extractPosterText(imageUrl: string): Promise<TyphoonOCRResult> {
  const apiKey = process.env.TYPHOON_OCR_API_KEY;

  if (apiKey) {
    try {
      const result = await tryTyphoonOCR(imageUrl, apiKey);
      return result;
    } catch (err) {
      console.warn("[TyphoonOCR] Primary failed, trying GPT-4o fallback:", err);
    }
  }

  return tryGPT4oOCR(imageUrl);
}

async function tryTyphoonOCR(imageUrl: string, apiKey: string): Promise<TyphoonOCRResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch("https://api.opentyphoon.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "typhoon-ocr",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "สกัดข้อความทั้งหมดจากรูปโปสเตอร์ประกาศหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย ให้ครบถ้วนตามที่ปรากฏในภาพ รวมถึงหัวข้อ วันที่ เวลา สถานที่ รายละเอียด และข้อมูลอื่นๆ ตอบเป็น Markdown",
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Typhoon OCR HTTP ${res.status}`);
    }

    const data = await res.json();
    const markdown: string = data.choices?.[0]?.message?.content ?? "";

    return {
      markdown: markdown.trim(),
      confidence: markdown.length > 50 ? 0.85 : 0.5,
      provider: "typhoon-ocr",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGPT4oOCR(imageUrl: string): Promise<TyphoonOCRResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return { markdown: "", confidence: 0, provider: "gpt-4o-fallback" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "สกัดข้อความทั้งหมดจากโปสเตอร์ประกาศหอพักนิสิตจุฬาฯ ให้ครบถ้วน รวมหัวข้อ วันที่ เวลา สถานที่ รายละเอียด ตอบเป็น Markdown",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    return { markdown: "", confidence: 0, provider: "gpt-4o-fallback" };
  }

  const data = await res.json();
  const markdown: string = data.choices?.[0]?.message?.content ?? "";

  return {
    markdown: markdown.trim(),
    confidence: markdown.length > 50 ? 0.7 : 0.3,
    provider: "gpt-4o-fallback",
  };
}
