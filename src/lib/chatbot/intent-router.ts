import { getOpenAIClient } from "@/lib/ai/openai"
import { INTENT_CLASSIFICATION_PROMPT } from "./system-prompts"
import { isRepairRelated } from "./constants"
import { AI_TIMEOUT_MS } from "./constants"
import type { ChatIntent, IntentResult } from "./types"
import { getAISetting } from "@/lib/ai/settings"

/**
 * Classify user message intent using OpenAI gpt-4o-mini.
 * Falls back to keyword detection if AI fails or times out.
 */
export async function classifyIntent(message: string): Promise<IntentResult> {
  // AI classification is primary — keywords are fallback only
  try {
    const openai = getOpenAIClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INTENT_CLASSIFICATION_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.1,
      max_tokens: 150,
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const text = response.choices[0]?.message?.content?.trim() ?? ""
    const parsed = parseIntentJson(text)
    if (parsed) return parsed
  } catch {
    // AI failed — fall through to keyword detection
  }

  // Keyword fallback: only when AI fails/times out, with lower confidence
  if (isRepairRelated(message)) {
    return { intent: "repair", confidence: 0.7 }
  }

  return { intent: "chitchat", confidence: 0.5 }
}

function parseIntentJson(text: string): IntentResult | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim()
    const data = JSON.parse(cleaned)
    const validIntents: ChatIntent[] = [
      "repair", "knowledge", "score", "events", "parcel", "chitchat",
    ]
    if (validIntents.includes(data.intent)) {
      return {
        intent: data.intent,
        confidence: typeof data.confidence === "number" ? data.confidence : 0.7,
        extractedInfo: data.extractedInfo,
      }
    }
  } catch {
    // Invalid JSON
  }
  return null
}
