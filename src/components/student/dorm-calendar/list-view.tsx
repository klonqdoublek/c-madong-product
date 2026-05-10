"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import {
  useDormCalendar,
  useAcknowledgeCalendarItem,
  useDormCalendarSemesters,
} from "@/hooks/use-dorm-calendar";
import type { DormCalendarItem, DormCalendarCategory } from "@/hooks/use-dorm-calendar";
import { TabBar } from "./tab-bar";
import { ListCard } from "./list-card";
import { TaskCardSkeletonList } from "./task-card-skeleton";
import { EmptyState } from "./empty-state";
import { formatSemesterLabel } from "@/lib/utils/semester";
import { cn } from "@/lib/utils";

interface ListViewProps {
  tab: "pending" | "done" | "all";
  onTabChange: (t: "pending" | "done" | "all") => void;
  semester?: string;
  onSemesterChange?: (s: string | undefined) => void;
  category?: DormCalendarCategory;
  onCategoryChange?: (c: DormCalendarCategory | undefined) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

const CATEGORY_LABELS: Record<DormCalendarCategory, string> = {
  reapplication:          "ยื่นขออยู่หอต่อ",
  cr54_upload:            "ผลลงทะเบียน CR54",
  shop_evaluation:        "ประเมินร้านค้า",
  fire_drill_theory:      "ดับเพลิง (ทฤษฎี)",
  fire_drill_practical:   "ดับเพลิง (ปฏิบัติ)",
  dorm_meeting:           "ประชุมหอพัก",
  dorm_inspection:        "ตรวจหอพัก",
  important_announcement: "ประกาศจำเป็น",
  bed_selection:          "เลือกเตียงประจำปี",
};

export function ListView({
  tab,
  onTabChange,
  semester,
  onSemesterChange,
  category,
  onCategoryChange,
  search,
  onSearchChange,
}: ListViewProps) {
  const { data: allItems, isLoading } = useDormCalendar({ status: "all" });
  const { data: semesters } = useDormCalendarSemesters();
  const { mutate: acknowledge, isPending: isAcking } = useAcknowledgeCalendarItem();
  const [filterOpen, setFilterOpen] = useState(false);

  // Client-side filter
  const filtered = useMemo(() => {
    let list = allItems ?? [];
    if (tab === "pending") list = list.filter((i) => !i.completedAt);
    if (tab === "done")    list = list.filter((i) => !!i.completedAt);
    if (semester) list = list.filter((i) => i.semester === semester);
    if (category) list = list.filter((i) => i.category === category);
    if (search)   list = list.filter((i) =>
      i.titleTh.includes(search) || (i.titleEn ?? "").toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [allItems, tab, semester, category, search]);

  const pendingCount = useMemo(
    () => (allItems ?? []).filter((i) => !i.completedAt).length,
    [allItems]
  );

  function handleAcknowledge(item: DormCalendarItem) {
    acknowledge({ sourceType: item.sourceType, sourceId: item.sourceId });
  }

  const activeCategory = category
    ? CATEGORY_LABELS[category]
    : null;

  return (
    <div className="flex flex-col">
      {/* Search + filter row */}
      <div className="flex gap-2 bg-cu-cream px-4 pb-3 pt-2">
        {/* Search bar */}
        <div className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-cu-cream-light px-3 py-2.5">
          <Search className="size-4 shrink-0 text-cu-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหากิจกรรม"
            className="min-w-0 flex-1 bg-transparent text-sm text-cu-grey placeholder:text-cu-muted outline-none"
          />
        </div>

        {/* Category filter */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-1 rounded-full border border-black/10 bg-cu-cream-light px-3 py-2.5 text-sm font-bold text-cu-muted whitespace-nowrap"
        >
          {activeCategory ?? "หมวดหมู่"}
          <ChevronDown className={cn("size-4 transition-transform", filterOpen && "rotate-180")} />
        </button>
      </div>

      {/* Filter dropdown */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden bg-cu-cream px-4 pb-3"
          >
            <div className="flex flex-wrap gap-2">
              <CategoryChip
                label="ทั้งหมด"
                active={!category}
                onClick={() => { onCategoryChange?.(undefined); setFilterOpen(false); }}
              />
              {(Object.entries(CATEGORY_LABELS) as [DormCalendarCategory, string][]).map(([k, v]) => (
                <CategoryChip
                  key={k}
                  label={v}
                  active={category === k}
                  onClick={() => { onCategoryChange?.(k); setFilterOpen(false); }}
                />
              ))}
            </div>

            {/* Semester filter */}
            {semesters && semesters.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <CategoryChip
                  label="ทุกภาคเรียน"
                  active={!semester}
                  onClick={() => onSemesterChange?.(undefined)}
                />
                {semesters.map((s) => (
                  <CategoryChip
                    key={s}
                    label={formatSemesterLabel(s)}
                    active={semester === s}
                    onClick={() => onSemesterChange?.(s)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <TabBar active={tab} onChange={onTabChange} pendingCount={pendingCount} />

      {/* List */}
      <div className="px-4 py-3 pb-24">
        {isLoading ? (
          <TaskCardSkeletonList count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState type={tab === "done" ? "all_done" : "none"} />
        ) : (
          <motion.div className="space-y-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 22 }}
              >
                <ListCard
                  item={item}
                  onAcknowledge={handleAcknowledge}
                  loading={isAcking}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold transition-colors",
        active
          ? "bg-primary text-white"
          : "border border-black/15 bg-cu-cream-light text-cu-grey"
      )}
    >
      {label}
    </button>
  );
}
