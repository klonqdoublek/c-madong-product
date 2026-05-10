"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useMaintenanceReport,
  useBillingReport,
  useOccupancyReport,
  useEngagementReport,
} from "@/hooks/use-reports";
import { formatBaht, formatThaiMonthLabel } from "@/lib/utils/thai-month";

type Section = "maintenance" | "billing" | "occupancy" | "engagement";

const SECTION_LABELS: Record<Section, string> = {
  maintenance: "รายงานการซ่อมบำรุง",
  billing: "รายงานการเงิน",
  occupancy: "รายงานการพักอาศัย",
  engagement: "รายงานการมีส่วนร่วม",
};

const STATUS_LABELS: Record<string, string> = {
  under_review: "รอดำเนินการ",
  acknowledged: "รับเรื่องแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

function KpiGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <div key={item.label} className="border border-slate-200 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
          <p className="text-lg font-bold text-slate-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function PrintTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((h) => (
              <th
                key={h}
                className="border border-slate-200 px-3 py-2 text-left font-medium text-slate-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-200 px-3 py-2 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-slate-200 px-3 py-4 text-center text-slate-400"
              >
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MaintenancePrint({
  section,
  params,
}: {
  section: string;
  params: { from: string; to: string };
}) {
  const { data, isLoading } = useMaintenanceReport(params);
  if (isLoading || !data) return <p className="text-slate-400 text-sm">กำลังโหลด...</p>;

  return (
    <>
      <KpiGrid
        items={[
          { label: "คำขอซ่อมทั้งหมด", value: String(data.kpis.totalTickets) },
          { label: "อัตราเสร็จสิ้น", value: `${data.kpis.completionRate}%` },
          { label: "เวลาตอบสนองเฉลี่ย", value: `${data.kpis.avgResponseTimeHrs} ชม.` },
          { label: "อัตรายกเลิก", value: `${data.kpis.cancellationRate}%` },
        ]}
      />
      <PrintTable
        title="ประเภทการซ่อม"
        headers={["ประเภท", "จำนวน (งาน)"]}
        rows={data.categoryBreakdown.map((r) => [r.label, r.count])}
      />
      <PrintTable
        title="จำนวนงานรายเดือน"
        headers={["เดือน", "รอดำเนินการ", "รับเรื่องแล้ว", "กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"]}
        rows={data.monthlyVolume.map((r) => [
          formatThaiMonthLabel(r.month),
          r.under_review,
          r.acknowledged,
          r.in_progress,
          r.completed,
          r.cancelled,
        ])}
      />
      {data.slowestTickets.length > 0 && (
        <PrintTable
          title="งานที่ค้างนานที่สุด"
          headers={["รหัสงาน", "รายละเอียด", "ประเภท", "สถานะ", "วันที่ค้าง"]}
          rows={data.slowestTickets.map((t) => [
            t.ticketCode,
            t.title,
            t.category,
            STATUS_LABELS[t.status] ?? t.status,
            `${t.daysOpen} วัน`,
          ])}
        />
      )}
    </>
  );
}

function BillingPrint({ params }: { params: { from: string; to: string } }) {
  const { data, isLoading } = useBillingReport(params);
  if (isLoading || !data) return <p className="text-slate-400 text-sm">กำลังโหลด...</p>;

  return (
    <>
      <KpiGrid
        items={[
          { label: "รายรับที่จัดเก็บ", value: formatBaht(data.kpis.revenueCollected) },
          { label: "อัตราจัดเก็บ", value: `${data.kpis.collectionRate}%` },
          { label: "ยอดค้างชำระ", value: formatBaht(data.kpis.outstandingAmount) },
          { label: "อัตราเลยกำหนด", value: `${data.kpis.overdueRate}%` },
        ]}
      />
      <PrintTable
        title="รายรับรายเดือน"
        headers={["เดือน", "รายรับ (฿)", "ค้างชำระ (฿)", "เลยกำหนด (฿)"]}
        rows={data.monthlyRevenue.map((r) => [
          formatThaiMonthLabel(r.month),
          formatBaht(r.revenue),
          formatBaht(r.outstanding),
          formatBaht(r.overdue),
        ])}
      />
      <PrintTable
        title="รายรับแยกตามประเภท"
        headers={["ประเภท", "รายรับ (฿)"]}
        rows={data.categoryRevenue.map((r) => [r.label, formatBaht(r.total)])}
      />
    </>
  );
}

function OccupancyPrint({ params }: { params: { from: string; to: string } }) {
  const { data, isLoading } = useOccupancyReport(params);
  if (isLoading || !data) return <p className="text-slate-400 text-sm">กำลังโหลด...</p>;

  return (
    <>
      <KpiGrid
        items={[
          { label: "เตียงทั้งหมด", value: String(data.kpis.totalBeds) },
          { label: "เตียงที่ใช้", value: String(data.kpis.occupiedBeds) },
          { label: "เตียงว่าง", value: String(data.kpis.vacantBeds) },
          { label: "อัตราการพักอาศัย", value: `${data.kpis.occupancyRate}%` },
        ]}
      />
      <PrintTable
        title="ข้อมูลแยกตามตึก"
        headers={["ตึก", "ห้องทั้งหมด", "เตียงทั้งหมด", "เตียงที่ใช้", "เตียงว่าง", "อัตรา (%)"]}
        rows={data.perBuilding.map((r) => [
          r.name,
          r.totalRooms,
          r.totalBeds,
          r.occupiedBeds,
          r.vacantBeds,
          `${r.occupancyPct}%`,
        ])}
      />
    </>
  );
}

function EngagementPrint({ params }: { params: { from: string; to: string } }) {
  const { data, isLoading } = useEngagementReport(params);
  if (isLoading || !data) return <p className="text-slate-400 text-sm">กำลังโหลด...</p>;

  return (
    <>
      <KpiGrid
        items={[
          { label: "อัตราการอ่านประกาศ", value: `${data.kpis.avgReadRate}%` },
          { label: "อัตราเข้าร่วมกิจกรรม", value: `${data.kpis.eventAttendanceRate}%` },
          { label: "อัตราทำกิจกรรมหอ", value: `${data.kpis.calendarCompletionRate}%` },
          { label: "อัตรารับพัสดุ", value: `${data.kpis.parcelPickupRate}%` },
        ]}
      />
      <PrintTable
        title="ประกาศที่มีผู้อ่านมากที่สุด"
        headers={["ชื่อประกาศ", "ผู้อ่าน", "อัตราการอ่าน (%)"]}
        rows={data.topAnnouncements.map((r) => [r.title, r.readCount, `${r.readRate}%`])}
      />
      <PrintTable
        title="การเข้าร่วมกิจกรรมแยกประเภท"
        headers={["ประเภท", "เข้าร่วม", "ขาด", "ลงทะเบียน"]}
        rows={data.eventAttendanceByType.map((r) => [
          r.label,
          r.attended,
          r.absent,
          r.registered,
        ])}
      />
    </>
  );
}

export function ReportPrintContent() {
  const searchParams = useSearchParams();
  const section = (searchParams.get("section") ?? "maintenance") as Section;
  const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get("to") ?? new Date().toISOString();
  const params = { from, to };

  const sectionLabel = SECTION_LABELS[section] ?? section;
  const fromDate = from.slice(0, 10);
  const toDate = to.slice(0, 10);
  const generatedAt = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 print:p-6">
      {/* Print action bar — hidden in print */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-slate-500">กำลังเปิดหน้าต่างพิมพ์อัตโนมัติ...</p>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          พิมพ์ / บันทึก PDF
        </button>
      </div>

      {/* Report header */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">หอพักนิสิต — ซีมะโด่ง</h1>
            <h2 className="text-base font-semibold text-primary mt-0.5">{sectionLabel}</h2>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>ช่วงเวลา: {fromDate} — {toDate}</p>
            <p>สร้างเมื่อ: {generatedAt}</p>
          </div>
        </div>
      </div>

      {/* Section content */}
      {section === "maintenance" && <MaintenancePrint section={section} params={params} />}
      {section === "billing" && <BillingPrint params={params} />}
      {section === "occupancy" && <OccupancyPrint params={params} />}
      {section === "engagement" && <EngagementPrint params={params} />}

      {/* Footer */}
      <div className="mt-8 border-t border-slate-100 pt-3 text-[10px] text-slate-400 print:fixed print:bottom-4 print:left-8 print:right-8">
        <div className="flex justify-between">
          <span>ระบบจัดการหอพักซีมะโด่ง — C-Madong</span>
          <span>{generatedAt}</span>
        </div>
      </div>
    </div>
  );
}
