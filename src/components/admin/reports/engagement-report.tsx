"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Bell, Trophy, CalendarCheck, Package } from "lucide-react";
import type { EngagementReport as IEngagementReport } from "@/hooks/use-reports";
import { ReportsKpiCard } from "./reports-kpi-card";
import { ReportsEmptyState } from "./reports-empty-state";
import { ChartCard } from "./chart-card";

const PIE_COLORS = ["#DD598B", "#52AD7E", "#FBBF24", "#60A5FA", "#F87171", "#A78BFA", "#FB923C", "#34D399"];

interface Props {
  data: IEngagementReport | undefined;
  loading: boolean;
}

function formatWeekLabel(week: string): string {
  const d = new Date(week);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function EngagementReport({ data, loading }: Props) {
  const isEmpty = !loading && (!data || (
    data.weeklyReads.length === 0 &&
    data.eventAttendanceByType.length === 0 &&
    data.chatbotIntents.length === 0
  ));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportsKpiCard
          icon={Bell}
          iconBg="bg-primary/10 text-primary"
          label="อัตราอ่านประกาศเฉลี่ย"
          value={data?.kpis.avgReadRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={Trophy}
          iconBg="bg-amber-50 text-amber-600"
          label="อัตราเข้าร่วมกิจกรรม"
          value={data?.kpis.eventAttendanceRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={CalendarCheck}
          iconBg="bg-green-50 text-green-600"
          label="ทำงานปฏิทินสำเร็จ"
          value={data?.kpis.calendarCompletionRate ?? 0}
          suffix="%"
          loading={loading}
        />
        <ReportsKpiCard
          icon={Package}
          iconBg="bg-blue-50 text-blue-600"
          label="อัตรารับพัสดุ"
          value={data?.kpis.parcelPickupRate ?? 0}
          suffix="%"
          loading={loading}
        />
      </div>

      {isEmpty ? (
        <ReportsEmptyState />
      ) : (
        <>
          {/* Weekly reads line chart */}
          {(data?.weeklyReads?.length ?? 0) > 0 && (
            <ChartCard title="ผู้อ่านประกาศรายสัปดาห์ (คน)" loading={loading} minHeight={220}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.weeklyReads ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickFormatter={formatWeekLabel}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`${v} คน`, "ผู้อ่านไม่ซ้ำ"]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(label: any) => formatWeekLabel(label)}
                    contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="uniqueReaders" stroke="#DD598B" strokeWidth={2.5} dot={{ r: 3, fill: "#DD598B" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Event attendance + chatbot intents row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Event attendance by type — 3 cols */}
            {(data?.eventAttendanceByType?.length ?? 0) > 0 && (
              <div className="lg:col-span-3">
                <ChartCard title="การเข้าร่วมตามประเภทกิจกรรม" loading={loading} minHeight={260}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data?.eventAttendanceByType ?? []} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any, key: any) => [v, key === "attended" ? "เข้าร่วม" : key === "absent" ? "ขาด" : "ลงทะเบียน"]}
                        contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}
                        formatter={(k) => k === "attended" ? "เข้าร่วม" : k === "absent" ? "ขาด" : "ลงทะเบียน"} />
                      <Bar dataKey="attended" fill="#52AD7E" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" fill="#F87171" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="registered" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* Chatbot intents donut — 2 cols */}
            {(data?.chatbotIntents?.length ?? 0) > 0 && (
              <div className="lg:col-span-2">
                <ChartCard title="คำถามยอดนิยม (น้องซีมะโด่ง)" loading={loading} minHeight={260}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={(data?.chatbotIntents ?? []).map((i) => ({ ...i, name: i.label }))}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {(data?.chatbotIntents ?? []).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any, name: any) => [`${v} ครั้ง`, name]}
                        contentStyle={{ borderRadius: 10, border: "1px solid #f1f5f9", fontSize: 12 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}
          </div>

          {/* Top announcements table */}
          {(data?.topAnnouncements?.length ?? 0) > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">ประกาศที่มีผู้อ่านมากที่สุด</p>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ชื่อประกาศ</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">ผู้อ่าน</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">อัตราการอ่าน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.topAnnouncements ?? []).map((a, i) => (
                      <tr key={a.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <td className="max-w-[280px] truncate px-4 py-3 font-medium">{a.title}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{a.readCount.toLocaleString("th-TH")}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${a.readRate >= 60 ? "text-green-600" : a.readRate >= 30 ? "text-amber-600" : "text-rose-500"}`}>
                            {a.readRate}%
                          </span>
                        </td>
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
