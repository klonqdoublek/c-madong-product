"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useDashboardStats,
  useRecentTickets,
  useRecentAnnouncements,
} from "@/hooks/use-dashboard-stats";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Send,
  Clock,
  AlertCircle,
  Wrench,
  Plus,
  Megaphone,
  FileText,
  UserCheck,
  ClipboardList,
  History,
} from "lucide-react";

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  acknowledged: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const CATEGORY_EMOJI: Record<string, string> = {
  electrical: "⚡",
  plumbing: "🔧",
  furniture: "🪑",
  air_conditioning: "❄️",
  internet: "🌐",
  door_lock: "🔒",
  pest: "🐛",
  cleaning: "🧹",
  other: "📋",
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function DashboardPageContent() {
  const t = useTranslations("admin.dashboardPage");
  const tStatus = useTranslations("maintenance.status");
  const tAnnStatus = useTranslations("admin.announcementsPage");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } =
    useRecentTickets(5);
  const { data: recentAnnouncements, isLoading: announcementsLoading } =
    useRecentAnnouncements(5);

  const announcementStats = [
    {
      label: t("totalStudents"),
      value: stats?.totalStudents ?? 0,
      icon: <Users className="h-5 w-5" />,
      iconBg: "bg-primary/10 text-primary",
      href: "/admin/students",
    },
    {
      label: t("sentThisMonth"),
      value: stats?.sentThisMonth ?? 0,
      icon: <Send className="h-5 w-5" />,
      iconBg: "bg-green-50 text-green-600",
      href: "/admin/announcements",
    },
    {
      label: t("pendingScheduled"),
      value: stats?.pendingScheduled ?? 0,
      icon: <Clock className="h-5 w-5" />,
      iconBg: "bg-amber-50 text-amber-600",
      href: "/admin/announcements",
    },
  ];

  const maintenanceStats = [
    {
      label: t("newTickets"),
      value: stats?.openTickets ?? 0,
      icon: <AlertCircle className="h-5 w-5" />,
      iconBg: "bg-amber-50 text-amber-600",
      borderColor: "border-l-amber-400",
      href: "/admin/maintenance",
    },
    {
      label: t("activeTickets"),
      value: stats?.inProgressTickets ?? 0,
      icon: <Wrench className="h-5 w-5" />,
      iconBg: "bg-purple-50 text-purple-600",
      borderColor: "border-l-purple-400",
      href: "/admin/maintenance",
    },
  ];

  const quickActions = [
    {
      label: t("quickBroadcast"),
      href: "/admin/broadcast",
      icon: <Send className="h-5 w-5" />,
      color: "text-green-600 group-hover:bg-green-50",
    },
    {
      label: t("quickMaintenance"),
      href: "/admin/maintenance",
      icon: <Wrench className="h-5 w-5" />,
      color: "text-amber-600 group-hover:bg-amber-50",
    },
    {
      label: t("quickTemplate"),
      href: "/admin/templates",
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-600 group-hover:bg-blue-50",
    },
    {
      label: t("quickStudents"),
      href: "/admin/students",
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-primary group-hover:bg-primary/5",
    },
    {
      label: t("quickAllAnnouncements"),
      href: "/admin/announcements",
      icon: <ClipboardList className="h-5 w-5" />,
      color: "text-indigo-600 group-hover:bg-indigo-50",
    },
    {
      label: t("quickMaintenanceHistory"),
      href: "/admin/maintenance/all",
      icon: <History className="h-5 w-5" />,
      color: "text-gray-600 group-hover:bg-gray-50",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/admin/announcements/new">
          <Button className="gradient-success text-white shadow-sm hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" />
            {t("createAnnouncement")}
          </Button>
        </Link>
      </div>

      {/* Announcement Stats */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Megaphone className="h-4 w-4" />
          {t("announcementSystem")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcementStats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="shadow-card transition-all duration-200 hover:shadow-hover">
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="font-heading text-2xl font-bold">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Maintenance Stats */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Wrench className="h-4 w-4" />
          {t("maintenanceSystem")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {maintenanceStats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card
                className={`border-l-4 ${stat.borderColor} shadow-card transition-all duration-200 hover:shadow-hover`}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="font-heading text-2xl font-bold">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tickets + Announcements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base">
                  {t("recentTickets")}
                </CardTitle>
                <CardDescription>{t("recentTicketsDesc")}</CardDescription>
              </div>
              <Link
                href="/admin/maintenance"
                className="text-sm text-primary hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y">
              {ticketsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="ml-auto h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))
              ) : recentTickets && recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/maintenance/${ticket.id}`}
                    className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {CATEGORY_EMOJI[ticket.category] ?? "📋"}
                        </span>
                        <p className="truncate text-sm font-medium">
                          {ticket.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(
                          ticket.requester as {
                            full_name_th?: string;
                          }
                        )?.full_name_th ?? "—"}{" "}
                        · {formatRelativeTime(ticket.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 shrink-0 ${STATUS_COLORS[ticket.status]}`}
                    >
                      {tStatus(
                        ticket.status === "in_progress"
                          ? "inProgress"
                          : ticket.status
                      )}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="px-6 py-6 text-center text-sm text-muted-foreground">
                  {t("noTickets")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base">
                  {t("recentAnnouncements")}
                </CardTitle>
                <CardDescription>
                  {t("recentAnnouncementsDesc")}
                </CardDescription>
              </div>
              <Link
                href="/admin/announcements"
                className="text-sm text-primary hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y">
              {announcementsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="ml-auto h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))
              ) : recentAnnouncements && recentAnnouncements.length > 0 ? (
                recentAnnouncements.map((ann) => (
                  <Link
                    key={ann.id}
                    href={`/admin/announcements/${ann.id}`}
                    className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 shrink-0 text-primary" />
                        <p className="truncate text-sm font-medium">
                          {ann.title_th}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatRelativeTime(ann.sent_at ?? ann.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        ann.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : ann.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {ann.status === "sent"
                        ? tAnnStatus("statusSent")
                        : ann.status === "scheduled"
                          ? tAnnStatus("statusScheduled")
                          : tAnnStatus("statusDraft")}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("noAnnouncements")}
                  </p>
                  <Link href="/admin/announcements/new">
                    <Button variant="link" size="sm" className="mt-1">
                      <Plus className="mr-1 h-3 w-3" />
                      {t("createFirstAnnouncement")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">
            {t("quickActions")}
          </CardTitle>
          <CardDescription>{t("quickActionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all duration-200 hover:shadow-hover"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${action.color}`}
                >
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
