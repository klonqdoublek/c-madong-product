"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUpcomingEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const EVENT_TYPE_BG: Record<string, string> = {
  mandatory: "bg-primary text-white",
  external: "bg-amber-500 text-white",
  internal: "bg-blue-500 text-white",
};

function formatDayMonth(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("th-TH", { day: "numeric" }),
    month: d.toLocaleDateString("th-TH", { month: "short" }),
  };
}

function MiniCalendar({ events }: { events: { event_date: string }[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDays = new Set(
    events
      .map((e) => new Date(e.event_date))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate())
  );

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prev() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function next() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="min-w-0">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-lg font-bold text-primary">{monthLabel}</p>
        <div className="flex gap-1">
          <button onClick={prev} className="rounded p-1 hover:bg-muted">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={next} className="rounded p-1 hover:bg-muted">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="mb-1 grid grid-cols-7 gap-px">
        {DAYS_TH.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const hasEvent = eventDays.has(day);
          return (
            <div key={day} className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-primary font-bold text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {day}
              </span>
              {hasEvent && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-teal-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardUpcomingEvents() {
  const t = useTranslations("admin.dashboardPage");
  const { data: events, isLoading } = useUpcomingEvents();

  const upcoming = (events ?? []).slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base">{t("calendarSection")}</CardTitle>
          <Link href="/admin/events" className="text-sm text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Left: mini calendar */}
          <MiniCalendar events={events ?? []} />

          {/* Right: upcoming events list */}
          <div className="min-w-0">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">{t("upcomingLabel")}</p>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("noUpcomingEvents")}</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((event, idx) => {
                  const { day, month } = formatDayMonth(event.event_date);
                  const typeBg = EVENT_TYPE_BG[event.event_type ?? "internal"] ?? EVENT_TYPE_BG.internal;
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 rounded-lg p-2.5 ${
                        isFirst ? "bg-primary/10" : "bg-muted/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-center text-xs font-bold leading-none ${
                          isFirst ? "bg-primary text-white" : "bg-white text-foreground shadow-sm"
                        }`}
                      >
                        <span className="text-sm">{day}</span>
                        <span className="text-[10px] font-normal opacity-80">{month}</span>
                      </div>
                      <p className={`truncate text-xs font-medium ${isFirst ? "text-primary" : "text-foreground"}`}>
                        {event.title_th ?? event.title}
                      </p>
                      <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBg}`}>
                        {event.event_type ?? "internal"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
