import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const adminRoles = ["admin", "head", "super_admin", "admin_staff"];
  if (!profile || !adminRoles.includes(profile.role ?? "")) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data, error } = await db
    .from("dorm_calendar_items")
    .select("*")
    .order("due_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((item: any) => ({
    id: item.id,
    sourceType: "item",
    sourceId: item.id,
    category: item.category,
    titleTh: item.title_th,
    titleEn: item.title_en,
    descriptionTh: item.description_th,
    descriptionEn: item.description_en,
    startAt: item.start_at,
    dueAt: item.due_at,
    semester: item.semester,
    academicYear: item.academic_year,
    audience: item.audience,
    isRequired: item.is_required,
    ctaType: item.cta_type,
    ctaUrl: item.cta_url,
    ctaEventId: item.cta_event_id,
    scorePoints: item.score_points,
    penaltyPoints: item.penalty_points,
    archivedAt: item.archived_at,
  }));

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data, error } = await db
    .from("dorm_calendar_items")
    .insert({
      category:          body.category,
      title_th:          body.titleTh,
      title_en:          body.titleEn ?? null,
      description_th:    body.descriptionTh ?? null,
      description_en:    body.descriptionEn ?? null,
      start_at:          body.startAt,
      due_at:            body.dueAt,
      audience:          body.audience ?? "นิสิตหอพักทุกคน",
      is_required:       body.isRequired ?? true,
      cta_type:          body.ctaType,
      cta_url:           body.ctaUrl ?? null,
      cta_event_id:      body.ctaEventId ?? null,
      score_points:      body.scorePoints ?? 0,
      penalty_points:    body.penaltyPoints ?? 0,
      score_category_id: body.scoreCategoryId ?? null,
      published_by:      user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
