"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Banknote, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BillingReport as IBillingReport } from "@/hooks/use-reports";
import { ReportsKpiCard } from "./reports-kpi-card";
import { ReportsEmptyState } from "./reports-empty-state";
import { ChartCard } from "./chart-card";
import { formatThaiMonthLabel, formatBaht } from "@/lib/utils/thai-month";

const STATUS_COLORS: Record<string, string> = {
  paid: "#52AD7E",
  pending: "#FBBF24",
  overdue: "#F87171",
  cancelled: "#94a3b8",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระ",
  overdue: "เลยกำหนด",
  cancelled: "ยกเลิก",
};
const PIE_COLORS = ["#DD598B", "#FBBF24", "#F87171", "#94a3b8"];

interface Props {
  data: IBillingReport | undefined;
  loading: boolean;
}

export function BillingReport({ data, loading }: Props) {
  const isEmpty = !loading && (!data || data.kpis.totalBills === 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportsKpiCard
          icon={Banknote}
          iconBg="bg-primary/10 text-primary"
          label="รายรับที่จัดเก็บได้"
          value={formatBaht(data?.kpis.revenueCollected ?? 0)}
          loading={loading}
        />
        <ReportsKpiCard
          icon={CheckCircle2}
          iconBg="bg-green-50 text-green-600"
          label="อัตราจัดเก็บ"
          value={data?.kpis.collectionRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={TrendingUp}
          iconBg="bg-amber-50 text-amber-600"
          label="ยอดค้างชำระ"
          value={formatBaht(data?.kpis.outstandingAmount ?? 0)}
          loading={loading}
        />
        <ReportsKpiCard
          icon={AlertTriangle}
          iconBg="bg-red-50 text-red-600"
          label="อัตราเลยกำหนด"
          value={data?.kpis.overdueRate ?? 0}
          suffix="%"
          loading={loading}
        />
      </div>

      {isEmpty ? (
        <ReportsEmptyState />
      ) : (
        <>
          {/* Monthly revenue grouped bar */}
          <ChartCard title="รายรับรายเดือน (฿)" loading={loading} minHeight={280}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.monthlyRevenue ?? []} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatThaiMonthLabel} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, key: any) => [formatBaht(Number(v)), key === "revenue" ? "รายรับ" : key === "outstanding" ? "ค้างชำระ" : "เลยกำหนด"]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(label: any) => formatThaiMonthLabel(label)}
                  contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}
                  formatter={(k) => k === "revenue" ? "รายรับ" : k === "outstanding" ? "ค้างชำระ" : "เลยกำหนด"} />
                <Bar dataKey="revenue" fill="#52AD7E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Status + Category row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Status pie */}
            <ChartCard title="สัดส่วนสถานะบิล" loading={loading} minHeight={260}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={(data?.statusDistribution ?? []).map((s) => ({
                      ...s,
                      name: STATUS_LABELS[s.status] ?? s.status,
                    }))}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(data?.statusDistribution ?? []).map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s.status] ?? PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any, name: any) => [`${v} บิล`, name]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Category revenue bar */}
            <ChartCard title="รายรับต่อประเภทค่าใช้จ่าย" loading={loading} minHeight={260}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.categoryRevenue ?? []} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [formatBaht(Number(v)), "รายรับ"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="#DD598B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Overdue table */}
          {(data?.overdueDetail?.length ?? 0) > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">บิลที่เลยกำหนดชำระนานที่สุด</p>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">รอบบิล</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">จำนวนเงิน</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">วันที่เลยกำหนด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.overdueDetail ?? []).map((b, i) => (
                      <tr key={b.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{b.month}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatBaht(b.amount)}</td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-rose-600">{b.daysOverdue} วัน</td>
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
