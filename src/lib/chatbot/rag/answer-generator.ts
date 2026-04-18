import { getOpenAIClient, RAG_CHAT_MODEL } from "@/lib/ai/openai"
import { RAG_ANSWER_PROMPT } from "../system-prompts"
import { searchDocuments } from "./vector-search"
import { detectTopic } from "../fallback/topic-detector"
import { selectFallbackMessage, updateRotationState, resetFallbackCount } from "../fallback/messages"
import { getSmartSuggestions } from "../fallback/smart-suggestions"
import type { QuickReplyItem } from "../types"

interface RAGAnswerResult {
  text: string
  quickReply?: { items: QuickReplyItem[] }
}

/**
 * Build fallback result — topic detection + rotating message + quick replies
 */
async function buildFallbackResult(question: string, lineUid: string): Promise<RAGAnswerResult> {
  const topic = detectTopic(question)
  const message = await selectFallbackMessage(lineUid, topic)
  const suggestions = getSmartSuggestions(topic)
  await updateRotationState(lineUid, topic)

  return {
    text: message,
    quickReply: { items: suggestions }
  }
}

/**
 * RAG pipeline: embed query → vector search → GPT-4o-mini answer with context.
 * Returns { text, quickReply? } with smart fallback on failure.
 */
export async function generateRAGAnswer(question: string, lineUid: string): Promise<RAGAnswerResult> {
  const results = await searchDocuments(question)

  if (results.length === 0) {
    return buildFallbackResult(question, lineUid)
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

  const answer = completion.choices[0]?.message?.content?.trim()

  if (!answer || answer === '') {
    return buildFallbackResult(question, lineUid)
  }

  // Success → reset fallback counter
  await resetFallbackCount(lineUid).catch(() => {})

  return { text: answer }
}
