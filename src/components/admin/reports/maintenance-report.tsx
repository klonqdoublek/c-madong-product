"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CheckCircle2, Clock, XCircle, Wrench } from "lucide-react";
import type { MaintenanceReport as IMaintenanceReport } from "@/hooks/use-reports";
import { ReportsKpiCard } from "./reports-kpi-card";
import { ReportsEmptyState } from "./reports-empty-state";
import { ChartCard } from "./chart-card";
import { formatThaiMonthLabel } from "@/lib/utils/thai-month";

const COLORS = ["#DD598B", "#52AD7E", "#FBBF24", "#60A5FA", "#F87171", "#A78BFA", "#FB923C", "#34D399"];

const STATUS_LABELS: Record<string, string> = {
  under_review: "รอดำเนินการ",
  acknowledged: "รับเรื่องแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

const STATUS_COLORS: Record<string, string> = {
  under_review: "#FBBF24",
  acknowledged: "#60A5FA",
  in_progress: "#A78BFA",
  completed: "#52AD7E",
  cancelled: "#F87171",
};

const STATUS_BADGE: Record<string, string> = {
  under_review: "bg-amber-50 text-amber-700",
  acknowledged: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

interface Props {
  data: IMaintenanceReport | undefined;
  loading: boolean;
}

export function MaintenanceReport({ data, loading }: Props) {
  const isEmpty = !loading && (!data || data.kpis.totalTickets === 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportsKpiCard
          icon={Wrench}
          iconBg="bg-primary/10 text-primary"
          label="คำขอซ่อมทั้งหมด"
          value={data?.kpis.totalTickets ?? 0}
          loading={loading}
        />
        <ReportsKpiCard
          icon={CheckCircle2}
          iconBg="bg-green-50 text-green-600"
          label="อัตราเสร็จสิ้น"
          value={data?.kpis.completionRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={Clock}
          iconBg="bg-blue-50 text-blue-600"
          label="เวลาตอบสนองเฉลี่ย"
          value={data?.kpis.avgResponseTimeHrs ?? 0}
          suffix=" ชม."
          loading={loading}
        />
        <ReportsKpiCard
          icon={XCircle}
          iconBg="bg-red-50 text-red-600"
          label="อัตรายกเลิก"
          value={data?.kpis.cancellationRate ?? 0}
          suffix="%"
          loading={loading}
        />
      </div>

      {isEmpty ? (
        <ReportsEmptyState />
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Category donut — 2 cols */}
            <div className="lg:col-span-2">
              <ChartCard title="ประเภทการซ่อม" loading={loading} minHeight={260}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data?.categoryBreakdown ?? []}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {(data?.categoryBreakdown ?? []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any, name: any) => [`${v} งาน`, name]}
                      contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Monthly volume stacked bar — 3 cols */}
            <div className="lg:col-span-3">
              <ChartCard title="จำนวนงานรายเดือน" loading={loading} minHeight={260}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data?.monthlyVolume ?? []} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatThaiMonthLabel}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any, key: any) => [v, STATUS_LABELS[key] ?? key]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(label: any) => formatThaiMonthLabel(label)}
                      contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}
                      formatter={(key) => STATUS_LABELS[key] ?? key} />
                    {Object.keys(STATUS_COLORS).map((s) => (
                      <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s]} radius={s === "cancelled" ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* Response time trend */}
          {(data?.responseTimeTrend?.length ?? 0) > 0 && (
            <ChartCard title="แนวโน้มเวลาตอบสนอง (ชั่วโมง)" loading={loading} minHeight={200}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.responseTimeTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={formatThaiMonthLabel} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} unit=" ชม." />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`${v} ชม.`, "เวลาตอบสนองเฉลี่ย"]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(label: any) => formatThaiMonthLabel(label)}
                    contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="avgHours" stroke="#DD598B" strokeWidth={2.5} dot={{ r: 3, fill: "#DD598B" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Slowest tickets table */}
          {(data?.slowestTickets?.length ?? 0) > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">งานที่ค้างนานที่สุด</p>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">รหัสงาน</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">รายละเอียด</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ประเภท</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">สถานะ</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">วันที่ค้าง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.slowestTickets ?? []).map((t, i) => (
                      <tr key={t.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.ticketCode}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-medium">{t.title}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.category}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[t.status] ?? "bg-slate-50 text-slate-700"}`}>
                            {STATUS_LABELS[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-rose-600">{t.daysOpen} วัน</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
