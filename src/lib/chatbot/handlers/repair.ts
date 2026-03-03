import { getOpenAIClient } from "@/lib/ai/openai"
import { createAdminClient } from "@/lib/supabase/admin"
import { REPAIR_DETECTION_PROMPT } from "../system-prompts"
import { detectRepairCategory, AI_TIMEOUT_MS, CATEGORY_NAMES_TH } from "../constants"
import { updateSessionState } from "../session-manager"
import { buildRepairConfirmFlex } from "../flex-builders/repair-confirm"
import type { HandlerResponse, RepairDetection } from "../types"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

/** Handle repair intent: detect category/urgency, show confirmation Flex */
export async function handleRepair(
  message: string,
  lineUid: string
): Promise<HandlerResponse> {
  // Preserve photos from session if user was collecting photos
  const { getOrCreateSession } = await import("../session-manager")
  const session = await getOrCreateSession(lineUid)
  const photos = (session.state_data?.photos as string[]) ?? []

  const detection = await detectRepairDetails(message)

  // Save detection to session for postback confirmation (preserve photos)
  await updateSessionState(lineUid, "repair_confirming", {
    detection,
    originalMessage: message,
    photos,
  })

  return {
    type: "flex",
    flex: buildRepairConfirmFlex(detection, photos.length),
  }
}

/** Create a maintenance request ticket in DB */
export async function createRepairTicket(
  lineUid: string,
  detection: RepairDetection,
  photos: string[] = []
): Promise<{ id: string } | null> {
  if (IS_DEMO) {
    return { id: "demo-ticket-" + Date.now() }
  }

  const supabase = createAdminClient()

  // Look up user profile by line_uid (profiles.id = auth.users.id = requester_id FK)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("line_uid", lineUid)
    .single()

  if (!profile) return null

  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      requester_id: profile.id,
      category: detection.category,
      title: detection.title,
      description: detection.description,
      photos,
      status: "pending",
      ai_category: detection.category,
      ai_priority: detection.urgency,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[Repair] Failed to create ticket:", error)
    return null
  }

  return data
}

/** Detect repair details using OpenAI gpt-4o-mini, with keyword fallback */
async function detectRepairDetails(message: string): Promise<RepairDetection> {
  try {
    const openai = getOpenAIClient()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REPAIR_DETECTION_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const text = response.choices[0]?.message?.content?.trim() ?? ""
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim()
    const data = JSON.parse(cleaned)

    if (data.category && data.title) {
      return {
        category: data.category,
        title: data.title,
        description: data.description ?? message,
        urgency: data.urgency ?? "medium",
      }
    }
  } catch {
    // AI failed — use keyword fallback
  }

  // Keyword fallback
  const keywordResult = detectRepairCategory(message)
  const category = keywordResult?.category ?? "other"
  const categoryName = CATEGORY_NAMES_TH[category] ?? "อื่นๆ"

  return {
    category,
    title: `ปัญหา${categoryName}`,
    description: message,
    urgency: "medium",
  }
}
