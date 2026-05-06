"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyBookmarkedAnnouncements } from "@/hooks/use-announcements";
import { Bookmark, ChevronRight } from "lucide-react";

export function ProfileSavedSection() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { data: bookmarks, isLoading } = useMyBookmarkedAnnouncements();

  if (isLoading) {
    return (
      <div className="h-28 animate-pulse rounded-xl bg-white" />
    );
  }

  const items = bookmarks ?? [];

  return (
    <div className="rounded-xl bg-white p-4 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-cu-grey">
            {t("savedAnnouncements")}
          </h3>
        </div>
        {items.length > 10 && (
          <Link
            href="/announcements"
            className="flex items-center gap-0.5 text-xs text-primary"
          >
            {t("savedViewAll")}
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <Bookmark className="h-8 w-8 opacity-30" />
          <p className="text-xs">{t("noSavedAnnouncements")}</p>
        </div>
      )}

      {/* Horizontal scroll cards */}
      {items.length > 0 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {items.slice(0, 10).map((item: any) => {
            const announcement = item.announcements;
            if (!announcement) return null;
            const title =
              locale === "th"
                ? announcement.title_th
                : announcement.title_en || announcement.title_th;

            return (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.id}`}
                className="flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-border/50 transition-shadow hover:shadow-md"
              >
                {/* Cover image */}
                <div className="relative h-20 w-full bg-muted">
                  {announcement.cover_image ? (
                    <img
                      src={announcement.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Bookmark className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                  {announcement.category && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      {announcement.category}
                    </span>
                  )}
                </div>
                {/* Title */}
                <div className="p-2">
                  <p className="line-clamp-2 text-xs font-medium text-cu-grey">
                    {title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
