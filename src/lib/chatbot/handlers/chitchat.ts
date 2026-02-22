import { getGeminiClient, GEMINI_FLASH_MODEL } from "@/lib/ai/gemini"
import { CHITCHAT_SYSTEM_PROMPT } from "../system-prompts"
import { AI_TIMEOUT_MS } from "../constants"
import type { HandlerResponse } from "../types"

/** Handle chitchat intent using Gemini Flash with น้องซีมะโด่ง persona */
export async function handleChitchat(
  message: string,
  recentHistory: { role: string; content: string }[] = []
): Promise<HandlerResponse> {
  try {
    const ai = getGeminiClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    // Build conversation history for context
    const historyParts = recentHistory.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }],
    }))

    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [
        ...historyParts,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction: CHITCHAT_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 200,
        abortSignal: controller.signal,
      },
    })

    clearTimeout(timeout)

    const text = response.text?.trim()
    if (text) {
      return { type: "text", text }
    }
  } catch {
    // AI failed — fallback
  }

  return {
    type: "text",
    text: "สวัสดีจ้า! 🏠 น้องซีมะโด่งพร้อมช่วยเหลือเรื่องหอพักน้า พิมพ์มาเลยว่าอยากรู้อะไร~",
  }
}
