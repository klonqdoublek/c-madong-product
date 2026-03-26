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
import { DashboardRecentSection } from "./dashboard-recent-section";
import { DashboardMascotWidget } from "./dashboard-mascot-widget";

export function DashboardPageContent() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } =
    useRecentTickets(5);
  const { data: recentAnnouncements, isLoading: announcementsLoading } =
    useRecentAnnouncements(5);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Row 0: Header */}
      <DashboardHeader />

      {/* Row 1: Summary + Quick Menu */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DashboardSummaryCard stats={stats} isLoading={statsLoading} />
        </div>
        <div className="lg:col-span-2">
          <DashboardQuickMenu />
        </div>
      </div>

      {/* Row 2: Upcoming Events + Attendance Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardUpcomingEvents />
        <DashboardAttendanceChart />
      </div>

      {/* Row 3: Recent Tickets + Announcements */}
      <DashboardRecentSection
        recentTickets={recentTickets}
        ticketsLoading={ticketsLoading}
        recentAnnouncements={recentAnnouncements}
        announcementsLoading={announcementsLoading}
      />

      {/* Mascot Widget */}
      <DashboardMascotWidget />
    </div>
  );
}
