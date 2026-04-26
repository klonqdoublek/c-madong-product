"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDormCalendar } from "@/hooks/use-dorm-calendar";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const DAY_HEADERS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DashboardCalendar() {
  const t = useTranslations("dashboard");
  const { data: calendarItems } = useDormCalendar({ status: "pending", limit: 20 });
  // Adapt to the shape this component expects
  const events = (calendarItems ?? []).map((item) => ({
    id: item.id,
    event_date: item.dueAt,
    start_datetime: item.dueAt,
    title_th: item.titleTh,
    title: item.titleTh,
  }));

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();
  const isCurrentMonth = viewMonth === todayMonth && viewYear === todayYear;

  // Build event day set for current view month
  const eventDays = useMemo(() => {
    const days = new Set<number>();
    (events ?? []).forEach((e) => {
      const dateStr = e.event_date || e.start_datetime;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        days.add(d.getDate());
      }
    });
    return days;
  }, [events, viewMonth, viewYear]);

  // Upcoming events for right panel (next 3)
  const upcomingThree = useMemo(() => {
    return (events ?? []).slice(0, 3);
  }, [events]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  return (
    <section className="mt-4 px-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CalendarDays className="size-5 text-[#3F3F3D]" />
          <span className="font-heading text-sm font-bold text-[#3F3F3D]">
            ปฏิทินหอพัก
          </span>
        </div>
        <Link href="/dorm-calendar" className="text-xs font-bold text-cu-grey underline">
          {t("viewAll")}
        </Link>
      </div>

      {/* Calendar + upcoming */}
      <div className="mt-2 flex gap-2">
        {/* Left: mini calendar */}
        <div className="flex-1 rounded-xl bg-[#FFFEF5] p-3">
          <p className="font-heading text-xl font-bold text-primary">
            {THAI_MONTHS[viewMonth]}
          </p>

          {/* Day headers */}
          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-xs font-bold text-cu-grey">
            {DAY_HEADERS.map((d, i) => (
              <span key={d} className={cn(i === 0 || i === 6 ? "opacity-50" : "")}>
                {d}
              </span>
            ))}
          </div>

          {/* Day numbers */}
          <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center text-xs font-bold text-cu-grey">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayOfWeek = (firstDay + i) % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = isCurrentMonth && day === todayDate;
              const hasEvent = eventDays.has(day);

              return (
                <div key={day} className="flex flex-col items-center py-0.5">
                  <span
                    className={cn(
                      "flex size-[22px] items-center justify-center rounded-full text-xs",
                      isToday && "bg-primary text-white",
                      isWeekend && !isToday && "opacity-50"
                    )}
                  >
                    {day}
                  </span>
                  {hasEvent && !isToday && (
                    <div className="mt-0.5 size-[5px] rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: upcoming events */}
        <div className="w-[124px] rounded-xl bg-[#FFFEF5] p-3">
          <p className="text-[10px] font-bold text-cu-grey">เร็วๆนี้</p>
          <div className="mt-2 flex flex-col">
            {upcomingThree.map((event, idx) => {
              const dateStr = event.event_date || event.start_datetime;
              const d = dateStr ? new Date(dateStr) : null;
              const dateLabel = d
                ? `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`
                : "";
              const title = event.title_th || event.title || "";

              return (
                <div key={event.id}>
                  {idx > 0 && <div className="my-2 h-px bg-black/5" />}
                  <p className="font-heading text-sm font-bold text-primary">
                    {dateLabel}
                  </p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-cu-grey line-clamp-2">
                    {title}
                  </p>
                </div>
              );
            })}
            {upcomingThree.length === 0 && (
              <p className="text-xs text-cu-grey/50">ไม่มีกิจกรรม</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
