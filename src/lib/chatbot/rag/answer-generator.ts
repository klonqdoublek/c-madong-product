import { getOpenAIClient, RAG_CHAT_MODEL } from "@/lib/ai/openai"
import { RAG_ANSWER_PROMPT } from "../system-prompts"
import { searchDocuments } from "./vector-search"

/**
 * RAG pipeline: embed query → vector search → GPT-4o-mini answer with context.
 */
export async function generateRAGAnswer(question: string): Promise<string> {
  const results = await searchDocuments(question)

  if (results.length === 0) {
    return "ขอโทษน้า ซีมะโด่งหาข้อมูลเรื่องนี้ไม่เจอเลย 😅 ลองถามเจ้าหน้าที่หอพักโดยตรงนะ"
  }

  const context = results
    .map((r, i) => `[${i + 1}] ${r.document_title}: ${r.content}`)
    .join("\n\n")

  const prompt = RAG_ANSWER_PROMPT
    .replace("{context}", context)
    .replace("{question}", question)

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: RAG_CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  })

  return completion.choices[0]?.message?.content?.trim()
    ?? "ซีมะโด่งตอบไม่ได้ตอนนี้น้า ลองถามใหม่อีกทีนะ"
}
