"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMenuStore, ALL_MENU_ITEMS } from "@/stores/menu-store";
import { cn } from "@/lib/utils";

export function DashboardQuickMenu() {
  const t = useTranslations("dashboard");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const { quickMenuOrder } = useMenuStore();

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActivePage(page);
  }, []);

  // Map IDs to full menu items
  const sortedItems = quickMenuOrder
    .map((id) => ALL_MENU_ITEMS.find((item) => item.id === id))
    .filter(Boolean);

  // Chunk items into pages of 8 (4x2 grid)
  const PAGES = [];
  for (let i = 0; i < sortedItems.length; i += 8) {
    PAGES.push(sortedItems.slice(i, i + 8));
  }

  const TOTAL_PAGES = PAGES.length;

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
            className="grid w-full flex-shrink-0 snap-start grid-cols-4 gap-x-3 gap-y-2 px-1"
          >
            {items.map((item) => {
              if (!item) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-[65px] w-[70px] items-center justify-center rounded-lg border border-black/5 bg-[#FFFEF5]">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <span className="min-h-[22px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] font-bold text-cu-grey px-0.5">
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
