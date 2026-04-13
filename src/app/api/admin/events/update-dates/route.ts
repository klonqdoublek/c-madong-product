import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("dorm_events")
    .update({
      event_date: "2026-05-15",
      start_datetime: "2026-05-01T00:00:00+07:00",
      end_datetime: "2026-05-31T23:59:59+07:00",
    })
    .eq("title_th", "ยื่นขออยู่หอต่อ ภาคเรียนที่ 2/2569")
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
