"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Wrench, Package, BookOpen, CalendarDays, Banknote } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMaintenanceTrend } from "@/hooks/use-dashboard-stats";

const MENU_ITEMS = [
  { key: "quickBroadcast", href: "/admin/broadcast", icon: Send, color: "text-primary bg-primary/10" },
  { key: "quickBilling", href: "/admin/billing", icon: Banknote, color: "text-yellow-600 bg-yellow-50" },
  { key: "quickParcels", href: "/admin/parcels", icon: Package, color: "text-teal-600 bg-teal-50" },
  { key: "quickKnowledge", href: "/admin/knowledge-base", icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
  { key: "quickEvents", href: "/admin/events", icon: CalendarDays, color: "text-pink-600 bg-pink-50" },
  { key: "quickMaintenance", href: "/admin/maintenance", icon: Wrench, color: "text-amber-600 bg-amber-50" },
] as const;

export function DashboardQuickMenu() {
  const t = useTranslations("admin.dashboardPage");
  const { data: trend } = useMaintenanceTrend();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">{t("quickMenu")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 6 quick action buttons — 3×2 grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {MENU_ITEMS.map(({ key, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-center transition-all duration-200 hover:shadow-hover"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                {t(key)}
              </span>
            </Link>
          ))}
        </div>

        {/* Maintenance trend area chart */}
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {t("maintenanceTrendLabel")}
          </p>
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DD598B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DD598B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => v.slice(5)}
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [v, "รายการ"]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(label: any) => `วันที่ ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#DD598B"
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#DD598B" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[120px] items-center justify-center rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูล</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
