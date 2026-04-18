"use client";

import { useInsights } from "@/hooks/use-insights";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, Calendar } from "lucide-react";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export function DashboardAdaptiveCard() {
  const t = useTranslations("dashboard");
  const { data: insights } = useInsights();

  const pending = (insights ?? []).filter((i) => !i.dismissed_at);
  const first = pending[0];

  if (!first) {
    return (
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-2.5 text-[#52AD7E]" />
          <p className="text-xs text-cu-grey">
            <span className="text-[#52AD7E]">0 รายการ </span>
            ที่ยังไม่ได้ทำ
          </p>
        </div>
        <p className="mt-2 text-sm text-cu-grey/60">ไม่มีรายการค้างอยู่</p>
      </div>
    );
  }

  const deadline = first.deadline;
  const remaining = deadline ? daysUntil(deadline) : null;
  const dateRange = deadline
    ? `${formatThaiDate(first.created_at)} - ${formatThaiDate(deadline)}`
    : formatThaiDate(first.created_at);

  return (
    <div className="px-5 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-2.5 text-[#52AD7E]" />
          <p className="text-xs text-cu-grey">
            <span className="text-[#52AD7E]">{pending.length} รายการ </span>
            ที่ยังไม่ได้ทำ
          </p>
        </div>
        {remaining !== null && (
          <p className="text-[10px] font-bold text-primary">
            เหลืออีก {remaining} วัน!
          </p>
        )}
      </div>

      {/* Task title */}
      <p className="mt-2 font-heading text-base font-bold text-primary">
        {first.title_th}
      </p>

      {/* Date range */}
      <div className="mt-1 flex items-center gap-1">
        <Calendar className="size-3 text-cu-grey" />
        <p className="text-[10px] text-cu-grey">{dateRange}</p>
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-black/5" />

      {/* CTAs */}
      <div className="flex items-center gap-4">
        {first.action_url ? (
          <Link
            href={first.action_url}
            className="flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-white"
          >
            {t("doNow")}
          </Link>
        ) : (
          <button className="flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-white">
            {t("doNow")}
          </button>
        )}
        <button className="text-xs font-bold text-cu-grey underline">
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}
