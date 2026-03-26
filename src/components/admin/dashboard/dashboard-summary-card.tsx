"use client";

import { useTranslations } from "next-intl";
import type { DashboardStats } from "@/hooks/use-dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Send,
  Clock,
  AlertCircle,
  Wrench,
  Banknote,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const STAT_CONFIG = [
  { key: "totalStudents" as const, field: "totalStudents" as const, icon: Users, iconBg: "bg-primary/10 text-primary" },
  { key: "sentThisMonth" as const, field: "sentThisMonth" as const, icon: Send, iconBg: "bg-green-50 text-green-600" },
  { key: "pendingScheduled" as const, field: "pendingScheduled" as const, icon: Clock, iconBg: "bg-amber-50 text-amber-600" },
  { key: "newTickets" as const, field: "openTickets" as const, icon: AlertCircle, iconBg: "bg-orange-50 text-orange-600" },
  { key: "activeTickets" as const, field: "inProgressTickets" as const, icon: Wrench, iconBg: "bg-purple-50 text-purple-600" },
  { key: "completed" as const, field: "completedTickets" as const, icon: CheckCircle2, iconBg: "bg-green-50 text-green-600" },
  { key: "pendingBills" as const, field: "pendingBills" as const, icon: Banknote, iconBg: "bg-yellow-50 text-yellow-600" },
  { key: "overdueBills" as const, field: "overdueBills" as const, icon: AlertTriangle, iconBg: "bg-red-50 text-red-600" },
];

interface Props {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function DashboardSummaryCard({ stats, isLoading }: Props) {
  const t = useTranslations("admin.dashboardPage");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">
          {t("summaryTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAT_CONFIG.map(({ key, field, icon: Icon, iconBg }) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {t(key)}
                </p>
                <p className="font-heading text-xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted" />
                  ) : (
                    stats?.[field] ?? 0
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
