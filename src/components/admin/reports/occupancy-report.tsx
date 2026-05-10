"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { BedDouble, Home, DoorOpen } from "lucide-react";
import type { OccupancyReport as IOccupancyReport } from "@/hooks/use-reports";
import { ReportsKpiCard } from "./reports-kpi-card";
import { ReportsEmptyState } from "./reports-empty-state";
import { ChartCard } from "./chart-card";
import { formatThaiMonthLabel } from "@/lib/utils/thai-month";

interface Props {
  data: IOccupancyReport | undefined;
  loading: boolean;
}

function OccupancyBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#F87171" : pct >= 70 ? "#FBBF24" : "#52AD7E";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold" style={{ color }}>{pct}%</span>
    </div>
  );
}

export function OccupancyReport({ data, loading }: Props) {
  const isEmpty = !loading && (!data || data.kpis.totalBeds === 0);

  const BUILDING_COLORS = ["#DD598B", "#52AD7E", "#FBBF24", "#60A5FA", "#A78BFA"];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportsKpiCard
          icon={BedDouble}
          iconBg="bg-primary/10 text-primary"
          label="อัตราการพักอาศัย"
          value={data?.kpis.occupancyRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={Home}
          iconBg="bg-blue-50 text-blue-600"
          label="เตียงทั้งหมด"
          value={(data?.kpis.totalBeds ?? 0).toLocaleString("th-TH")}
          loading={loading}
        />
        <ReportsKpiCard
          icon={BedDouble}
          iconBg="bg-green-50 text-green-600"
          label="เตียงที่ใช้"
          value={(data?.kpis.occupiedBeds ?? 0).toLocaleString("th-TH")}
          loading={loading}
        />
        <ReportsKpiCard
          icon={DoorOpen}
          iconBg="bg-amber-50 text-amber-600"
          label="เตียงว่าง"
          value={(data?.kpis.vacantBeds ?? 0).toLocaleString("th-TH")}
          loading={loading}
        />
      </div>

      {isEmpty ? (
        <ReportsEmptyState />
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Per-building horizontal bar — 3 cols */}
            <div className="lg:col-span-3">
              <ChartCard title="อัตราการพักอาศัยต่อตึก" loading={loading} minHeight={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={data?.perBuilding ?? []}
                    layout="vertical"
                    barCategoryGap="25%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={72}
                    />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => [`${v}%`, "อัตราพักอาศัย"]}
                      contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                    />
                    <Bar dataKey="occupancyPct" radius={[0, 4, 4, 0]}>
                      {(data?.perBuilding ?? []).map((_, i) => (
                        <Cell key={i} fill={BUILDING_COLORS[i % BUILDING_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Move-in timeline — 2 cols */}
            <div className="lg:col-span-2">
              <ChartCard title="แนวโน้มการย้ายเข้า" loading={loading} minHeight={280}>
                {(data?.moveInTimeline?.length ?? 0) === 0 ? (
                  <div className="flex h-[280px] items-center justify-center">
                    <p className="text-xs text-muted-foreground">ไม่มีข้อมูลการย้ายเข้า</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data?.moveInTimeline ?? []} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatThaiMonthLabel}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any) => [`${v} คน`, "ย้ายเข้า"]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        labelFormatter={(label: any) => formatThaiMonthLabel(label)}
                        contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                      />
                      <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>

          {/* Building detail table */}
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">รายละเอียดต่อตึก</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ตึก</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">ห้อง</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">เตียงทั้งหมด</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">เตียงที่ใช้</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">เตียงว่าง</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">อัตราพักอาศัย</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.perBuilding ?? []).map((b, i) => (
                    <tr key={b.name} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{b.totalRooms}</td>
                      <td className="px-4 py-3 text-right">{b.totalBeds.toLocaleString("th-TH")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{b.occupiedBeds.toLocaleString("th-TH")}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{b.vacantBeds.toLocaleString("th-TH")}</td>
                      <td className="w-40 px-4 py-3"><OccupancyBar pct={b.occupancyPct} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
