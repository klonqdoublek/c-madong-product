import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: p } = await admin.from("profiles").select("role").eq("id", user.id).single();
  const roles = ["admin", "head", "super_admin", "admin_staff"];
  if (!p || !roles.includes(p.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: itemId } = await params;
  const body = await req.json();
  const userIds: string[] = body.userIds ?? [];

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "userIds required" }, { status: 400 });
  }

  const rows = userIds.map((uid) => ({
    user_id:           uid,
    source_type:       "item" as const,
    source_id:         itemId,
    completion_method: "admin_mark" as const,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("dorm_calendar_completions")
    .upsert(rows, { onConflict: "user_id,source_type,source_id", ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ marked: userIds.length });
}
