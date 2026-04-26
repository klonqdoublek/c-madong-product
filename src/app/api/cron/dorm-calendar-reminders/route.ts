import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotificationBatch } from "@/lib/notifications/create";
import { calculatePriority } from "@/lib/notifications/priority";

export const maxDuration = 30;

const REMINDER_WINDOWS = [
  { daysAhead: 7, labelTh: "อีก 7 วัน",  titleTh: "เตือนล่วงหน้า 7 วัน" },
  { daysAhead: 3, labelTh: "อีก 3 วัน",  titleTh: "เตือนล่วงหน้า 3 วัน" },
  { daysAhead: 1, labelTh: "พรุ่งนี้!",   titleTh: "เตือนด่วน: วันสุดท้ายพรุ่งนี้" },
  { daysAhead: 0, labelTh: "วันนี้!",     titleTh: "ต้องทำวันนี้" },
];

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const now = new Date();
  let totalSent = 0;

  for (const window of REMINDER_WINDOWS) {
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() + window.daysAhead);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(23, 59, 59, 999);

    const { data: rawItems } = await db
      .from("dorm_calendar_items")
      .select("id, title_th, due_at, is_required")
      .is("archived_at", null)
      .gte("due_at", windowStart.toISOString())
      .lte("due_at", windowEnd.toISOString())
      .eq("is_required", true);

    const items: Array<{ id: string; title_th: string; due_at: string; is_required: boolean }> =
      rawItems ?? [];

    if (items.length === 0) continue;

    for (const item of items) {
      const { data: allStudents } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "student");

      const { data: rawCompletions } = await db
        .from("dorm_calendar_completions")
        .select("user_id")
        .eq("source_type", "item")
        .eq("source_id", item.id);

      const completions: Array<{ user_id: string }> = rawCompletions ?? [];
      const doneSet = new Set(completions.map((c) => c.user_id));
      const pending = (allStudents ?? []).filter((s) => !doneSet.has(s.id));

      if (pending.length === 0) continue;

      const notifications = pending.map((s) => ({
        user_id:    s.id,
        type:       "event_reminder" as const,
        title_th:   `${window.titleTh}: ${item.title_th}`,
        title_en:   `Reminder: ${item.title_th}`,
        body_th:    `${item.title_th} — ${window.labelTh}`,
        body_en:    `${item.title_th} — ${window.labelTh}`,
        action_url: "/dorm-calendar",
        priority:   calculatePriority("event_reminder"),
        metadata:   { calendarItemId: item.id, daysAhead: window.daysAhead } as Record<string, unknown>,
      }));

      await createNotificationBatch(notifications);
      totalSent += pending.length;
    }
  }

  return NextResponse.json({ sent: totalSent });
}
