"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePublishedAnnouncements } from "@/hooks/use-announcements";
import { Newspaper } from "lucide-react";

export function DashboardAnnouncementsCarousel() {
  const t = useTranslations("dashboard");
  const { data: announcements } = usePublishedAnnouncements();
  const items = announcements ?? [];

  return (
    <section className="mt-4 px-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Newspaper className="size-5 text-[#3F3F3D]" />
          <span className="font-heading text-sm font-bold text-[#3F3F3D]">
            ประกาศและข่าวสาร
          </span>
        </div>
        <Link href="/announcements" className="text-xs font-bold text-cu-grey underline">
          {t("viewAll")}
        </Link>
      </div>

      {/* Carousel */}
      <div
        className="mt-2 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {items.slice(0, 10).map((item) => {
          const isPinned = item.is_pinned;
          return (
            <Link
              key={item.id}
              href={`/announcements/${item.id}`}
              className="relative flex-shrink-0 snap-start overflow-hidden rounded-xl bg-[#D9D9D9] w-[260px] h-[126px]"
            >
              {/* Cover image placeholder */}
              {item.cover_image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${item.cover_image})`,
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-200" />
              )}

              {/* Important badge */}
              {isPinned && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-1.5 py-0.5">
                  <div className="size-[7px] rounded-full bg-white" />
                  <span className="text-xs font-bold text-white leading-none">
                    {t("important")}
                  </span>
                </div>
              )}

              {/* Text overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 pt-6">
                <p className="font-heading text-base font-bold text-white line-clamp-1">
                  {item.title_th || ""}
                </p>
                <p className="mt-0.5 text-xs text-white/80 line-clamp-1">
                  {item.content_th || ""}
                </p>
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <div className="flex h-[126px] w-full items-center justify-center rounded-xl bg-[#FFFEF5]">
            <p className="text-sm text-cu-grey/50">ไม่มีประกาศ</p>
          </div>
        )}
      </div>
    </section>
  );
}
