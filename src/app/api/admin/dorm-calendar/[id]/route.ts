import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: p } = await admin.from("profiles").select("role").eq("id", user.id).single();
  const roles = ["admin", "head", "super_admin", "admin_staff"];
  if (!p || !roles.includes(p.role ?? "")) return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const update: Record<string, unknown> = {};
  if (body.titleTh !== undefined)       update.title_th         = body.titleTh;
  if (body.titleEn !== undefined)       update.title_en         = body.titleEn;
  if (body.descriptionTh !== undefined) update.description_th   = body.descriptionTh;
  if (body.descriptionEn !== undefined) update.description_en   = body.descriptionEn;
  if (body.startAt !== undefined)       update.start_at         = body.startAt;
  if (body.dueAt !== undefined)         update.due_at           = body.dueAt;
  if (body.audience !== undefined)      update.audience         = body.audience;
  if (body.isRequired !== undefined)    update.is_required      = body.isRequired;
  if (body.ctaType !== undefined)       update.cta_type         = body.ctaType;
  if (body.ctaUrl !== undefined)        update.cta_url          = body.ctaUrl;
  if (body.ctaEventId !== undefined)    update.cta_event_id     = body.ctaEventId;
  if (body.scorePoints !== undefined)   update.score_points     = body.scorePoints;
  if (body.penaltyPoints !== undefined) update.penalty_points   = body.penaltyPoints;
  if (body.archivedAt !== undefined)    update.archived_at      = body.archivedAt;

  const { data, error } = await db
    .from("dorm_calendar_items")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { error } = await db
    .from("dorm_calendar_items")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
