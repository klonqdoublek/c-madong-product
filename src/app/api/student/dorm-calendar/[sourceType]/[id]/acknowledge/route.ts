import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sourceType: string; id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sourceType, id } = await params;

  if (!["item", "event", "announcement"].includes(sourceType)) {
    return NextResponse.json({ error: "Invalid sourceType" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Insert completion (upsert → idempotent)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("dorm_calendar_completions").upsert(
    {
      user_id: user.id,
      source_type: sourceType,
      source_id: id,
      completion_method: "manual_ack",
    },
    { onConflict: "user_id,source_type,source_id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("[Acknowledge] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
