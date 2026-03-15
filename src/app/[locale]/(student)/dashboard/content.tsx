"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardHeader } from "@/components/student/dashboard-header";
import { DashboardActionCards } from "@/components/student/dashboard-action-cards";
import { DashboardStatusCard } from "@/components/student/dashboard-status-card";
import { DashboardAnnouncements } from "@/components/student/dashboard-announcements";
import {
  Banknote,
  Wrench,
  Package,
  Megaphone,
  ShieldAlert,
  Info,
  Phone,
  ClipboardCheck,
} from "lucide-react";

const menuItems = [
  { icon: Banknote, labelKey: "menuBilling" as const, href: "/billing" },
  { icon: Wrench, labelKey: "menuRepair" as const, href: "/maintenance" },
  { icon: Package, labelKey: "menuParcel" as const, href: "#" },
  { icon: Megaphone, labelKey: "menuNews" as const, href: "/announcements" },
  { icon: ShieldAlert, labelKey: "menuEmergency" as const, href: "#" },
  { icon: Info, labelKey: "menuInfo" as const, href: "#" },
  { icon: Phone, labelKey: "menuContact" as const, href: "#" },
  { icon: ClipboardCheck, labelKey: "menuReview" as const, href: "#" },
] as const;

export function DashboardPageContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Dashboard Header */}
      <DashboardHeader />

      {/* 2. Action Cards */}
      <DashboardActionCards />

      {/* 3. Status Card */}
      <DashboardStatusCard />

      {/* 4. Quick Menu Grid — 4x2 */}
      <section className="px-4">
        <div className="grid grid-cols-4 gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className="flex flex-col items-center gap-1.5 rounded-lg bg-cu-light-pink p-3 transition-colors hover:bg-cu-light-pink/70"
              >
                <div className="flex size-7 items-center justify-center">
                  <Icon className="size-6 text-primary" />
                </div>
                <span className="font-heading text-[11px] font-bold leading-tight text-cu-grey">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Announcements */}
      <DashboardAnnouncements />

      {/* 6. Footer */}
      <footer className="relative mt-6 overflow-hidden">
        {/* Wave decoration */}
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
          <p className="font-heading text-sm font-bold text-primary">
            RCU.C-MADONG
          </p>
          <p className="mt-0.5 text-[11px] text-cu-muted">Version 1.0</p>
        </div>
      </footer>
    </div>
  );
}
