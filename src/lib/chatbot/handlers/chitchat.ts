import { getOpenAIClient } from "@/lib/ai/openai"
import { CHITCHAT_SYSTEM_PROMPT } from "../system-prompts"
import { AI_TIMEOUT_MS } from "../constants"
import type { HandlerResponse } from "../types"

/** Handle chitchat intent using OpenAI gpt-4o-mini with น้องซีมะโด่ง persona */
export async function handleChitchat(
  message: string,
  recentHistory: { role: string; content: string }[] = []
): Promise<HandlerResponse> {
  try {
    const openai = getOpenAIClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    // Build conversation history for context
    const historyMessages = recentHistory.slice(-6).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CHITCHAT_SYSTEM_PROMPT },
        ...historyMessages,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const text = response.choices[0]?.message?.content?.trim()
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
