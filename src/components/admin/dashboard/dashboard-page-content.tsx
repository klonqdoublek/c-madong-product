"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDashboardStats, useRecentTickets } from "@/hooks/use-dashboard-stats";
import type { MaintenanceStatus } from "@/lib/supabase/types";

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  acknowledged: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export function DashboardPageContent() {
  const t = useTranslations("admin.dashboardPage");
  const tStatus = useTranslations("maintenance.status");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useRecentTickets(5);

  const statCards = [
    {
      label: t("totalStudents"),
      value: stats?.totalStudents ?? 0,
      href: "/admin/students",
      color: "border-l-primary",
    },
    {
      label: t("openTickets"),
      value: stats?.openTickets ?? 0,
      href: "/admin/maintenance",
      color: "border-l-yellow-500",
    },
    {
      label: t("inProgress"),
      value: stats?.inProgressTickets ?? 0,
      href: "/admin/maintenance",
      color: "border-l-purple-500",
    },
    {
      label: t("completed"),
      value: stats?.completedTickets ?? 0,
      href: "/admin/maintenance",
      color: "border-l-green-500",
    },
  ];

  const quickActions = [
    { label: t("quickNewTicket"), href: "/admin/maintenance" },
    { label: t("quickStudents"), href: "/admin/students" },
    { label: t("quickAnnouncements"), href: "/admin/announcements" },
    { label: t("quickBroadcast"), href: "/admin/broadcast" },
    { label: t("quickTechnicians"), href: "/admin/maintenance/technicians" },
    { label: t("quickSettings"), href: "/admin/settings" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-lg border border-l-4 ${stat.color} bg-card p-6 transition-shadow hover:shadow-md`}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="font-heading text-3xl font-bold">
              {statsLoading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
              ) : (
                stat.value
              )}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <div className="rounded-lg border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-heading font-semibold">{t("recentTickets")}</h2>
            <Link
              href="/admin/maintenance"
              className="text-sm text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="divide-y">
            {ticketsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="ml-auto h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : recentTickets && recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/maintenance/${ticket.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(ticket.requester as { full_name_th?: string })?.full_name_th ??
                        "—"}
                    </p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}
                  >
                    {tStatus(
                      ticket.status === "in_progress" ? "inProgress" : ticket.status
                    )}
                  </span>
                </Link>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">{t("noTickets")}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-heading font-semibold">{t("quickActions")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-lg border p-3 text-center text-sm transition-colors hover:bg-muted/50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
