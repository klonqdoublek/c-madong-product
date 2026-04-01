import { getOpenAIClient } from "@/lib/ai/openai"
import { CHITCHAT_SYSTEM_PROMPT, buildProfileAwareChitchatPrompt } from "../system-prompts"
import { AI_TIMEOUT_MS } from "../constants"
import type { HandlerResponse } from "../types"

interface ChitchatOptions {
  profileContext?: {
    name?: string
    building?: string
    room?: string
    summary?: string | null
  }
  /** Override the system prompt (e.g. with dynamic AI settings) */
  systemPromptOverride?: string
  /** Override temperature (from AI settings) */
  temperature?: number
  /** Override model (from AI settings) */
  model?: string
}

/** Handle chitchat intent using OpenAI with น้องซีมะโด่ง persona */
export async function handleChitchat(
  message: string,
  recentHistory: { role: string; content: string }[] = [],
  options?: ChitchatOptions
): Promise<HandlerResponse> {
  try {
    const openai = getOpenAIClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    // Use override prompt if provided, otherwise fallback to existing logic
    const systemPrompt = options?.systemPromptOverride
      ? options.systemPromptOverride
      : options?.profileContext
        ? buildProfileAwareChitchatPrompt(options.profileContext)
        : CHITCHAT_SYSTEM_PROMPT

    // Build conversation history for context (increased to 10 messages)
    const historyMessages = recentHistory.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    const response = await openai.chat.completions.create({
      model: options?.model ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message },
      ],
      temperature: options?.temperature ?? 0.7,
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
