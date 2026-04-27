import { generateRAGAnswer } from "../rag/answer-generator"
import { AI_TIMEOUT_MS } from "../constants"
import { detectTopic } from "../fallback/topic-detector"
import { selectFallbackMessage } from "../fallback/messages"
import { getSmartSuggestions } from "../fallback/smart-suggestions"
import { replyMessages } from "@/lib/line/client"
import type { HandlerResponse } from "../types"

/** Handle knowledge intent using RAG pipeline */
export async function handleKnowledge(
  message: string,
  lineUid: string,
  replyToken?: string
): Promise<HandlerResponse> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS + 2000)

    const result = await Promise.race([
      generateRAGAnswer(message, lineUid),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("RAG timeout"))
        )
      }),
    ])

    clearTimeout(timeout)

    // If announcements matched, send multi-message reply (text + flex carousel)
    if (result.announcementCarousel && replyToken) {
      try {
        await replyMessages(replyToken, [
          {
            type: "text",
            text: result.text,
            ...(result.quickReply ? { quickReply: result.quickReply } : {}),
          } as Record<string, unknown>,
          {
            type: "flex",
            altText: "ข้อมูลประกาศที่เกี่ยวข้อง",
            contents: result.announcementCarousel,
          } as Record<string, unknown>,
        ])
        // Return empty — already replied directly
        return { type: "text", text: "" }
      } catch (err) {
        console.warn("[knowledge] Multi-message reply failed, falling back to text:", err)
      }
    }

    return {
      type: "text",
      text: result.text,
      quickReply: result.quickReply
    }
  } catch {
    const topic = detectTopic(message)
    const fallbackMsg = await selectFallbackMessage(lineUid, topic, 'timeout')
    const suggestions = getSmartSuggestions()

    return {
      type: "text",
      text: fallbackMsg || "อุ๊ปส์! ซีมะโด่งหาคำตอบไม่ทันน้า ลองใหม่อีกทีนะ",
      quickReply: { items: suggestions }
    }
  }
}
