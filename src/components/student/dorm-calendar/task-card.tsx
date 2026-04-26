"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CalendarIcon,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import type { DormCalendarItem, DormCalendarCategory } from "@/hooks/use-dorm-calendar";
import { CountdownBadge } from "./countdown-badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<DormCalendarCategory, string> = {
  reapplication:         "ยื่นขออยู่หอต่อ",
  cr54_upload:           "ผลลงทะเบียนเรียน (CR54)",
  shop_evaluation:       "แบบประเมินร้านค้า",
  fire_drill_theory:     "อบรมดับเพลิง (ทฤษฎี)",
  fire_drill_practical:  "อบรมดับเพลิง (ปฏิบัติ)",
  dorm_meeting:          "ประชุมหอพัก",
  dorm_inspection:       "ตรวจหอพัก",
  important_announcement: "ประกาศจำเป็น",
  bed_selection:         "เลือกเตียงประจำปี",
};

interface TaskCardProps {
  item: DormCalendarItem;
  onAcknowledge?: (item: DormCalendarItem) => void;
  loading?: boolean;
}

export const TaskCard = memo(function TaskCard({ item, onAcknowledge, loading }: TaskCardProps) {
  const t = useTranslations("dormCalendar");
  const isDone = !!item.completedAt;
  const isInfo = item.ctaType === "none";

  const handleAck = useCallback(() => {
    if (!isDone && onAcknowledge) onAcknowledge(item);
  }, [isDone, onAcknowledge, item]);

  const dueDate = new Date(item.dueAt);
  const startDate = new Date(item.startAt);

  const dateLabel = formatDateRange(startDate, dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDone ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "relative rounded-xl border bg-[#fffbf1] px-3 py-4",
        isDone
          ? "border-black/5"
          : "border-black/10",
        "active:scale-[0.98] active:-translate-y-[1px] transition-transform"
      )}
    >
      {/* Done overlay checkmark */}
      {isDone && (
        <div className="absolute right-3 top-3">
          <CheckCircle2 className="size-5 text-[#4da376]" />
        </div>
      )}

      {/* Header */}
      <div className="flex gap-2">
        {/* Left border accent */}
        <div className={cn(
          "w-[3px] shrink-0 self-stretch rounded-full",
          isDone ? "bg-[#4da376]" : "bg-[#dd598b]"
        )} />

        <div className="flex-1 space-y-1.5">
          {/* Title */}
          <p className={cn(
            "font-heading text-base font-bold leading-tight",
            isDone ? "text-[#565655]/60 line-through" : "text-[#dd598b]"
          )}>
            {item.titleTh}
          </p>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {item.isRequired && (
              <span className="rounded-full bg-[#dd598b]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#dd598b]">
                จำเป็น
              </span>
            )}
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] text-[#565655]">
              {item.audience}
            </span>
          </div>
        </div>

        {/* More menu (placeholder) */}
        {!isDone && (
          <button className="shrink-0 p-1 opacity-40" aria-label="More options">
            <MoreHorizontal className="size-5 text-[#565655]" />
          </button>
        )}
      </div>

      {/* Date + countdown */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <CalendarIcon className="size-3 text-[#565655]" />
          <span className="text-[10px] text-[#565655]">{dateLabel}</span>
        </div>
        {!isDone && <CountdownBadge dueAt={item.dueAt} />}
      </div>

      {/* CTA button */}
      {!isDone && !isInfo && (
        <div className="mt-3">
          <CtaButton item={item} onAcknowledge={handleAck} loading={loading} />
        </div>
      )}
    </motion.div>
  );
});

function CtaButton({
  item,
  onAcknowledge,
  loading,
}: {
  item: DormCalendarItem;
  onAcknowledge: () => void;
  loading?: boolean;
}) {
  const ctaLabel = getCtaLabel(item.category, item.ctaType);

  if (item.ctaType === "external_url" && item.ctaUrl) {
    return (
      <a
        href={item.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#dd598b] text-sm font-bold text-white"
      >
        {ctaLabel}
        <ExternalLink className="size-3.5" />
      </a>
    );
  }

  if (item.ctaType === "read_more") {
    return (
      <Link
        href={`/announcements/${item.sourceId}`}
        className="flex h-10 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white"
      >
        {ctaLabel}
      </Link>
    );
  }

  if (item.ctaType === "internal_eval" && item.ctaEventId) {
    return (
      <Link
        href={`/events/${item.ctaEventId}/evaluate`}
        className="flex h-10 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white active:scale-95 transition-transform"
      >
        {ctaLabel}
      </Link>
    );
  }

  if (item.ctaType === "internal_quiz") {
    return (
      <Link
        href={`/dorm-calendar/fire-drill-quiz/${item.id}`}
        className="flex h-10 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white active:scale-95 transition-transform"
      >
        {ctaLabel}
      </Link>
    );
  }

  if (item.ctaType === "internal_bed_selection") {
    return (
      <Link
        href="/bed-selection"
        className="flex h-10 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white active:scale-95 transition-transform"
      >
        {ctaLabel}
      </Link>
    );
  }

  // acknowledge
  return (
    <button
      onClick={onAcknowledge}
      disabled={loading}
      className="flex h-10 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white disabled:opacity-60 active:scale-95 transition-transform"
    >
      {loading ? "กำลังบันทึก..." : ctaLabel}
    </button>
  );
}

function getCtaLabel(category: DormCalendarCategory, ctaType: string): string {
  if (ctaType === "read_more") return "อ่านประกาศ";
  if (ctaType === "internal_quiz") return "เริ่มทำแบบทดสอบ";
  if (ctaType === "internal_bed_selection") return "เลือกเตียงตอนนี้";
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

  if (sameDay) {
    return fmt(end);
  }
  return `${fmt(start)} – ${fmt(end)}`;
}

const THAI_MONTHS_SHORT = [
  "ม.ค", "ก.พ", "มี.ค", "เม.ย", "พ.ค", "มิ.ย",
  "ก.ค", "ส.ค", "ก.ย", "ต.ค", "พ.ย", "ธ.ค",
];
