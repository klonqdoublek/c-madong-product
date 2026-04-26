import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status") ?? "pending";
  const semester = searchParams.get("semester");
  const category = searchParams.get("category");
  const search   = searchParams.get("search");
  const startStr = searchParams.get("start");
  const endStr   = searchParams.get("end");
  const limit    = parseInt(searchParams.get("limit") ?? "100");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // ── Fetch dorm_calendar_items ───────────────────────────
  let itemsQuery = db
    .from("dorm_calendar_items")
    .select("*")
    .is("archived_at", null)
    .order("due_at", { ascending: true })
    .limit(limit);

  if (semester) itemsQuery = itemsQuery.eq("semester", semester);
  if (category) itemsQuery = itemsQuery.eq("category", category);
  if (startStr)  itemsQuery = itemsQuery.gte("due_at", startStr);
  if (endStr)    itemsQuery = itemsQuery.lte("due_at", endStr);
  if (search)    itemsQuery = itemsQuery.or(`title_th.ilike.%${search}%,title_en.ilike.%${search}%`);

  // ── Fetch pinned events ────────────────────────────────
  let eventsQuery = db
    .from("dorm_events")
    .select("id, title_th, title_en, description_th, description_en, start_datetime, event_date, calendar_category, calendar_cta_type, calendar_cta_url, is_mandatory")
    .eq("is_calendar_pinned", true)
    .eq("event_status", "published")
    .order("event_date", { ascending: true })
    .limit(50);
  if (semester) eventsQuery = eventsQuery.eq("semester", semester);

  // ── Fetch pinned announcements ─────────────────────────
  const annoQuery = db
    .from("announcements")
    .select("id, title_th, title_en, content_th, content_en, created_at, published_at")
    .eq("is_calendar_pinned", true)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(20);

  // ── Fetch user completions ─────────────────────────────
  const completionsQuery = db
    .from("dorm_calendar_completions")
    .select("source_type, source_id, completed_at, completion_method")
    .eq("user_id", user.id);

  const [
    { data: items, error: itemsErr },
    { data: events },
    { data: annos },
    { data: completions },
  ] = await Promise.all([itemsQuery, eventsQuery, annoQuery, completionsQuery]);

  if (itemsErr) {
    console.error("[DormCalendar] items error:", itemsErr);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // Build completion lookup map
  const doneMap = new Map<string, { at: string; method: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (completions ?? []).forEach((c: any) => {
    doneMap.set(`${c.source_type}:${c.source_id}`, { at: c.completed_at, method: c.completion_method });
  });

  // Normalize items
  const normalized: ReturnType<typeof buildItem>[] = [];

  (items ?? []).forEach((item: any) => {
    const done = doneMap.get(`item:${item.id}`);
    normalized.push(buildItem({
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
      completedAt: done?.at ?? null,
      completionMethod: (done?.method ?? null) as any,
    }));
  });

  // Pinned events
  (events ?? []).forEach((ev: any) => {
    const done = doneMap.get(`event:${ev.id}`);
    const dueAt = ev.event_date ?? ev.start_datetime;
    normalized.push(buildItem({
      id: ev.id,
      sourceType: "event",
      sourceId: ev.id,
      category: ev.calendar_category ?? "dorm_meeting",
      titleTh: ev.title_th ?? ev.title,
      titleEn: ev.title_en,
      descriptionTh: ev.description_th,
      descriptionEn: ev.description_en,
      startAt: dueAt,
      dueAt,
      semester: null,
      academicYear: null,
      audience: "นิสิตหอพักทุกคน",
      isRequired: ev.is_mandatory ?? false,
      ctaType: ev.calendar_cta_type ?? "read_more",
      ctaUrl: ev.calendar_cta_url,
      ctaEventId: ev.id,
      scorePoints: 0,
      penaltyPoints: 0,
      completedAt: done?.at ?? null,
      completionMethod: (done?.method ?? null) as any,
    }));
  });

  // Pinned announcements
  (annos ?? []).forEach((an: any) => {
    const done = doneMap.get(`announcement:${an.id}`);
    normalized.push(buildItem({
      id: an.id,
      sourceType: "announcement",
      sourceId: an.id,
      category: "important_announcement",
      titleTh: an.title_th,
      titleEn: an.title_en,
      descriptionTh: an.content_th,
      descriptionEn: an.content_en,
      startAt: an.published_at ?? an.created_at,
      dueAt: an.published_at ?? an.created_at,
      semester: null,
      academicYear: null,
      audience: "นิสิตหอพักทุกคน",
      isRequired: false,
      ctaType: "read_more",
      ctaUrl: null,
      ctaEventId: null,
      scorePoints: 0,
      penaltyPoints: 0,
      completedAt: done?.at ?? null,
      completionMethod: (done?.method ?? null) as any,
    }));
  });

  // Sort by dueAt
  normalized.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  // Filter by status
  const now = new Date();
  const result = normalized.filter((item) => {
    if (status === "pending") return !item.completedAt;
    if (status === "done") return !!item.completedAt;
    return true;
  });

  return NextResponse.json(result);
}

function buildItem(data: {
  id: string;
  sourceType: "item" | "event" | "announcement";
  sourceId: string;
  category: string;
  titleTh: string;
  titleEn?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  startAt: string;
  dueAt: string;
  semester: string | null;
  academicYear: number | null;
  audience: string;
  isRequired: boolean;
  ctaType: string;
  ctaUrl?: string | null;
  ctaEventId?: string | null;
  scorePoints: number;
  penaltyPoints: number;
  completedAt: string | null;
  completionMethod: string | null;
}) {
  return {
    id: data.id,
    sourceType: data.sourceType,
    sourceId: data.sourceId,
    category: data.category,
    titleTh: data.titleTh,
    titleEn: data.titleEn,
    descriptionTh: data.descriptionTh,
    descriptionEn: data.descriptionEn,
    startAt: data.startAt,
    dueAt: data.dueAt,
    semester: data.semester,
    academicYear: data.academicYear,
    audience: data.audience,
    isRequired: data.isRequired,
    ctaType: data.ctaType,
    ctaUrl: data.ctaUrl,
    ctaEventId: data.ctaEventId,
    scorePoints: data.scorePoints,
    penaltyPoints: data.penaltyPoints,
    completedAt: data.completedAt,
    completionMethod: data.completionMethod,
  };
}
