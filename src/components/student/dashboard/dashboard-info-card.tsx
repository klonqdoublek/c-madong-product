"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useUser } from "@/hooks/use-user";
import { useInsights } from "@/hooks/use-insights";
import { useResidenceInfo } from "@/hooks/use-buildings";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, Sparkles, Calendar, Building2, BedDouble, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ALL_MENU_ITEMS } from "@/stores/menu-store";
import type { Database } from "@/lib/supabase/types";

type Insight = Database["public"]["Tables"]["ai_insights"]["Row"];

const AUTO_ADVANCE_MS = 5000;
const DRAG_THRESHOLD_PX = 6;

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const HOME_SEARCH_ALIASES: Record<string, string[]> = {
  billing: ["บิล", "ค่าใช้จ่าย", "ชำระเงิน", "bill", "payment"],
  repair: ["ซ่อม", "แจ้งซ่อม", "maintenance", "repair"],
  parcel: ["พัสดุ", "ของ", "parcel", "package"],
  news: ["ข่าว", "ประกาศ", "announcement", "news"],
  calendar: ["ปฏิทิน", "กิจกรรม", "calendar", "event"],
  info: ["ข้อมูล", "ระเบียบ", "information", "rule"],
  review: ["ประเมิน", "รีวิว", "evaluation", "review"],
  emergency: ["ฉุกเฉิน", "เบอร์โทร", "emergency", "phone"],
  forms: ["เอกสาร", "แบบฟอร์ม", "documents", "forms"],
  profile: ["บัญชี", "โปรไฟล์", "profile", "account"],
  score: ["คะแนน", "score"],
  settings: ["ตั้งค่า", "settings"],
};

function parseValidDate(dateStr: string | null): Date | null {
  if (!dateStr || dateStr.trim().toUpperCase() === "N/A") return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatThaiDate(dateStr: string | null): string | null {
  const d = parseValidDate(dateStr);
  if (!d) return null;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function daysUntil(dateStr: string | null): number | null {
  const target = parseValidDate(dateStr);
  if (!target) return null;
  const now = new Date();
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
  const remaining = daysUntil(deadline);
  const createdAtLabel = formatThaiDate(insight.created_at);
  const deadlineLabel = formatThaiDate(deadline);
  const dateRange =
    createdAtLabel && deadlineLabel
      ? `${createdAtLabel} - ${deadlineLabel}`
      : deadlineLabel ?? createdAtLabel ?? "ยังไม่ระบุวันที่";

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

          <p className="mt-1 line-clamp-2 pb-0.5 font-heading text-base leading-normal font-bold text-primary">
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
  const boundedActiveIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));

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
      const next = (boundedActiveIndex + 1) % items.length;
      scrollToIndex(next);
      autoAdvanceTimeoutRef.current = null;
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, [boundedActiveIndex, items.length, isDragging, isHovered, scrollToIndex]);

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
          <Sparkles className="size-2.5 text-cu-task-green" />
          <p className="text-xs font-bold text-cu-grey">
            <span className="text-cu-task-green">{items.length} รายการ </span>
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
                  index === boundedActiveIndex ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("th-TH");
  const searchResults = useMemo(() => {
    const query = normalizedSearchQuery;

    return ALL_MENU_ITEMS.map((item) => {
      const label = t(item.labelKey);
      const aliases = HOME_SEARCH_ALIASES[item.id] ?? [];
      return {
        ...item,
        label,
        searchText: [label, item.id, ...aliases].join(" ").toLocaleLowerCase("th-TH"),
      };
    }).filter((item) => !query || item.searchText.includes(query));
  }, [normalizedSearchQuery, t]);

  return (
    <div className="relative mx-auto w-[320px]">
      {/* Pink gradient card — header only, fixed height */}
      <div
        className="relative h-[110px] rounded-xl border border-black/10"
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
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="ค้นหาเมนู"
            className="mt-0.5 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <Search className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* White action card — overlaps pink card, uses negative margin for natural doc-flow height */}
      <div className="-mt-[41px] relative z-10 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-card">
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
            <Sparkles className="size-2.5 text-cu-task-green" />
            <p className="text-xs text-cu-grey">
              <span className="text-cu-task-green">0 รายการ </span>
              ที่ยังไม่ได้ทำ
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isSearchOpen}
        onOpenChange={(open) => {
          setIsSearchOpen(open);
          if (!open) setSearchQuery("");
        }}
      >
        <DialogContent
          className="top-6 translate-y-0 gap-3 rounded-2xl border-black/10 bg-cu-cream-light p-4 shadow-xl sm:top-[50%] sm:translate-y-[-50%]"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading text-base font-bold text-cu-grey">
              ค้นหาบนหน้าแรก
            </DialogTitle>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              aria-label="ปิดการค้นหา"
              className="flex size-8 items-center justify-center rounded-full bg-white text-cu-grey shadow-sm"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cu-muted" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ค้นหา เช่น แจ้งซ่อม พัสดุ ประกาศ"
              className="h-11 rounded-full border-black/10 bg-white pl-9 text-sm"
            />
          </div>

          <div className="max-h-[50dvh] space-y-2 overflow-y-auto pr-1">
            {searchResults.length > 0 ? (
              searchResults.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-sm transition-colors active:bg-cu-pink-tint"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-cu-light-pink">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-cu-grey">{item.label}</p>
                      <p className="text-[11px] text-cu-muted">{item.href}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="rounded-xl bg-white p-4 text-center text-sm text-cu-muted">
                ไม่พบเมนูที่ค้นหา
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
