import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CATEGORY_LABELS: Record<string, string> = {
  electrical: "ไฟฟ้า",
  plumbing: "ประปา",
  air_conditioning: "แอร์",
  furniture: "เฟอร์นิเจอร์",
  internet: "อินเทอร์เน็ต",
  door_lock: "กุญแจ",
  pest: "แมลง/สัตว์รบกวน",
  cleaning: "ทำความสะอาด",
  general: "ทั่วไป",
  other: "อื่นๆ",
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

    const { data: tickets, error } = await adminDb
      .from("maintenance_requests")
      .select("id, title, category, ai_category, status, created_at, accepted_at, resolved_at, ticket_code")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: true });

    if (error) throw error;
    const rows = tickets ?? [];

    // KPIs
    const total = rows.length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const cancelled = rows.filter((r) => r.status === "cancelled").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    const withResponse = rows.filter((r) => r.accepted_at && r.created_at);
    const avgResponseTimeHrs =
      withResponse.length > 0
        ? withResponse.reduce((sum, r) => {
            const diff =
              (new Date(r.accepted_at!).getTime() - new Date(r.created_at).getTime()) / 3600000;
            return sum + diff;
          }, 0) / withResponse.length
        : 0;

    const withResolution = rows.filter((r) => r.resolved_at && r.status === "completed");
    const avgResolutionTimeHrs =
      withResolution.length > 0
        ? withResolution.reduce((sum, r) => {
            const diff =
              (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()) / 3600000;
            return sum + diff;
          }, 0) / withResolution.length
        : 0;

    // Category breakdown
    const catCounts: Record<string, number> = {};
    for (const r of rows) {
      const cat = r.ai_category ?? r.category ?? "other";
      catCounts[cat] = (catCounts[cat] ?? 0) + 1;
    }
    const categoryBreakdown = Object.entries(catCounts)
      .map(([category, count]) => ({ category, label: CATEGORY_LABELS[category] ?? category, count }))
      .sort((a, b) => b.count - a.count);

    // Monthly volume by status
    const monthMap: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      const month = r.created_at.slice(0, 7); // YYYY-MM
      if (!monthMap[month]) monthMap[month] = { under_review: 0, acknowledged: 0, in_progress: 0, completed: 0, cancelled: 0 };
      const status = r.status as string;
      if (status in monthMap[month]) monthMap[month][status]++;
    }
    const monthlyVolume = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({ month, ...counts }));

    // Response time trend per month
    const rtMap: Record<string, number[]> = {};
    for (const r of withResponse) {
      const month = r.created_at.slice(0, 7);
      if (!rtMap[month]) rtMap[month] = [];
      const hrs = (new Date(r.accepted_at!).getTime() - new Date(r.created_at).getTime()) / 3600000;
      rtMap[month].push(hrs);
    }
    const responseTimeTrend = Object.entries(rtMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, hrs]) => ({
        month,
        avgHours: parseFloat((hrs.reduce((s, v) => s + v, 0) / hrs.length).toFixed(1)),
      }));

    // Slowest tickets (by days since created_at, unresolved)
    const openTickets = rows
      .filter((r) => !["completed", "cancelled"].includes(r.status))
      .map((r) => ({
        id: r.id,
        ticketCode: r.ticket_code ?? r.id.slice(0, 8).toUpperCase(),
        title: r.title,
        category: CATEGORY_LABELS[r.ai_category ?? r.category] ?? (r.ai_category ?? r.category),
        status: r.status,
        daysOpen: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000),
      }))
      .sort((a, b) => b.daysOpen - a.daysOpen)
      .slice(0, 10);

    return NextResponse.json({
      kpis: {
        totalTickets: total,
        completionRate,
        avgResponseTimeHrs: parseFloat(avgResponseTimeHrs.toFixed(1)),
        avgResolutionTimeHrs: parseFloat(avgResolutionTimeHrs.toFixed(1)),
        cancellationRate,
      },
      categoryBreakdown,
      monthlyVolume,
      responseTimeTrend,
      slowestTickets: openTickets,
    });
  } catch (err) {
    console.error("[reports/maintenance]", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
