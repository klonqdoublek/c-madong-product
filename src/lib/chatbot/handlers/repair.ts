import { getOpenAIClient } from "@/lib/ai/openai"
import { createAdminClient } from "@/lib/supabase/admin"
import { REPAIR_DETECTION_PROMPT } from "../system-prompts"
import { detectRepairCategory, AI_TIMEOUT_MS, CATEGORY_NAMES_TH } from "../constants"
import { updateSessionState } from "../session-manager"
import { buildRepairConfirmFlex, type RepairConfirmContext } from "../flex-builders/repair-confirm"
import type { HandlerResponse, RepairDetection } from "../types"
import { repairOrchestrator } from "@/lib/ai/orchestrator"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL
const ENABLE_VISION_ANALYSIS = process.env.ENABLE_VISION_ANALYSIS === "true"

/** Handle repair intent: detect category/urgency, show confirmation Flex */
export async function handleRepair(
  message: string,
  lineUid: string
): Promise<HandlerResponse> {
  // Preserve photos from session if user was collecting photos
  const { getOrCreateSession } = await import("../session-manager")
  const session = await getOrCreateSession(lineUid)
  const photos = (session.state_data?.photos as string[]) ?? []

  // Use orchestrator for vision analysis if enabled and photos exist
  if (ENABLE_VISION_ANALYSIS && photos.length > 0) {
    try {
      // Get user ID from line_uid
      const supabase = createAdminClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("line_uid", lineUid)
        .single()

      if (profile) {
        const result = await repairOrchestrator.handleRepairRequest(
          profile.id,
          message,
          photos
        )

        console.log(
          `[Repair] Vision analysis: ${result.provider}, confidence: ${result.detection.ai_confidence}`
        )

        // Save detection to session with vision metadata
        await updateSessionState(lineUid, "repair_confirming", {
          detection: result.detection,
          originalMessage: message,
          photos,
          provider: result.provider,
          template_id: result.template_id,
        })

        return {
          type: "flex",
          flex: buildRepairConfirmFlex(
            result.detection,
            {
              reporterName: result.reporterContext.name,
              roomInfo: `${result.reporterContext.building} ห้อง ${result.reporterContext.room}`,
            },
            photos.length
          ),
        }
      }
    } catch (error) {
      console.error("[Repair] Vision analysis failed, falling back to text-only:", error)
      // Fall through to text-only detection
    }
  }

  // Text-only detection (no vision analysis)
  const detection = await detectRepairDetails(message)

  // Fetch reporter profile for the Flex card context
  const context = await getReporterContext(lineUid)

  // Save detection to session for postback confirmation (preserve photos)
  await updateSessionState(lineUid, "repair_confirming", {
    detection,
    originalMessage: message,
    photos,
  })

  return {
    type: "flex",
    flex: buildRepairConfirmFlex(detection, context, photos.length),
  }
}

/** Create a maintenance request ticket in DB */
export async function createRepairTicket(
  lineUid: string,
  detection: RepairDetection,
  photos: string[] = [],
  metadata?: {
    provider?: string
    template_id?: string
    ai_confidence?: number
  }
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

  const insertData = {
    requester_id: profile.id,
    category: detection.category,
    title: detection.title,
    description: detection.description,
    photos,
    status: "pending" as const,
    ai_category: detection.category,
    ai_priority: detection.urgency,
    ai_confidence: (metadata?.ai_confidence ?? detection.ai_confidence) || undefined,
    ai_provider: (metadata?.provider as "template" | "gemini" | "openai" | "text-only" | "keyword" | "fallback") || undefined,
    template_id: metadata?.template_id || undefined,
    damage_details: detection.damage_details || undefined,
  }

  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert(insertData)
    .select("id")
    .single()

  if (error) {
    console.error("[Repair] Failed to create ticket:", error.message, error.details, error.hint)
    return null
  }

  return data
}

/** Fetch reporter profile + room info for the Flex card */
export async function getReporterContext(lineUid: string): Promise<RepairConfirmContext> {
  const fallback: RepairConfirmContext = {
    reporterName: "ผู้แจ้ง",
    roomInfo: "-",
  }

  if (IS_DEMO) return { ...fallback, reporterName: "ข้าวกล้อง :)" }

  try {
    const supabase = createAdminClient()

    // First get profile with direct columns
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name_th, display_name, building_id, room_id, bed_id")
      .eq("line_uid", lineUid)
      .single()

    if (profileError) {
      console.error("[Repair] getReporterContext profile error:", profileError)
      return fallback
    }
    if (!profile) return fallback

    const name = profile.display_name || profile.full_name_th || "ผู้แจ้ง"

    // Fetch building, room, bed separately to avoid join issues
    let buildingName: string | null = null
    let roomNumber: string | null = null
    let bedLabel: string | null = null

    if (profile.building_id) {
      const { data: b } = await supabase
        .from("buildings")
        .select("name_th")
        .eq("id", profile.building_id)
        .single()
      buildingName = b?.name_th ?? null
    }

    if (profile.room_id) {
      const { data: r } = await supabase
        .from("rooms")
        .select("room_number")
        .eq("id", profile.room_id)
        .single()
      roomNumber = r?.room_number ?? null
    }

    if (profile.bed_id) {
      const { data: bd } = await supabase
        .from("beds")
        .select("bed_label")
        .eq("id", profile.bed_id)
        .single()
      bedLabel = bd?.bed_label ?? null
    }

    const roomParts = [
      buildingName,
      roomNumber ? `ห้อง ${roomNumber}` : null,
      bedLabel ? `เตียง ${bedLabel}` : null,
    ].filter(Boolean)

    console.log("[Repair] Reporter context:", { name, roomParts, buildingId: profile.building_id, roomId: profile.room_id })

    return {
      reporterName: name,
      roomInfo: roomParts.length > 0 ? roomParts.join(" ") : "-",
    }
  } catch (err) {
    console.error("[Repair] getReporterContext error:", err)
    return fallback
  }
}

/** Detect repair details using OpenAI gpt-4o-mini, with keyword fallback */
export async function detectRepairDetails(message: string): Promise<RepairDetection> {
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
        description: message,
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
