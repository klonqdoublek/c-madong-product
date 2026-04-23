"use client";

import { NotificationModal } from "@/components/student/notification-modal";
import { DashboardHero } from "@/components/student/dashboard/dashboard-hero";
import { DashboardInfoCard } from "@/components/student/dashboard/dashboard-info-card";
import { DashboardQuickMenu } from "@/components/student/dashboard/dashboard-quick-menu";
import { DashboardCalendar } from "@/components/student/dashboard/dashboard-calendar";
import { DashboardAnnouncementsCarousel } from "@/components/student/dashboard/dashboard-announcements-carousel";
import { DashboardEventsList } from "@/components/student/dashboard/dashboard-events-list";

export function DashboardPageContent() {
  return (
    <div className="min-h-screen bg-[#FBF6E9]">
      <NotificationModal />

      {/* Hero background image */}
      <DashboardHero />

      {/* Main card — bordered container with info card overlapping top */}
      <div className="relative -mt-[200px] px-4">
        {/* Info card — overlaps hero */}
        <div className="relative z-[20] pt-[80px]">
          <DashboardInfoCard />
        </div>

        {/* Bordered card wrapping quick menu */}
        <div className="relative z-0 mx-auto mb-6 mt-4 w-[363px] max-w-full rounded-xl border border-black/10 bg-[#FFFBF1] p-4 shadow-sm">
          <DashboardQuickMenu />
        </div>
      </div>

      {/* Calendar section */}
      <DashboardCalendar />

      {/* Announcements carousel */}
      <DashboardAnnouncementsCarousel />

      {/* Events list */}
      <DashboardEventsList />

      {/* Footer */}
      <footer className="relative mt-6 overflow-hidden">
        <svg
          viewBox="0 0 393 60"
          fill="none"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 30C60 10 120 50 200 30C280 10 340 40 393 25V60H0V30Z"
            fill="#F9E1E9"
          />
        </svg>
        <div className="bg-cu-light-pink px-4 pb-6 pt-2 text-center">
          <div className="mx-auto flex w-6 flex-wrap gap-1">
            <div className="size-2.5 rounded-sm bg-white" />
            <div className="size-2.5 rounded-sm bg-white" />
            <div className="size-2.5 rounded-sm bg-white" />
            <div className="size-2.5 rounded-sm bg-white" />
          </div>
          <p className="mt-2 font-heading text-sm font-bold text-primary">
            RCU.C-MADONG
          </p>
          <p className="mt-0.5 text-[10px] text-white">Version 1.0</p>
        </div>
      </footer>
    </div>
  );
}
