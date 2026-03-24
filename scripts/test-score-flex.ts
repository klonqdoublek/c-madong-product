/**
 * Test script: Push both score Flex cards to ข้าวกล้อง via LINE
 * Usage: npx tsx scripts/test-score-flex.ts
 */
import { readFileSync } from "fs"
// Load .env.local manually (no dotenv dependency)
const envFile = readFileSync(".env.local", "utf-8")
for (const line of envFile.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  const val = trimmed.slice(eqIdx + 1)
  if (!process.env[key]) process.env[key] = val
}
import { createClient } from "@supabase/supabase-js"
import { pushFlexMessage } from "../src/lib/line/client"
import { buildScoreSummaryFlex, DEMO_SCORE_SUMMARY } from "../src/lib/line/flex-builders/score-summary"
import { buildScoreAddedFlex, DEMO_SCORE_ADDED } from "../src/lib/line/flex-builders/score-added"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceKey)

  // Find ข้าวกล้อง / พิชญา พูลเพียร
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, full_name_th, display_name, line_uid")
    .or("display_name.ilike.%ข้าวกล้อง%,full_name_th.ilike.%พิชญา%,full_name.ilike.%พิชญา%,display_name.ilike.%พิชญา%")
    .limit(5)

  if (error) {
    console.error("DB error:", error.message)
    process.exit(1)
  }

  console.log("Found profiles:", profiles)

  if (!profiles || profiles.length === 0) {
    console.error("No profile found for ข้าวกล้อง / พิชญา")
    process.exit(1)
  }

  const profile = profiles[0]
  const lineUid = profile.line_uid

  if (!lineUid) {
    console.error("Profile found but no line_uid:", profile)
    process.exit(1)
  }

  const name = profile.display_name || profile.full_name_th || profile.full_name || "ข้าวกล้อง"
  console.log(`\nPushing to: ${name} (${lineUid})`)

  // Card 1: Score Summary
  const summaryFlex = buildScoreSummaryFlex({
    ...DEMO_SCORE_SUMMARY,
    studentName: name,
  })
  console.log("\n--- Card 1: Score Summary ---")
  console.log(JSON.stringify(summaryFlex, null, 2).slice(0, 200) + "...")

  await pushFlexMessage(lineUid, summaryFlex)
  console.log("Score Summary pushed!")

  // Card 2: Score Added
  const addedFlex = buildScoreAddedFlex({
    ...DEMO_SCORE_ADDED,
    studentName: name,
  })
  console.log("\n--- Card 2: Score Added ---")
  console.log(JSON.stringify(addedFlex, null, 2).slice(0, 200) + "...")

  await pushFlexMessage(lineUid, addedFlex)
  console.log("Score Added pushed!")

  console.log("\nDone! Check LINE app.")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
