import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BOM = "﻿";

function toCSV(rows: (string | number | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const section = searchParams.get("section") ?? "maintenance";
    const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") ?? new Date().toISOString();

    // Fetch the report data from our own API routes
    const base = req.nextUrl.origin;
    const reportRes = await fetch(`${base}/api/admin/reports/${section}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (!reportRes.ok) throw new Error("Failed to fetch report data");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await reportRes.json();

    let rows: (string | number | null)[][] = [];
    let filename = `${section}-report`;

    if (section === "maintenance") {
      rows = [
        ["ประเภท", "จำนวน (ตั๋ว)"],
        ...((data.categoryBreakdown ?? []).map((r: { label: string; count: number }) => [r.label, r.count])),
        [],
        ["เดือน", "รอดำเนินการ", "รับเรื่องแล้ว", "กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"],
        ...((data.monthlyVolume ?? []).map((r: Record<string, number | string>) => [
          r.month, r.under_review ?? 0, r.acknowledged ?? 0, r.in_progress ?? 0, r.completed ?? 0, r.cancelled ?? 0,
        ])),
      ];
      filename = "maintenance-report";
    } else if (section === "billing") {
      rows = [
        ["เดือน", "รายรับ (฿)", "ค้างชำระ (฿)", "เลยกำหนด (฿)"],
        ...((data.monthlyRevenue ?? []).map((r: { month: string; revenue: number; outstanding: number; overdue: number }) => [
          r.month, r.revenue, r.outstanding, r.overdue,
        ])),
        [],
        ["ประเภท", "รายรับ (฿)"],
        ...((data.categoryRevenue ?? []).map((r: { label: string; total: number }) => [r.label, r.total])),
      ];
      filename = "billing-report";
    } else if (section === "occupancy") {
      rows = [
        ["ตึก", "ห้องทั้งหมด", "เตียงทั้งหมด", "เตียงที่ใช้", "เตียงว่าง", "อัตราการพักอาศัย (%)"],
        ...((data.perBuilding ?? []).map((r: { name: string; totalRooms: number; totalBeds: number; occupiedBeds: number; vacantBeds: number; occupancyPct: number }) => [
          r.name, r.totalRooms, r.totalBeds, r.occupiedBeds, r.vacantBeds, r.occupancyPct,
        ])),
      ];
      filename = "occupancy-report";
    } else if (section === "engagement") {
      rows = [
        ["ชื่อประกาศ", "จำนวนผู้อ่าน", "อัตราการอ่าน (%)"],
        ...((data.topAnnouncements ?? []).map((r: { title: string; readCount: number; readRate: number }) => [
          r.title, r.readCount, r.readRate,
        ])),
        [],
        ["ประเภทกิจกรรม", "เข้าร่วม", "ขาด", "ลงทะเบียน"],
        ...((data.eventAttendanceByType ?? []).map((r: { label: string; attended: number; absent: number; registered: number }) => [
          r.label, r.attended, r.absent, r.registered,
        ])),
      ];
      filename = "engagement-report";
    }

    const fromDate = from.slice(0, 10);
    const toDate = to.slice(0, 10);
    const csv = BOM + toCSV(rows);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}-${fromDate}-${toDate}.csv"`,
      },
    });
  } catch (err) {
    console.error("[reports/export]", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
