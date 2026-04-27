import { getOpenAIClient, RAG_CHAT_MODEL } from "@/lib/ai/openai"
import { RAG_ANSWER_PROMPT } from "../system-prompts"
import { searchDocuments } from "./vector-search"
import { detectTopic } from "../fallback/topic-detector"
import { selectFallbackMessage, updateRotationState, resetFallbackCount } from "../fallback/messages"
import { getSmartSuggestions } from "../fallback/smart-suggestions"
import { buildAnnouncementResourceCarousel } from "../flex-builders/announcement-resource-card"
import type { QuickReplyItem } from "../types"

interface RAGAnswerResult {
  text: string
  quickReply?: { items: QuickReplyItem[] }
  announcementCarousel?: unknown // LINE flex payload for announcement resource cards
}

async function buildFallbackResult(question: string, lineUid: string): Promise<RAGAnswerResult> {
  const topic = detectTopic(question)
  const message = await selectFallbackMessage(lineUid, topic)
  const suggestions = getSmartSuggestions()
  await updateRotationState(lineUid, topic)

  return {
    text: message,
    quickReply: { items: suggestions }
  }
}

/**
 * RAG pipeline: embed query → vector search (documents + announcements) → answer.
 * Attaches announcement resource cards when relevant announcements found.
 */
export async function generateRAGAnswer(question: string, lineUid: string): Promise<RAGAnswerResult> {
  const results = await searchDocuments(question)

  if (results.length === 0) {
    return buildFallbackResult(question, lineUid)
  }

  // Build context — tag source type for LLM awareness
  const context = results
    .map((r, i) => {
      const sourceLabel = r.source_type === "announcement" ? "(ประกาศ)" : "(เอกสาร)"
      return `[${i + 1}] ${sourceLabel} ${r.document_title}: ${r.content}`
    })
    .join("\n\n")

  const prompt = RAG_ANSWER_PROMPT
    .replace("{context}", context)
    .replace("{question}", question)

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: RAG_CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 300,
  })

  const answer = completion.choices[0]?.message?.content?.trim()

  if (!answer || answer === '') {
    return buildFallbackResult(question, lineUid)
  }

  await resetFallbackCount(lineUid).catch(() => {})

  // Collect high-similarity announcement results for resource cards
  const announcementHits = results.filter(
    (r) => r.source_type === "announcement" && r.similarity >= 0.5
  )

  let announcementCarousel: unknown = undefined
  if (announcementHits.length > 0) {
    announcementCarousel = buildAnnouncementResourceCarousel(
      announcementHits.slice(0, 3).map((r) => ({
        id: r.source_id,
        title: r.document_title,
        cover_image: r.cover_image,
        event_date: (r.metadata?.event_date as string) ?? null,
        category: (r.metadata?.category as string) ?? null,
        summary: r.content.slice(0, 80),
      }))
    )
  }

  return { text: answer, announcementCarousel }
}
