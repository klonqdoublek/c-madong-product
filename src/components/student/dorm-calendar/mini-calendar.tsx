"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDormCalendarDates } from "@/hooks/use-dorm-calendar";
import { cn } from "@/lib/utils";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_DAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function MiniCalendar({
  onDateSelect,
}: {
  onDateSelect?: (date: Date) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { data: eventDays } = useDormCalendarDates(year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();
  const isCurrentMonth = year === todayY && month === todayM;

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="rounded-xl bg-[#fffbf1] p-3 shadow-sm border border-black/5">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading text-[20px] font-bold text-[#dd598b]">
            {THAI_MONTHS[month]}
          </p>
          <p className="font-sans text-xs text-[#565655]/60">
            วันนี้ {isCurrentMonth ? `วันที่ ${todayD}` : ""}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={prev}
            className="flex size-[30px] items-center justify-center rounded-full border border-black/15 bg-[#fffef5]"
          >
            <ChevronLeft className="size-4 text-[#565655]" />
          </button>
          <button
            onClick={next}
            className="flex size-[30px] items-center justify-center rounded-full border border-black/15 bg-[#fffef5]"
          >
            <ChevronRight className="size-4 text-[#565655]" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold text-[#565655]">
        {THAI_DAYS_SHORT.map((d, i) => (
          <span key={d} className={cn(i === 0 || i === 6 ? "opacity-40" : "")}>
            {d}
          </span>
        ))}
      </div>

      {/* Date grid */}
      <div className="mt-1 grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dow = (firstDow + i) % 7;
          const isWeekend = dow === 0 || dow === 6;
          const isToday = isCurrentMonth && day === todayD;
          const hasItem = eventDays?.has(day);

          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(new Date(year, month, day))}
              className="flex flex-col items-center py-0.5"
            >
              <span
                className={cn(
                  "flex size-[22px] items-center justify-center rounded-full text-[11px] font-bold",
                  isToday && "bg-[#dd598b] text-white",
                  isWeekend && !isToday && "opacity-40 text-[#565655]",
                  !isToday && !isWeekend && "text-[#565655]"
                )}
              >
                {day}
              </span>
              {hasItem && (
                <motion.div
                  animate={isToday ? {} : { opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "mt-0.5 size-[4px] rounded-full",
                    isToday ? "bg-white" : "bg-[#dd598b]"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
