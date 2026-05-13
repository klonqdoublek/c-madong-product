"use client";

import {
  useDashboardStats,
  useRecentTickets,
  useRecentAnnouncements,
} from "@/hooks/use-dashboard-stats";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSummaryCard } from "./dashboard-summary-card";
import { DashboardQuickMenu } from "./dashboard-quick-menu";
import { DashboardUpcomingEvents } from "./dashboard-upcoming-events";
import { DashboardAttendanceChart } from "./dashboard-attendance-chart";
import { RecentTicketsCard, RecentAnnouncementsCard } from "./dashboard-recent-section";
import { DashboardMascotWidget } from "./dashboard-mascot-widget";
import { DashboardAIFeedbackCard } from "./dashboard-ai-feedback-card";
import { DashboardLineClaimsAlert } from "./dashboard-line-claims-alert";

export function DashboardPageContent() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useRecentTickets(5);
  const { data: recentAnnouncements, isLoading: announcementsLoading } = useRecentAnnouncements(5);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Row 0: Header — greeting + export buttons */}
      <DashboardHeader />

      {/* Row 1: 4 Hero KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardSummaryCard stats={stats} isLoading={statsLoading} />
      </div>

      {/* Row 1.5: LINE Claims alert — only when claims exist */}
      <DashboardLineClaimsAlert />

      {/* Row 2: Calendar + Events | Quick Menu + Trend Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardUpcomingEvents />
        <DashboardQuickMenu />
      </div>

      {/* Row 3: Recent Tickets | Recent Announcements | Attendance Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentTicketsCard
          recentTickets={recentTickets}
          ticketsLoading={ticketsLoading}
        />
        <RecentAnnouncementsCard
          recentAnnouncements={recentAnnouncements}
          announcementsLoading={announcementsLoading}
        />
        <DashboardAttendanceChart />
      </div>

      {/* Row 4: AI Knowledge Feedback */}
      <DashboardAIFeedbackCard />

      {/* Floating mascot chat widget */}
      <DashboardMascotWidget />
    </div>
  );
}
