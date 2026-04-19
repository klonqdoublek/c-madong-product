"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Banknote,
  Wrench,
  Package,
  Megaphone,
  ShieldAlert,
  CalendarDays,
  Info,
  ClipboardCheck,
  HelpCircle,
  Phone,
  Star,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGES = [
  [
    { icon: Banknote, labelKey: "menuBilling" as const, href: "/billing" },
    { icon: Wrench, labelKey: "menuRepair" as const, href: "/maintenance" },
    { icon: Package, labelKey: "menuParcel" as const, href: "/parcels" },
    { icon: Megaphone, labelKey: "menuNews" as const, href: "/announcements" },
    { icon: ShieldAlert, labelKey: "menuEmergency" as const, href: "/emergency" },
    { icon: CalendarDays, labelKey: "menuCalendar" as const, href: "/events" },
    { icon: Info, labelKey: "menuInfo" as const, href: "#" },
    { icon: ClipboardCheck, labelKey: "menuReview" as const, href: "#" },
  ],
  [
    { icon: Star, labelKey: "menuScore" as const, href: "/score" },
    { icon: Phone, labelKey: "menuContact" as const, href: "#" },
    { icon: FileText, labelKey: "menuDocs" as const, href: "#" },
    { icon: HelpCircle, labelKey: "menuHelp" as const, href: "#" },
  ],
];

const TOTAL_PAGES = PAGES.length;

export function DashboardQuickMenu() {
  const t = useTranslations("dashboard");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActivePage(page);
  }, []);

  return (
    <div className="pb-3">
      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {PAGES.map((items, pageIdx) => (
          <div
            key={pageIdx}
            className="grid w-full flex-shrink-0 snap-start grid-cols-4 gap-x-3 gap-y-2"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-[65px] w-[70px] items-center justify-center rounded-lg border border-black/5 bg-[#FFFEF5]">
                    <Icon className="size-6 text-primary" />
                  </div>
                    <span className="min-h-[22px] leading-5 overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs font-bold text-cu-grey">
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {TOTAL_PAGES > 1 && (
        <div className="mt-4 flex items-center justify-center gap-[3px]">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all",
                i === activePage
                  ? "h-1 w-[23px] bg-primary"
                  : "size-1 bg-[#F9E1E9]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
