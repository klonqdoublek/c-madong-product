"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUpcomingEvents } from "@/hooks/use-events";
import { CalendarDays } from "lucide-react";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function DashboardEventsSection() {
  const t = useTranslations("dashboard");
  const { data: events, isLoading } = useUpcomingEvents();

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">{t("announcements")}</h2>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 rounded-lg border bg-card p-3">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const displayEvents = (events ?? []).slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">{t("announcements")}</h2>
        <Link
          href="/events"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      {displayEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ไม่มีกิจกรรมในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayEvents.map((event, idx) => {
            const date = new Date(event.event_date);
            const day = date.getDate();
            const month = THAI_MONTHS_SHORT[date.getMonth()];
            const isPrimary = idx === 0;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block"
              >
                <div className="flex gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                  <div
                    className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-lg ${
                      isPrimary
                        ? "bg-primary text-white"
                        : "bg-secondary text-cu-grey"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">{day}</span>
                    <span className="text-[10px] leading-none">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {event.title_th || event.title}
                      </p>
                      {event.is_mandatory && (
                        <span className="shrink-0 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {t("important")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.location_th || event.location || ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
