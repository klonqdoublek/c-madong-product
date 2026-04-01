/**
 * AI Settings — reads from app_settings DB table with in-memory cache.
 * Used by chatbot handlers, vision agent, and admin UI.
 */

import { createAdminClient } from "@/lib/supabase/admin"

// ─── Types ──────────────────────────────────────────────────────
export type TonePreset = "professional" | "friendly" | "casual"
export type ResponseLength = "brief" | "standard" | "detailed"

export interface AISettings {
  "ai.primary_model": string
  "ai.temperature": number
  "ai.response_length": ResponseLength
  "ai.vision_enabled": boolean
  "ai.vision_confidence": number
  "ai.tone_preset": TonePreset
  "ai.custom_instructions": string
  "ai.intent_threshold": number
  "ai.auto_escalate": boolean
  "ai.escalate_threshold": number
}

const DEFAULTS: AISettings = {
  "ai.primary_model": "gpt-4o-mini",
  "ai.temperature": 0.7,
  "ai.response_length": "standard",
  "ai.vision_enabled": true,
  "ai.vision_confidence": 0.7,
  "ai.tone_preset": "friendly",
  "ai.custom_instructions": "",
  "ai.intent_threshold": 0.7,
  "ai.auto_escalate": false,
  "ai.escalate_threshold": 0.5,
}

// ─── Cache ──────────────────────────────────────────────────────
let cache: AISettings | null = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function isCacheValid(): boolean {
  return cache !== null && Date.now() - cacheTime < CACHE_TTL
}

export function invalidateSettingsCache(): void {
  cache = null
  cacheTime = 0
}

// ─── Readers ────────────────────────────────────────────────────

/** Get all AI settings (cached 5 min) */
export async function getAISettings(): Promise<AISettings> {
  if (isCacheValid()) return cache!

  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (db as any)
      .from("app_settings")
      .select("key, value")
      .like("key", "ai.%")

    if (error) throw error

    const settings = { ...DEFAULTS }
    if (data) {
      for (const row of data) {
        const key = row.key as keyof AISettings
        if (key in settings) {
          // value is stored as JSONB — already parsed by PostgREST
          ;(settings as Record<string, unknown>)[key] = row.value as unknown
        }
      }
    }

    cache = settings
    cacheTime = Date.now()
    return settings
  } catch (error) {
    console.error("[AI Settings] Failed to load:", error)
    return { ...DEFAULTS }
  }
}

/** Get a single AI setting with typed default */
export async function getAISetting<K extends keyof AISettings>(
  key: K,
  fallback?: AISettings[K]
): Promise<AISettings[K]> {
  const settings = await getAISettings()
  return settings[key] ?? fallback ?? DEFAULTS[key]
}

// ─── Tone Presets ───────────────────────────────────────────────

const TONE_PROMPTS: Record<TonePreset, string> = {
  professional: `บุคลิก:
- สุภาพ เป็นทางการ ใช้ครับ/ค่ะ ลงท้ายเสมอ
- ตอบตรงประเด็น ชัดเจน กระชับ
- ไม่ใช้อีโมจิ ไม่ใช้ภาษาวัยรุ่น
- น้ำเสียงมืออาชีพ เหมือนเจ้าหน้าที่ให้บริการ`,

  friendly: `บุคลิก:
- เป็นเหมือน "รุ่นพี่ที่ช่วยเหลือดี" คอยดูแลน้องๆ ในหอ
- ใช้ภาษาไทย Gen-Z เป็นกันเอง แต่ยังสุภาพ
- ใช้คำลงท้าย นะ/จ้า/น้า (gender-neutral ไม่ใช้ ครับ/ค่ะ)
- ตอบสั้นกระชับ ไม่เยิ่นเย้อ (1-3 ประโยค)`,

  casual: `บุคลิก:
- สนิทมาก เหมือนเพื่อนสนิทในหอ
- ใช้ภาษาวัยรุ่น คำย่อ คำแสลงได้
- ใช้อีโมจิบ่อย 😄✨🔥
- ตอบสั้นมาก 1-2 ประโยค เน้นกระชับสุดๆ
- ใช้คำลงท้าย อ่ะ/เลย/ป่ะ/จ้ะ`,
}

/** Get the tone-specific system prompt section */
export function getTonePrompt(preset: TonePreset): string {
  return TONE_PROMPTS[preset] ?? TONE_PROMPTS.friendly
}

// ─── Response Length ────────────────────────────────────────────

export const RESPONSE_LENGTH_INSTRUCTIONS: Record<ResponseLength, string> = {
  brief: "ตอบสั้นมาก 1 ประโยค ไม่เกิน 50 คำ",
  standard: "ตอบกระชับ 1-3 ประโยค",
  detailed: "ตอบละเอียด อธิบายเพิ่มเติมได้ 3-5 ประโยค",
}
