/**
 * API Route for AI Settings Live Preview
 * POST /api/admin/settings/preview — Send test message with draft settings, get AI reply
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOpenAIClient } from "@/lib/ai/openai"
import {
  getTonePrompt,
  RESPONSE_LENGTH_INSTRUCTIONS,
  type TonePreset,
  type ResponseLength,
} from "@/lib/ai/settings"

const ADMIN_ROLES = ["admin", "super_admin", "head"]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      message,
      temperature = 0.7,
      tone_preset = "friendly",
      custom_instructions = "",
      response_length = "standard",
      model = "gpt-4o-mini",
    } = body as {
      message: string
      temperature?: number
      tone_preset?: TonePreset
      custom_instructions?: string
      response_length?: ResponseLength
      model?: string
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      )
    }

    const tonePrompt = getTonePrompt(tone_preset)
    const lengthInstruction =
      RESPONSE_LENGTH_INSTRUCTIONS[response_length] ??
      RESPONSE_LENGTH_INSTRUCTIONS.standard

    const systemPrompt = `คุณคือ "น้องซีมะโด่ง" แชทบอทประจำหอพัก จุฬาลงกรณ์มหาวิทยาลัย

${tonePrompt}

ความยาวคำตอบ: ${lengthInstruction}

สิ่งที่ทำได้:
- แจ้งซ่อมห้องพัก
- ตอบคำถามเกี่ยวกับหอพัก
- เช็คคะแนนหอ
- ดูกิจกรรมหอพัก
- เช็คพัสดุ
- คุยเล่นทั่วไป

ตอบเป็นข้อความสั้นๆ ภาษาไทย ไม่ใช้ markdown${
      custom_instructions
        ? `\n\nคำสั่งเพิ่มเติม:\n${custom_instructions}`
        : ""
    }`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature,
      max_tokens: 300,
    })

    const reply = response.choices[0]?.message?.content?.trim() ?? ""

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("[AI Preview] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    )
  }
}
