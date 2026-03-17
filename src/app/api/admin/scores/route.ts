/**
 * POST /api/admin/scores
 * Insert score entry + send LINE push notification to student.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildScoreAddedFlex } from "@/lib/line/flex-builders/score-added";
import { pushFlexMessage } from "@/lib/line/client";
import { formatThaiDate } from "@/lib/utils/date";
import { notifyScoreAdded } from "@/lib/notifications/triggers";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, category_id, points, reason, source, description_th } =
      body;

    if (!student_id || !category_id || points === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Insert score entry
    const { data: entry, error: insertError } = await adminDb
      .from("score_entries")
      .insert({
        student_id,
        category_id,
        points,
        reason: reason || null,
        source: source || "manual_admin",
        description_th: description_th || null,
        awarded_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Refresh materialized view so get_composite_score returns updated data
    await adminDb.rpc("refresh_score_summary");

    // Fetch student profile + category name for LINE notification
    const [profileRes, categoryRes] = await Promise.all([
      adminDb
        .from("profiles")
        .select("full_name_th, line_uid")
        .eq("student_id", student_id)
        .single(),
      adminDb
        .from("score_categories")
        .select("name_th, name")
        .eq("id", category_id)
        .single(),
    ]);

    const profile = profileRes.data;
    const category = categoryRes.data;
    const lineUid = profile?.line_uid;

    // Send LINE Flex push (non-blocking — don't fail if LINE push fails)
    if (lineUid) {
      try {
        const flexPayload = buildScoreAddedFlex({
          studentName:
            profile?.full_name_th || student_id,
          activityName:
            description_th || reason || category?.name_th || category?.name || "คะแนนหอพัก",
          pointsChange: points,
          updatedAt: formatThaiDate(new Date()),
        });

        await pushFlexMessage(lineUid, flexPayload);
      } catch (lineError) {
        console.error("LINE push failed (non-blocking):", lineError);
      }
    }

    // Create in-app notification (non-blocking)
    notifyScoreAdded({
      studentUserId: student_id,
      lineUid: null, // LINE push already handled above via Flex
      points,
      categoryName: category?.name_th || category?.name || "คะแนนหอพัก",
      reason: description_th || reason || undefined,
    }).catch((err) => console.error("Notification failed:", err));

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error adding score entry:", error);
    return NextResponse.json(
      { error: "Failed to add score entry" },
      { status: 500 }
    );
  }
}
