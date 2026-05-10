import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CATEGORY_LABELS: Record<string, string> = {
  room: "ค่าห้อง",
  electricity: "ค่าไฟฟ้า",
  water: "ค่าน้ำ",
  deposit: "เงินประกัน",
  fine: "ค่าปรับ",
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

    const [billsRes, itemsRes] = await Promise.all([
      adminDb
        .from("bills")
        .select("id, status, total_amount, billing_month, billing_year, paid_at, due_date, student_id, building_id")
        .gte("created_at", from)
        .lte("created_at", to),
      adminDb
        .from("bill_items")
        .select("bill_id, category, amount"),
    ]);

    const bills = billsRes.data ?? [];
    const allItems = itemsRes.data ?? [];

    const billIds = new Set(bills.map((b) => b.id));
    const items = allItems.filter((i) => billIds.has(i.bill_id));

    // KPIs
    const total = bills.length;
    const paidBills = bills.filter((b) => b.status === "paid");
    const pendingBills = bills.filter((b) => b.status === "pending");
    const overdueBills = bills.filter((b) => b.status === "overdue");

    const revenueCollected = paidBills.reduce((s, b) => s + (b.total_amount ?? 0), 0);
    const outstandingAmount = [...pendingBills, ...overdueBills].reduce((s, b) => s + (b.total_amount ?? 0), 0);
    const collectionRate =
      total > 0 ? Math.round((paidBills.length / total) * 100) : 0;
    const overdueRate =
      total > 0 ? Math.round((overdueBills.length / total) * 100) : 0;

    // Monthly revenue grouped by billing_year + billing_month
    const monthMap: Record<string, { revenue: number; outstanding: number; overdue: number }> = {};
    for (const b of bills) {
      const key = `${b.billing_year}-${String(b.billing_month).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, outstanding: 0, overdue: 0 };
      const amount = b.total_amount ?? 0;
      if (b.status === "paid") monthMap[key].revenue += amount;
      else if (b.status === "overdue") { monthMap[key].outstanding += amount; monthMap[key].overdue += amount; }
      else if (b.status === "pending") monthMap[key].outstanding += amount;
    }
    const monthlyRevenue = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        revenue: Math.round(v.revenue),
        outstanding: Math.round(v.outstanding),
        overdue: Math.round(v.overdue),
      }));

    // Status distribution
    const statusCounts: Record<string, { count: number; total: number }> = {};
    for (const b of bills) {
      if (!statusCounts[b.status]) statusCounts[b.status] = { count: 0, total: 0 };
      statusCounts[b.status].count++;
      statusCounts[b.status].total += b.total_amount ?? 0;
    }
    const statusDistribution = Object.entries(statusCounts).map(([status, v]) => ({
      status,
      count: v.count,
      total: Math.round(v.total),
    }));

    // Revenue by category (from bill_items of paid bills)
    const paidIds = new Set(paidBills.map((b) => b.id));
    const catMap: Record<string, number> = {};
    for (const item of items) {
      if (paidIds.has(item.bill_id)) {
        const cat = item.category ?? "other";
        catMap[cat] = (catMap[cat] ?? 0) + (item.amount ?? 0);
      }
    }
    const categoryRevenue = Object.entries(catMap)
      .map(([category, total]) => ({ category, label: CATEGORY_LABELS[category] ?? category, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);

    // Overdue detail — enrich with student info
    const overdueDetail = overdueBills
      .map((b) => {
        const daysOverdue = b.due_date
          ? Math.max(0, Math.floor((Date.now() - new Date(b.due_date).getTime()) / 86400000))
          : 0;
        return {
          id: b.id,
          studentId: b.student_id,
          amount: b.total_amount ?? 0,
          daysOverdue,
          month: `${b.billing_month}/${b.billing_year}`,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 10);

    return NextResponse.json({
      kpis: {
        totalBills: total,
        collectionRate,
        revenueCollected: Math.round(revenueCollected),
        outstandingAmount: Math.round(outstandingAmount),
        overdueRate,
      },
      monthlyRevenue,
      statusDistribution,
      categoryRevenue,
      overdueDetail,
    });
  } catch (err) {
    console.error("[reports/billing]", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
