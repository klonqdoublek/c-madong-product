"use client";

import { useUser } from "@/hooks/use-user";
import { useInsights } from "@/hooks/use-insights";
import { useResidenceInfo } from "@/hooks/use-buildings";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, Sparkles, Calendar, Building2, BedDouble } from "lucide-react";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export function DashboardInfoCard() {
  const t = useTranslations("dashboard");
  const { profile, isLoading: isUserLoading } = useUser();
  const { data: insights, isLoading: isInsightsLoading } = useInsights();
  const { data: residence, isLoading: isResidenceLoading } = useResidenceInfo({
    buildingId: profile?.building_id ?? null,
    roomId: profile?.room_id ?? null,
    bedId: profile?.bed_id ?? null,
  });

  const displayName = profile?.display_name || profile?.full_name_th || "---";
  const buildingName = residence?.building?.name_th || "---";
  const room = residence?.room;
  const bed = residence?.bed;
  const roomBed = room ? `${room.room_number} ${bed?.bed_label || ""}` : "----";

  const pending = (insights ?? []).filter((i) => !i.dismissed_at);
  const first = pending[0];
  const isProfileSectionLoading = isUserLoading || isResidenceLoading;
  const isTaskSectionLoading = isUserLoading || isInsightsLoading;

  const deadline = first?.deadline;
  const remaining = deadline ? daysUntil(deadline) : null;
  const dateRange = first
    ? deadline
      ? `${formatThaiDate(first.created_at)} - ${formatThaiDate(deadline)}`
      : formatThaiDate(first.created_at)
    : "";

  return (
    <div className="relative mx-auto h-[180px] w-[320px]">
      {/* Pink gradient card — top layer with user info */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] rounded-xl border border-black/10"
        style={{
          background:
            "linear-gradient(180deg, rgba(220,2,108,0.5) 0%, rgba(221,89,139,0.5) 100%), linear-gradient(90deg, #DD598B 0%, #DD598B 100%)",
          boxShadow: "1px 10px 21px 0px rgba(0,0,0,0.02)",
        }}
      >
        {/* Avatar + info */}
        <div className="flex items-start justify-between px-4 pt-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="size-[46px] overflow-hidden rounded-full bg-white/30 flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-pink-200 font-heading text-lg text-primary">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Name + room */}
            <div className="flex flex-col gap-0.5">
              {isProfileSectionLoading ? (
                <>
                  <div className="h-5 w-36 animate-pulse rounded-full bg-white/25" />
                  <div className="mt-1 h-3.5 w-28 animate-pulse rounded-full bg-white/20" />
                </>
              ) : (
                <>
                  <p className="font-heading text-base text-white">
                    สวัสดี, {displayName}!
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white">
                    <Building2 className="size-3.5" strokeWidth={1.5} />
                    <span>ตึก{buildingName}</span>
                    <BedDouble className="ml-0.5 size-3.5" strokeWidth={1.5} />
                    <span>{roomBed}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search icon */}
          <button className="mt-0.5 flex size-4 items-center justify-center">
            <Search className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* Cream card — overlaps pink card from y=69 */}
      <div className="absolute inset-x-0 top-[69px] min-h-[111px] rounded-xl border border-black/10 bg-[#FFFBF1] px-4 py-2.5">
        {isTaskSectionLoading ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 animate-pulse rounded-full bg-[#E8DFC8]" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-[#F0E6D2]" />
            </div>
            <div className="h-5 w-44 animate-pulse rounded-full bg-[#E8DFC8]" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-[#F0E6D2]" />
            <div className="mt-2 flex items-center justify-between">
              <div className="h-9 w-24 animate-pulse rounded-full bg-primary/20" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-[#F0E6D2]" />
            </div>
          </div>
        ) : first ? (
          <>
            {/* Sparkles row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles className="size-2.5 text-[#52AD7E]" />
                <p className="text-xs font-bold text-cu-grey">
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
            <p className="mt-1 font-heading text-base font-bold text-primary leading-tight">
              {first.title_th}
            </p>

            {/* Date range */}
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="size-3 text-cu-grey" />
              <p className="text-[10px] text-cu-grey">{dateRange}</p>
            </div>

            {/* CTAs */}
            <div className="mt-2 flex items-center justify-between">
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
          </>
        ) : (
          <div className="flex items-center gap-1">
            <Sparkles className="size-2.5 text-[#52AD7E]" />
            <p className="text-xs text-cu-grey">
              <span className="text-[#52AD7E]">0 รายการ </span>
              ที่ยังไม่ได้ทำ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
