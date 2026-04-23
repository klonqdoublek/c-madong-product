"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useUser } from "@/hooks/use-user";
import { useInsights } from "@/hooks/use-insights";
import { useResidenceInfo } from "@/hooks/use-buildings";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, Sparkles, Calendar, Building2, BedDouble } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Insight = Database["public"]["Tables"]["ai_insights"]["Row"];

const AUTO_ADVANCE_MS = 5000;
const DRAG_THRESHOLD_PX = 6;

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

function SkeletonBar({
  className,
  tone = "cream",
}: {
  className: string;
  tone?: "cream" | "white" | "pink";
}) {
  const toneClass =
    tone === "white"
      ? "bg-white/20"
      : tone === "pink"
        ? "bg-primary/20"
        : "bg-[#E8DFC8]";

  return <div className={`skeleton-sweep rounded-full ${toneClass} ${className}`} />;
}

function ActionSlide({
  insight,
  t,
}: {
  insight: Insight;
  t: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  const deadline = insight.deadline;
  const remaining = deadline ? daysUntil(deadline) : null;
  const dateRange = deadline
    ? `${formatThaiDate(insight.created_at)} - ${formatThaiDate(deadline)}`
    : formatThaiDate(insight.created_at);

  return (
    <div className="w-full shrink-0 snap-center">
      <div className="flex min-h-[74px] flex-col justify-between">
        <div>
          <div className="flex items-center justify-end">
            {remaining !== null && (
              <p className="text-[10px] font-bold text-primary">
                เหลืออีก {remaining} วัน!
              </p>
            )}
          </div>

          <p className="mt-1 line-clamp-2 min-h-[38px] font-heading text-base leading-tight font-bold text-primary">
            {insight.title_th}
          </p>

          <div className="mt-1 flex items-center gap-1">
            <Calendar className="size-3 text-cu-grey" />
            <p className="text-[10px] text-cu-grey">{dateRange}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          {insight.action_url ? (
            <Link
              href={insight.action_url}
              className="flex items-center justify-center rounded-full bg-primary px-6 py-1.5 text-sm font-bold text-white"
            >
              {t("doNow")}
            </Link>
          ) : (
            <button className="flex items-center justify-center rounded-full bg-primary px-6 py-1.5 text-sm font-bold text-white">
              {t("doNow")}
            </button>
          )}
          <button className="shrink-0 text-xs font-bold text-cu-grey underline">
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCardCarousel({
  items,
  t,
}: {
  items: Insight[];
  t: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
  });
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      if (!container) return;

      const nextIndex = Math.max(0, Math.min(index, items.length - 1));
      container.scrollTo({
        left: container.clientWidth * nextIndex,
        behavior,
      });
      setActiveIndex(nextIndex);
    },
    [items.length]
  );

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const width = container.clientWidth || 1;
      const nextIndex = Math.round(container.scrollLeft / width);
      setActiveIndex(Math.max(0, Math.min(nextIndex, items.length - 1)));
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  useEffect(() => {
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (items.length <= 1 || isDragging || isHovered) return;

    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      const next = (activeIndex + 1) % items.length;
      scrollToIndex(next);
      autoAdvanceTimeoutRef.current = null;
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, [activeIndex, items.length, isDragging, isHovered, scrollToIndex]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const container = scrollRef.current;
    if (!container) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      hasDragged: false,
    };
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    const dragState = dragStateRef.current;

    if (!container || dragState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragState.startX;
    if (!dragState.hasDragged && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

    if (!dragState.hasDragged) {
      dragState.hasDragged = true;
      suppressClickRef.current = true;
      setIsDragging(true);
    }

    event.preventDefault();
    container.scrollLeft = dragState.startScrollLeft - deltaX;
  };

  const endDrag = (pointerId: number) => {
    const container = scrollRef.current;
    const dragState = dragStateRef.current;

    if (!container || dragState.pointerId !== pointerId) return;

    if (container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId);
    }

    setIsDragging(false);
    const width = container.clientWidth || 1;
    const nextIndex = Math.round(container.scrollLeft / width);
    const didDrag = dragState.hasDragged;
    dragState.pointerId = -1;
    dragState.hasDragged = false;
    scrollToIndex(nextIndex);
    if (didDrag) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Sparkles className="size-2.5 text-[#52AD7E]" />
          <p className="text-xs font-bold text-cu-grey">
            <span className="text-[#52AD7E]">{items.length} รายการ </span>
            ที่ยังไม่ได้ทำ
          </p>
        </div>
      </div>

      <div
        className="mt-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          className={`scrollbar-hide flex overflow-x-auto [touch-action:pan-y] select-none ${isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"}`}
          style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => endDrag(event.pointerId)}
          onPointerCancel={(event) => endDrag(event.pointerId)}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
          }}
        >
          {items.map((item) => (
            <ActionSlide key={item.id} insight={item} t={t} />
          ))}
        </div>

        {items.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`ไปยังรายการ ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
                }`}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
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
                  <SkeletonBar className="h-5 w-36" tone="white" />
                  <SkeletonBar className="mt-1 h-3.5 w-28" tone="white" />
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
              <SkeletonBar className="h-3.5 w-28" />
              <SkeletonBar className="h-3 w-16" />
            </div>
            <SkeletonBar className="h-5 w-44" />
            <SkeletonBar className="h-3 w-32" />
            <div className="mt-2 flex items-center justify-between">
              <SkeletonBar className="h-9 w-24" tone="pink" />
              <SkeletonBar className="h-3 w-20" />
            </div>
          </div>
        ) : first ? (
          <ActionCardCarousel items={pending} t={t} />
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
