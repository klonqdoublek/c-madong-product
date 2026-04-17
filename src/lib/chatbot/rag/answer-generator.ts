import { getOpenAIClient, RAG_CHAT_MODEL } from "@/lib/ai/openai"
import { RAG_ANSWER_PROMPT } from "../system-prompts"
import { searchDocuments } from "./vector-search"
import { detectTopic } from "../fallback/topic-detector"
import { selectFallbackMessage, updateRotationState, resetFallbackCount, getFallbackState } from "../fallback/messages"
import { generateSmartSuggestions } from "../fallback/smart-suggestions"
import type { QuickReplyItem } from "../types"

interface RAGAnswerResult {
  text: string
  quickReply?: { items: QuickReplyItem[] }
}

/**
 * Simple hash function for feature flag rollout
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

/**
 * RAG pipeline: embed query → vector search → GPT-4o-mini answer with context.
 * Returns { text, quickReply? } for smart fallback support.
 */
export async function generateRAGAnswer(question: string, lineUid: string): Promise<RAGAnswerResult> {
  const results = await searchDocuments(question)

  // Feature flag check for smart fallback
  const isSmartFallbackEnabled = process.env.ENABLE_SMART_FALLBACK === 'true'
  const rolloutPercentage = parseInt(process.env.SMART_FALLBACK_ROLLOUT_PERCENTAGE || '0')
  const userBucket = Math.abs(hashCode(lineUid)) % 100
  const isInRollout = userBucket < rolloutPercentage

  if (results.length === 0) {
    if (isSmartFallbackEnabled && isInRollout) {
      // NEW: Smart fallback path
      const topic = detectTopic(question)
      const state = await getFallbackState(lineUid)
      const message = await selectFallbackMessage(lineUid, topic)
      const suggestions = await generateSmartSuggestions(lineUid, topic, question, state.count)
        .catch(() => [])
      await updateRotationState(lineUid, topic)

      return {
        text: message,
        quickReply: suggestions.length > 0 ? { items: suggestions } : undefined
      }
    } else {
      // OLD: Existing fallback path
      return {
        text: "ขอโทษน้า ซีมะโด่งหาข้อมูลเรื่องนี้ไม่เจอเลย 😅 ลองถามเจ้าหน้าที่หอพักโดยตรงนะ"
      }
    }
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

  // Check if GPT returned null/empty
  if (!answer || answer === '') {
    if (isSmartFallbackEnabled && isInRollout) {
      // Smart fallback for empty GPT response
      const topic = detectTopic(question)
      const state = await getFallbackState(lineUid)
      const message = await selectFallbackMessage(lineUid, topic)
      const suggestions = await generateSmartSuggestions(lineUid, topic, question, state.count)
        .catch(() => [])
      await updateRotationState(lineUid, topic)

      return {
        text: message,
        quickReply: suggestions.length > 0 ? { items: suggestions } : undefined
      }
    } else {
      return {
        text: "ซีมะโด่งตอบไม่ได้ตอนนี้น้า ลองถามใหม่อีกทีนะ"
      }
    }
  }

  // Success → reset fallback counter
  await resetFallbackCount(lineUid).catch(() => {})

  return { text: answer }
}
