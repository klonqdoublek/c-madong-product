import { generateRAGAnswer } from "../rag/answer-generator"
import { AI_TIMEOUT_MS } from "../constants"
import type { HandlerResponse } from "../types"

/** Handle knowledge intent using RAG pipeline */
export async function handleKnowledge(
  message: string
): Promise<HandlerResponse> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS + 2000) // Extra time for RAG

    const answer = await Promise.race([
      generateRAGAnswer(message),
      new Promise<string>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("RAG timeout"))
        )
      }),
    ])

    clearTimeout(timeout)
    return { type: "text", text: answer }
  } catch {
    return {
      type: "text",
      text: "อุ๊ปส์! ซีมะโด่งหาคำตอบไม่ทันน้า 😅 ลองถามใหม่อีกทีหรือถามเจ้าหน้าที่หอพักโดยตรงนะ",
    }
  }
}
