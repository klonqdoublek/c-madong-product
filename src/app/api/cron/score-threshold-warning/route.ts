import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canPushNow, recordDispatch, hashPayload } from "@/lib/notifications/push-gate";
import { createNotification } from "@/lib/notifications/create";
import { pushFlexMessage } from "@/lib/line/client";
import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder";

export const maxDuration = 60;

const SCORE_THRESHOLD = 60; // Below 60% = at risk
const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app";

function buildScoreWarningFlex(score: number, maxScore: number): FlexMessagePayload {
  const pct = Math.round((score / maxScore) * 100);
  const bubble = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#FFF3CD",
      paddingAll: "12px",
      contents: [
        { type: "text", text: "⚠️ คะแนนหอพักต่ำกว่าเกณฑ์", size: "sm", weight: "bold", color: "#856404" },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "14px",
      contents: [
        {
          type: "text",
          text: `คะแนนของคุณ: ${score}/${maxScore} (${pct}%)`,
          size: "md",
          weight: "bold",
          color: "#1E1E1E",
        },
        {
          type: "text",
          text: "ต้องได้ 60% ขึ้นไปจึงจะต่อหอพักได้ กรุณาเพิ่มคะแนนก่อนสิ้นปีการศึกษา",
          size: "sm",
          color: "#565655",
          wrap: true,
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "10px",
      contents: [
        {
          type: "button",
          action: { type: "uri", label: "📊 ดูคะแนนและกิจกรรม →", uri: `${WEB_BASE}/th/score` },
          style: "primary",
          color: "#4A7060",
          height: "sm",
        },
      ],
    },
  };

  return {
    type: "flex",
    altText: `⚠️ คะแนนหอพักของคุณ ${pct}% — ต่ำกว่าเกณฑ์`,
    contents: bubble,
  };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = createAdminClient();

  // Get current academic year + semester
  const now = new Date();
  const { data: yearData } = await adminDb.rpc("compute_academic_year", {
    dt: now.toISOString(),
  });
  const academicYear = yearData as number | null;

  // Query all students with their composite score below threshold
  const { data: students, error } = await adminDb
    .from("profiles")
    .select("id, line_uid, push_enabled, display_name, full_name_th")
    .eq("role", "student")
    .eq("status", "active")
    .not("line_uid", "is", null);

  if (error) {
    console.error("[ScoreCron] Profile query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Week key for dedup (Monday-anchored)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekKey = weekStart.toISOString().split("T")[0];

  let pushed = 0;
  let skipped = 0;

  for (const student of students ?? []) {
    // Fetch composite score via RPC
    const { data: scoreData } = await adminDb.rpc("get_composite_score", {
      p_student_id: student.id,
      p_academic_year: academicYear ?? undefined,
    });

    const score = scoreData as { total_score?: number; max_score?: number } | null;
    const totalScore = score?.total_score ?? 0;
    const maxScore = score?.max_score ?? 100;

    if (maxScore === 0) { skipped++; continue; }

    const pct = (totalScore / maxScore) * 100;
    if (pct >= SCORE_THRESHOLD) { skipped++; continue; }

    const payloadHash = hashPayload(`score_warning:${student.id}:${weekKey}`);

    const gate = await canPushNow({
      userId: student.id,
      lineUid: student.line_uid,
      type: "score",
      payloadHash,
      bypassQuietHours: false,
    });

    if (!gate.ok) {
      console.log(`[ScoreCron] Skip ${student.id}: ${gate.reason}`);
      skipped++;
      continue;
    }

    try {
      await pushFlexMessage(student.line_uid!, buildScoreWarningFlex(totalScore, maxScore));
      await recordDispatch({ userId: student.id, type: "score", payloadHash });
      await createNotification({
        user_id: student.id,
        type: "score",
        title_th: "⚠️ คะแนนหอพักต่ำกว่าเกณฑ์",
        title_en: "Dorm score below threshold",
        body_th: `คะแนน ${totalScore}/${maxScore} — ต้อง 60% ขึ้นไป`,
        action_url: "/score",
        priority: 75,
        metadata: { score: totalScore, max_score: maxScore, week: weekKey },
      });
      pushed++;
    } catch (err) {
      console.error(`[ScoreCron] Push failed for student ${student.id}:`, err);
    }
  }

  console.log(`[ScoreCron] Done — pushed: ${pushed}, skipped: ${skipped}`);
  return NextResponse.json({ pushed, skipped });
}
