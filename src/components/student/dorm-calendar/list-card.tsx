"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { CalendarIcon, CheckCircle2, ExternalLink } from "lucide-react";
import type { DormCalendarItem, DormCalendarCategory } from "@/hooks/use-dorm-calendar";
import { cn } from "@/lib/utils";

interface ListCardProps {
  item: DormCalendarItem;
  onAcknowledge?: (item: DormCalendarItem) => void;
  loading?: boolean;
}

export const ListCard = memo(function ListCard({ item, onAcknowledge, loading }: ListCardProps) {
  const isDone = !!item.completedAt;
  const isInfo = item.ctaType === "none";

  const handleAck = useCallback(() => {
    if (!isDone && onAcknowledge) onAcknowledge(item);
  }, [isDone, onAcknowledge, item]);

  const dateLabel = formatDateRange(new Date(item.startAt), new Date(item.dueAt));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDone ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Top content section */}
      <div className={cn(
        "border border-black/10 rounded-t-xl px-3 pt-3.5 pb-[72px] bg-cu-cream-light",
        isDone && "rounded-b-xl pb-3.5"
      )}>
        {/* Done checkmark */}
        {isDone && (
          <div className="absolute right-3 top-3">
            <CheckCircle2 className="size-5 text-cu-task-green-dark" />
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {item.isRequired && (
            <span className="rounded-full bg-[rgba(255,0,0,0.15)] px-2.5 py-[3px] text-[12px] font-bold text-red-600 leading-tight">
              บังคับ
            </span>
          )}
          {item.scorePoints > 0 && !isDone && (
            <span className="rounded-full border border-primary px-3 py-[3px] text-[10px] font-bold text-primary leading-tight">
              คะแนนหอพัก
            </span>
          )}
        </div>

        {/* Title */}
        <p className={cn(
          "font-heading text-base font-bold leading-tight pb-1",
          isDone ? "text-cu-grey/60 line-through" : "text-cu-grey"
        )}>
          {item.titleTh}
        </p>

        {/* Description */}
        {item.descriptionTh && (
          <p className="text-[12px] text-cu-grey/70 leading-normal line-clamp-2 mt-0.5">
            {item.descriptionTh}
          </p>
        )}
      </div>

      {/* Footer section — only when not done */}
      {!isDone && !isInfo && (
        <div className="border border-t-0 border-black/10 rounded-b-xl bg-cu-calendar-footer px-3 py-2 flex items-center justify-between gap-4 -mt-px">
          {/* Date + publisher */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-cu-cream-light px-2.5 py-1">
                <CalendarIcon className="size-3.5 text-cu-grey/60 shrink-0" />
                <span className="text-[10px] text-cu-grey/80 whitespace-nowrap">{dateLabel}</span>
              </div>
            </div>
            <p className="text-[10px] text-cu-grey/60 pl-0.5">
              เผยแพร่โดย • เจ้าหน้าที่หอพัก
            </p>
          </div>

          {/* CTA button */}
          <div className="shrink-0">
            <ListCtaButton item={item} onAcknowledge={handleAck} loading={loading} />
          </div>
        </div>
      )}

      {/* Footer for info-only items: just date */}
      {!isDone && isInfo && (
        <div className="border border-t-0 border-black/10 rounded-b-xl bg-cu-calendar-footer px-3 py-2 -mt-px">
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-cu-grey/60 shrink-0" />
            <span className="text-[10px] text-cu-grey/80">{dateLabel}</span>
          </div>
          <p className="text-[10px] text-cu-grey/60 mt-0.5">
            เผยแพร่โดย • เจ้าหน้าที่หอพัก
          </p>
        </div>
      )}
    </motion.div>
  );
});

function ListCtaButton({
  item,
  onAcknowledge,
  loading,
}: {
  item: DormCalendarItem;
  onAcknowledge: () => void;
  loading?: boolean;
}) {
  const label = getCtaLabel(item.category, item.ctaType);

  const btnClass =
    "flex h-9 min-w-[120px] items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-white active:scale-95 transition-transform";

  if (item.ctaType === "external_url" && item.ctaUrl) {
    return (
      <a href={item.ctaUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        {label}
        <ExternalLink className="size-3.5" />
      </a>
    );
  }

  if (item.ctaType === "read_more") {
    return (
      <Link href={`/announcements/${item.sourceId}`} className={btnClass}>
        {label}
      </Link>
    );
  }

  if (item.ctaType === "internal_eval" && item.ctaEventId) {
    return (
      <Link href={`/events/${item.ctaEventId}/evaluate`} className={btnClass}>
        {label}
      </Link>
    );
  }

  if (item.ctaType === "internal_quiz") {
    return (
      <Link href={`/dorm-calendar/fire-drill-quiz/${item.id}`} className={btnClass}>
        {label}
      </Link>
    );
  }

  if (item.ctaType === "internal_bed_selection") {
    return (
      <Link href="/bed-selection" className={btnClass}>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onAcknowledge} disabled={loading} className={cn(btnClass, "disabled:opacity-60")}>
      {loading ? "กำลังบันทึก..." : label}
    </button>
  );
}

function getCtaLabel(category: DormCalendarCategory, ctaType: string): string {
  if (ctaType === "read_more") return "อ่านประกาศ";
  if (ctaType === "internal_quiz") return "เริ่มทำแบบทดสอบ";
  if (ctaType === "internal_bed_selection") return "เลือกเตียง";
  if (category === "dorm_meeting" || category === "dorm_inspection") return "รับทราบ";
  if (category === "fire_drill_practical") return "เข้าร่วม";
  return "ทำเลย";
}

function formatDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  const fmt = (d: Date) =>
    `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}. ${d.getFullYear() + 543 - 100}`;

  return sameDay ? fmt(end) : `${fmt(start)} – ${fmt(end)}`;
}

const THAI_MONTHS_SHORT = [
  "ม.ค", "ก.พ", "มี.ค", "เม.ย", "พ.ค", "มิ.ย",
  "ก.ค", "ส.ค", "ก.ย", "ต.ค", "พ.ย", "ธ.ค",
];
