"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUpcomingEvents } from "@/hooks/use-events";

export function DashboardAnnouncements() {
  const t = useTranslations("dashboard");
  const { data: events, isLoading } = useUpcomingEvents();

  const displayEvents = (events ?? []).slice(0, 4);

  if (isLoading) {
    return (
      <section className="space-y-2.5 px-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-foreground">
            {t("announcementsTitle")}
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-14 w-16 animate-pulse rounded-lg bg-cu-light-pink" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <section className="space-y-2.5 px-4">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("announcementsTitle")}
        </h2>
        <p className="text-sm text-cu-muted">{t("noAnnouncements")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-2.5 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("announcementsTitle")}
        </h2>
        <Link
          href="/events"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {displayEvents.map((event, index) => {
          const eventDate = event.event_date
            ? new Date(event.event_date)
            : event.start_datetime
              ? new Date(event.start_datetime)
              : null;

          const isToday = eventDate
            ? isSameDay(eventDate, new Date())
            : false;

          const dateLabel = isToday
            ? t("today")
            : eventDate
              ? formatShortDate(eventDate)
              : "";

          const timeLabel = event.start_datetime
            ? formatTime(new Date(event.start_datetime))
            : "";

          // Badge color based on position
          const badgeBg =
            index === 0
              ? "bg-primary text-white"
              : index === 1
                ? "bg-cu-light-pink text-cu-grey"
                : "bg-cu-pink-tint text-cu-grey";

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="flex gap-3 rounded-lg transition-colors hover:bg-cu-pink-tint/50"
            >
              {/* Date badge */}
              <div
                className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-lg px-2 py-2 ${badgeBg}`}
              >
                <span className="text-[11px] font-bold leading-tight">
                  {dateLabel}
                </span>
                {timeLabel && (
                  <span className="text-[10px] leading-tight opacity-80">
                    {timeLabel}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start gap-1.5">
                  <p className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-1">
                    {event.title_th || event.title}
                  </p>
                  {event.is_mandatory && (
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                      {t("important")}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-cu-muted line-clamp-1">
                  {event.description_th || event.description || ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShortDate(date: Date): string {
  const day = date.getDate();
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${day} ${months[date.getMonth()]}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
