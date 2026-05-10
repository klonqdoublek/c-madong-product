import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_TYPE_LABELS: Record<string, string> = {
  mandatory: "กิจกรรมบังคับ",
  optional: "กิจกรรมเลือก",
  community: "บริการชุมชน",
  meeting: "ประชุม",
  evaluation: "แบบประเมิน",
  other: "อื่นๆ",
};

const INTENT_LABELS: Record<string, string> = {
  repair: "แจ้งซ่อม",
  score: "คะแนนหอ",
  parcel: "พัสดุ",
  events: "กิจกรรม",
  billing: "ค่าหอพัก",
  knowledge: "สอบถามข้อมูล",
  chitchat: "สนทนาทั่วไป",
  greeting: "ทักทาย",
  unknown: "อื่นๆ",
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") ?? new Date().toISOString();

    const adminDb = createAdminClient();

    const [
      readsRes,
      announcementsRes,
      attendanceRes,
      eventsRes,
      chatRes,
      parcelsRes,
      studentsRes,
      calendarCompletionsRes,
      calendarItemsRes,
    ] = await Promise.all([
      adminDb
        .from("announcement_reads")
        .select("announcement_id, user_id, read_at")
        .gte("read_at", from)
        .lte("read_at", to),
      adminDb
        .from("announcements")
        .select("id, title_th, title_en, sent_at")
        .gte("sent_at", from)
        .lte("sent_at", to)
        .eq("status", "sent"),
      adminDb
        .from("event_attendance")
        .select("event_id, student_id, status")
        .gte("created_at", from)
        .lte("created_at", to),
      adminDb
        .from("dorm_events")
        .select("id, title_th, title_en, event_type"),
      adminDb
        .from("ai_chat_messages")
        .select("intent")
        .eq("role", "user")
        .not("intent", "is", null)
        .gte("created_at", from)
        .lte("created_at", to),
      adminDb
        .from("parcels")
        .select("id, status")
        .gte("created_at", from)
        .lte("created_at", to),
      adminDb
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      adminDb
        .from("dorm_calendar_completions")
        .select("id")
        .gte("created_at", from)
        .lte("created_at", to),
      adminDb
        .from("dorm_calendar_items")
        .select("id", { count: "exact", head: true }),
    ]);

    const reads = readsRes.data ?? [];
    const announcements = announcementsRes.data ?? [];
    const attendance = attendanceRes.data ?? [];
    const events = eventsRes.data ?? [];
    const chatMessages = chatRes.data ?? [];
    const parcels = parcelsRes.data ?? [];
    const totalStudents = studentsRes.count ?? 0;
    const calendarCompletions = calendarCompletionsRes.data ?? [];
    const totalCalendarItems = calendarItemsRes.count ?? 0;

    // KPIs
    // Avg read rate per announcement
    const annIds = new Set(announcements.map((a) => a.id));
    const readsForPeriod = reads.filter((r) => annIds.has(r.announcement_id));
    const readsByAnn: Record<string, Set<string>> = {};
    for (const r of readsForPeriod) {
      if (!readsByAnn[r.announcement_id]) readsByAnn[r.announcement_id] = new Set();
      readsByAnn[r.announcement_id].add(r.user_id);
    }
    const avgReadRate =
      announcements.length > 0 && totalStudents > 0
        ? Math.round(
            (announcements.reduce(
              (sum, a) => sum + (readsByAnn[a.id]?.size ?? 0),
              0
            ) /
              announcements.length /
              totalStudents) *
              100
          )
        : 0;

    // Event attendance rate
    const attended = attendance.filter((a) => a.status === "attended").length;
    const registered = attendance.filter((a) => ["attended", "absent", "registered"].includes(a.status)).length;
    const eventAttendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;

    // Calendar completion rate
    const calendarCompletionRate =
      totalCalendarItems > 0 && totalStudents > 0
        ? Math.min(100, Math.round((calendarCompletions.length / (totalCalendarItems * Math.max(1, totalStudents))) * 100))
        : 0;

    // Parcel pickup rate
    const pickedUp = parcels.filter((p) => p.status === "picked_up").length;
    const returned = parcels.filter((p) => p.status === "returned").length;
    const parcelPickupRate =
      pickedUp + returned > 0 ? Math.round((pickedUp / (pickedUp + returned)) * 100) : 0;

    // Weekly reads trend
    const weekMap: Record<string, Set<string>> = {};
    for (const r of reads) {
      const d = new Date(r.read_at);
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
      const weekKey = monday.toISOString().slice(0, 10);
      if (!weekMap[weekKey]) weekMap[weekKey] = new Set();
      weekMap[weekKey].add(r.user_id);
    }
    const weeklyReads = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, users]) => ({ week, uniqueReaders: users.size }));

    // Event attendance by event_type
    const eventTypeMap = new Map(events.map((e) => [e.id, e.event_type]));
    const typeStats: Record<string, { attended: number; absent: number; registered: number }> = {};
    for (const a of attendance) {
      const eventType = eventTypeMap.get(a.event_id) ?? "other";
      if (!typeStats[eventType]) typeStats[eventType] = { attended: 0, absent: 0, registered: 0 };
      if (a.status === "attended") typeStats[eventType].attended++;
      else if (a.status === "absent") typeStats[eventType].absent++;
      else typeStats[eventType].registered++;
    }
    const eventAttendanceByType = Object.entries(typeStats).map(([eventType, v]) => ({
      eventType,
      label: EVENT_TYPE_LABELS[eventType] ?? eventType,
      ...v,
    }));

    // Chatbot intent distribution
    const intentCounts: Record<string, number> = {};
    for (const m of chatMessages) {
      const intent = m.intent ?? "unknown";
      intentCounts[intent] = (intentCounts[intent] ?? 0) + 1;
    }
    const chatbotIntents = Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, label: INTENT_LABELS[intent] ?? intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top announcements by read count
    const topAnnouncements = announcements
      .map((a) => {
        const readCount = readsByAnn[a.id]?.size ?? 0;
        const readRate = totalStudents > 0 ? Math.round((readCount / totalStudents) * 100) : 0;
        return {
          id: a.id,
          title: a.title_th ?? a.title_en ?? "ประกาศ",
          sentAt: a.sent_at,
          readCount,
          readRate,
        };
      })
      .sort((a, b) => b.readCount - a.readCount)
      .slice(0, 10);

    return NextResponse.json({
      kpis: { avgReadRate, eventAttendanceRate, calendarCompletionRate, parcelPickupRate },
      weeklyReads,
      eventAttendanceByType,
      chatbotIntents,
      topAnnouncements,
    });
  } catch (err) {
    console.error("[reports/engagement]", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
