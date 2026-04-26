import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Cron D-0 23:59 BKT (16:59 UTC → schedule: "59 16 * * *")
// Auto-confirms current bed for any student who didn't select
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient() as any;

  // Find the active bed_selection calendar item that is now past due
  const { data: calItem } = await db
    .from("dorm_calendar_items")
    .select("id, due_at")
    .eq("category", "bed_selection")
    .is("archived_at", null)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!calItem) {
    return NextResponse.json({ skipped: true, reason: "No past-due bed_selection item found" });
  }

  // Get all students who haven't completed this item
  const { data: completions } = await db
    .from("dorm_calendar_completions")
    .select("user_id")
    .eq("source_type", "item")
    .eq("source_id", calItem.id);

  const doneUserIds = new Set((completions ?? []).map((c: any) => c.user_id));

  const { data: allStudents } = await db
    .from("profiles")
    .select("id, bed_id")
    .eq("role", "student")
    .not("bed_id", "is", null);

  const pending = (allStudents ?? []).filter((p: any) => !doneUserIds.has(p.id));

  if (pending.length === 0) {
    return NextResponse.json({ autoConfirmed: 0 });
  }

  const rows = pending.map((p: any) => ({
    user_id: p.id,
    source_type: "item",
    source_id: calItem.id,
    completion_method: "auto_confirm",
    completed_at: new Date().toISOString(),
  }));

  const { error } = await db
    .from("dorm_calendar_completions")
    .upsert(rows, { onConflict: "user_id,source_type,source_id", ignoreDuplicates: true });

  if (error) {
    console.error("[BedSelectionAutoConfirm]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ autoConfirmed: pending.length, itemId: calItem.id });
}
