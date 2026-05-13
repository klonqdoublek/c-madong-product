"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus } from "lucide-react";

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  under_review: "bg-yellow-100 text-yellow-800",
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

function getStatusKey(status: MaintenanceStatus) {
  if (status === "under_review") return "underReview";
  if (status === "in_progress") return "inProgress";
  return status;
}

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

interface RecentTicket {
  id: string;
  title: string;
  status: MaintenanceStatus;
  category: string;
  created_at: string;
  requester: { full_name_th?: string; full_name_en?: string };
}

interface RecentAnnouncement {
  id: string;
  title_th: string | null;
  title_en: string | null;
  status: string | null;
  created_at: string;
  sent_at: string | null;
}

export function RecentTicketsCard({
  recentTickets,
  ticketsLoading,
}: {
  recentTickets: RecentTicket[] | undefined;
  ticketsLoading: boolean;
}) {
  const t = useTranslations("admin.dashboardPage");
  const tStatus = useTranslations("maintenance.status");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base">{t("recentTickets")}</CardTitle>
            <CardDescription>{t("recentTicketsDesc")}</CardDescription>
          </div>
          <Link href="/admin/maintenance" className="text-sm text-primary hover:underline">
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
                href={`/admin/maintenance?ticket=${ticket.id}`}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_EMOJI[ticket.category] ?? "📋"}</span>
                    <p className="truncate text-sm font-medium">{ticket.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ticket.requester?.full_name_th ?? "—"} · {relativeTime(ticket.created_at)}
                  </p>
                </div>
                <Badge variant="secondary" className={`ml-2 shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                  {tStatus(getStatusKey(ticket.status))}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="px-6 py-6 text-center text-sm text-muted-foreground">{t("noTickets")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentAnnouncementsCard({
  recentAnnouncements,
  announcementsLoading,
}: {
  recentAnnouncements: RecentAnnouncement[] | undefined;
  announcementsLoading: boolean;
}) {
  const t = useTranslations("admin.dashboardPage");
  const tAnnStatus = useTranslations("admin.announcementsPage");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base">{t("recentAnnouncements")}</CardTitle>
            <CardDescription>{t("recentAnnouncementsDesc")}</CardDescription>
          </div>
          <Link href="/admin/announcements" className="text-sm text-primary hover:underline">
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
                    <p className="truncate text-sm font-medium">{ann.title_th}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relativeTime(ann.sent_at ?? ann.created_at)}
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
              <p className="text-sm text-muted-foreground">{t("noAnnouncements")}</p>
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
  );
}

// Keep legacy export for backward compat — wraps both cards in 2-col grid
interface Props {
  recentTickets: RecentTicket[] | undefined;
  ticketsLoading: boolean;
  recentAnnouncements: RecentAnnouncement[] | undefined;
  announcementsLoading: boolean;
}

export function DashboardRecentSection(props: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <RecentTicketsCard recentTickets={props.recentTickets} ticketsLoading={props.ticketsLoading} />
      <RecentAnnouncementsCard recentAnnouncements={props.recentAnnouncements} announcementsLoading={props.announcementsLoading} />
    </div>
  );
}
