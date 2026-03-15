import { createAdminClient } from "@/lib/supabase/admin"
import { buildScoreSummaryFlex } from "@/lib/line/flex-builders/score-summary"
import type { HandlerResponse } from "../types"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

/** Handle score intent: query DB and return Flex summary or text */
export async function handleScore(lineUid: string): Promise<HandlerResponse> {
  if (IS_DEMO) {
    return {
      type: "text",
      text: "📊 ตอนนี้ยังไม่มีข้อมูลคะแนนน้า (ระบบ demo mode) ลองใหม่เมื่อเชื่อมต่อ Supabase แล้วนะ",
    }
  }

  const supabase = createAdminClient()

  // Look up student by line_uid in profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, student_id, display_name, full_name_th")
    .eq("line_uid", lineUid)
    .single()

  if (!profile) {
    return {
      type: "text",
      text: "ซีมะโด่งหาข้อมูลน้องไม่เจอน้า 😅 ลองลงทะเบียนในแอปก่อนนะ",
    }
  }

  const studentName = profile.display_name || profile.full_name_th || "น้อง"

  // Try to get composite score via RPC
  let compositeScore = 0
  if (profile.student_id) {
    const { data } = await supabase.rpc("get_composite_score", {
      p_student_id: profile.student_id,
    })
    if (data) {
      compositeScore = (data as unknown as { composite_score?: number })?.composite_score ?? 0
    }
  }

  // Format updated date in Thai
  const now = new Date()
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ]
  const thaiYear = now.getFullYear() + 543
  const updatedAt = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${thaiYear}`

  return {
    type: "flex",
    flex: buildScoreSummaryFlex({
      studentName,
      score: compositeScore,
      updatedAt,
    }),
  }
}
