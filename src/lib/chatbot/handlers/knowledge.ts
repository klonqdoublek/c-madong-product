import { generateRAGAnswer } from "../rag/answer-generator"
import { AI_TIMEOUT_MS } from "../constants"
import { detectTopic } from "../fallback/topic-detector"
import { selectFallbackMessage } from "../fallback/messages"
import { generateSmartSuggestions } from "../fallback/smart-suggestions"
import type { HandlerResponse } from "../types"

/** Handle knowledge intent using RAG pipeline */
export async function handleKnowledge(
  message: string,
  lineUid: string
): Promise<HandlerResponse> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS + 2000) // Extra time for RAG

    const result = await Promise.race([
      generateRAGAnswer(message, lineUid),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("RAG timeout"))
        )
      }),
    ])

    clearTimeout(timeout)
    return {
      type: "text",
      text: result.text,
      quickReply: result.quickReply
    }
  } catch {
    // Timeout fallback with smart suggestions
    const topic = detectTopic(message)
    const fallbackMsg = await selectFallbackMessage(lineUid, topic, 'timeout')
    const suggestions = await generateSmartSuggestions(lineUid, topic, message)
      .catch(() => [])

    return {
      type: "text",
      text: fallbackMsg || "อุ๊ปส์! ซีมะโด่งหาคำตอบไม่ทันน้า ลองใหม่อีกทีนะ",
      quickReply: suggestions.length > 0 ? { items: suggestions } : undefined
    }
  }
}
