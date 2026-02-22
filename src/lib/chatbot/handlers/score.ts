import { createAdminClient } from "@/lib/supabase/admin"
import { buildScoreSummaryFlex } from "../flex-builders/score-summary"
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

  // Look up student by line_user_id
  const { data: student } = await supabase
    .from("students")
    .select("student_id, display_name")
    .eq("line_user_id", lineUid)
    .single()

  if (!student) {
    return {
      type: "text",
      text: "ซีมะโด่งหาข้อมูลน้องไม่เจอน้า 😅 ลองลงทะเบียนในแอปก่อนนะ",
    }
  }

  // Query score entries grouped by category
  // Cast needed: Relationships not defined in manual types, relational join can't be inferred
  const { data: scores } = (await supabase
    .from("score_entries")
    .select("category:score_categories(name), points")
    .eq("student_id", student.student_id)) as unknown as {
    data: { category: { name: string } | null; points: number }[] | null
  }

  if (!scores || scores.length === 0) {
    return {
      type: "text",
      text: `📊 ${student.display_name ?? "น้อง"} ยังไม่มีคะแนนในระบบจ้า ค่อยๆ สะสมกันนะ 💪`,
    }
  }

  // Aggregate scores by category
  const categoryMap = new Map<string, { score: number; maxScore: number }>()
  for (const entry of scores) {
    const catName = entry.category?.name ?? "อื่นๆ"
    const existing = categoryMap.get(catName) ?? { score: 0, maxScore: 100 }
    existing.score += entry.points
    categoryMap.set(catName, existing)
  }

  const categories = Array.from(categoryMap.entries()).map(
    ([name, { score, maxScore }]) => ({ name, score, maxScore })
  )
  const totalScore = categories.reduce((sum, c) => sum + c.score, 0)
  const maxTotal = categories.reduce((sum, c) => sum + c.maxScore, 0)

  return {
    type: "flex",
    flex: buildScoreSummaryFlex({
      studentName: student.display_name ?? "น้อง",
      totalScore,
      maxTotal,
      categories,
    }),
  }
}
