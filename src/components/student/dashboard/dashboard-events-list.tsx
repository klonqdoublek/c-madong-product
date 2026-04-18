"use client";

import { useUpcomingEvents } from "@/hooks/use-events";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function DashboardEventsList() {
  const t = useTranslations("dashboard");
  const { data: events } = useUpcomingEvents();
  const items = (events ?? []).slice(0, 5);

  if (items.length === 0) return null;

  return (
    <section className="mt-4 px-4 pb-4">
      {items.map((event, idx) => {
        const dateStr = event.event_date || event.start_datetime || "";
        const d = dateStr ? new Date(dateStr) : null;
        const todayFlag = dateStr ? isToday(dateStr) : false;
        const isPriority = event.is_mandatory;
        const title = event.title_th || event.title || "";
        const desc = event.description_th || "";
        const time = event.start_datetime
          ? formatTime(event.start_datetime)
          : "";
        const dateLabel = d
          ? todayFlag
            ? t("today")
            : `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`
          : "";

        return (
          <div
            key={event.id}
            className={cn("flex items-center gap-3", idx > 0 && "mt-2")}
          >
            {/* Date badge */}
            <div
              className={cn(
                "flex h-[54px] w-[67px] flex-shrink-0 flex-col items-center justify-center rounded-lg",
                todayFlag ? "bg-primary" : ""
              )}
            >
              <span
                className={cn(
                  "font-heading text-sm font-bold whitespace-nowrap",
                  todayFlag ? "text-white" : "text-cu-grey"
                )}
              >
                {dateLabel}
              </span>
              {time && (
                <span className={cn("text-sm", todayFlag ? "text-[#FBF6E9]" : "text-cu-grey")}>
                  {time}
                </span>
              )}
            </div>

            {/* Event details */}
            <div className="relative flex-1 min-w-0">
              <p className="font-heading text-base font-bold text-cu-grey line-clamp-1">
                {title}
              </p>
              <p className="text-xs text-cu-grey/60 line-clamp-2">{desc}</p>

              {/* Important tag */}
              {isPriority && (
                <div className="absolute right-0 top-0 flex items-center gap-1 rounded-full bg-red-500 px-1 py-0.5">
                  <div className="size-[7px] rounded-full bg-white" />
                  <span className="text-xs font-bold text-white leading-none">
                    {t("important")}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
