"use client";

import { useTranslations } from "next-intl";
import { Users, Wrench, MessageCircle, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/hooks/use-dashboard-stats";

interface Props {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

function StatValue({ value, isLoading }: { value: number; isLoading: boolean }) {
  if (isLoading) {
    return <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-muted" />;
  }
  return <span>{value.toLocaleString("th-TH")}</span>;
}

export function DashboardSummaryCard({ stats, isLoading }: Props) {
  const t = useTranslations("admin.dashboardPage");

  const activeTickets = (stats?.openTickets ?? 0) + (stats?.inProgressTickets ?? 0);

  const cards = [
    {
      label: t("totalStudents"),
      value: stats?.totalStudents ?? 0,
      sub: t("totalStudentsSub"),
      subColor: "text-primary",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: t("activeTickets"),
      value: activeTickets,
      sub: t("activeTicketsSub", { count: stats?.openTickets ?? 0 }),
      subColor: "text-amber-600",
      icon: Wrench,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: t("liveChatLabel"),
      value: stats?.liveChatCount ?? 0,
      sub: t("liveChatSub"),
      subColor: "text-teal-600",
      icon: MessageCircle,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
    },
    {
      label: t("sentThisMonth"),
      value: stats?.sentThisMonth ?? 0,
      sub: t("sentThisMonthSub", { pending: stats?.pendingScheduled ?? 0 }),
      subColor: "text-pink-600",
      icon: Megaphone,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex shrink-0 items-center justify-center rounded-2xl p-3.5 ${card.iconBg}`}>
                <Icon className={`h-7 w-7 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{card.label}</p>
                <p className="font-heading text-3xl font-bold leading-tight">
                  <StatValue value={card.value} isLoading={isLoading} />
                </p>
                <p className={`mt-0.5 text-xs ${card.subColor}`}>{card.sub}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
