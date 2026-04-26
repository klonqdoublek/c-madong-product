"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDormCalendar, useAcknowledgeCalendarItem } from "@/hooks/use-dorm-calendar";
import type { DormCalendarItem, DormCalendarCategory } from "@/hooks/use-dorm-calendar";
import { MiniCalendar } from "./mini-calendar";
import { TaskCard } from "./task-card";
import { TaskCardSkeletonList } from "./task-card-skeleton";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tab: "pending" | "done" | "all";
  onTabChange: (t: "pending" | "done" | "all") => void;
  semester?: string;
  onSemesterChange?: (s: string | undefined) => void;
  category?: DormCalendarCategory;
  onCategoryChange?: (c: DormCalendarCategory | undefined) => void;
}

type Section = "upcoming" | "soon" | "done";

export function CalendarView({
  semester,
  category,
}: CalendarViewProps) {
  const { data: items, isLoading } = useDormCalendar({ status: "all", semester, category });
  const { mutate: acknowledge, isPending: isAcking } = useAcknowledgeCalendarItem();
  const [collapsed, setCollapsed] = useState<Record<Section, boolean>>({
    upcoming: false,
    soon: false,
    done: true,
  });

  const now = new Date();

  const { upcoming, soon, done } = useMemo(() => {
    const all = items ?? [];
    const upcoming: DormCalendarItem[] = [];
    const soon: DormCalendarItem[] = [];
    const done: DormCalendarItem[] = [];

    all.forEach((item) => {
      if (item.completedAt) { done.push(item); return; }
      const due = new Date(item.dueAt);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 14) upcoming.push(item);
      else soon.push(item);
    });

    return { upcoming, soon, done };
  }, [items]);

  function handleAcknowledge(item: DormCalendarItem) {
    acknowledge(
      { sourceType: item.sourceType, sourceId: item.sourceId },
    );
  }

  function toggleSection(s: Section) {
    setCollapsed((prev) => ({ ...prev, [s]: !prev[s] }));
  }

  return (
    <div className="px-4 pb-24">
      {/* Calendar card */}
      <div className="mt-3">
        <MiniCalendar />
      </div>

      {/* Upcoming section */}
      <SectionHeader
        label={`กำลังจะมาถึง (${upcoming.length})`}
        color="#dd598b"
        collapsed={collapsed.upcoming}
        onToggle={() => toggleSection("upcoming")}
      />
      <AnimatePresence>
        {!collapsed.upcoming && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {isLoading ? (
              <TaskCardSkeletonList count={2} />
            ) : upcoming.length === 0 ? (
              <EmptyState type="all_done" />
            ) : (
              <div className="mt-2 space-y-3">
                <TimelineList
                  items={upcoming}
                  onAcknowledge={handleAcknowledge}
                  loading={isAcking}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soon section */}
      {soon.length > 0 && (
        <>
          <SectionHeader
            label="เร็วๆนี้"
            color="#565655"
            collapsed={collapsed.soon}
            onToggle={() => toggleSection("soon")}
          />
          <AnimatePresence>
            {!collapsed.soon && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-3">
                  <TimelineList
                    items={soon}
                    onAcknowledge={handleAcknowledge}
                    loading={isAcking}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Done section */}
      {done.length > 0 && (
        <>
          <SectionHeader
            label="ทำไปแล้ว"
            color="#565655"
            collapsed={collapsed.done}
            onToggle={() => toggleSection("done")}
          />
          <AnimatePresence>
            {!collapsed.done && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-3">
                  {done.map((item) => (
                    <TaskCard key={item.id} item={item} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  label,
  color,
  collapsed,
  onToggle,
}: {
  label: string;
  color: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-5 flex items-center gap-2">
      <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-heading text-base font-bold text-[#585856]">{label}</span>
      <div className="h-px flex-1 bg-black/8" />
      <button
        onClick={onToggle}
        className="flex size-[30px] items-center justify-center rounded-full border border-black/15 bg-[#fffef5]"
      >
        {collapsed ? (
          <ChevronDown className="size-4 text-[#565655]" />
        ) : (
          <ChevronUp className="size-4 text-[#565655]" />
        )}
      </button>
    </div>
  );
}

function TimelineList({
  items,
  onAcknowledge,
  loading,
}: {
  items: DormCalendarItem[];
  onAcknowledge: (item: DormCalendarItem) => void;
  loading?: boolean;
}) {
  const THAI_MONTHS_SHORT = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];

  // Group by due date
  const grouped = useMemo(() => {
    const map = new Map<string, DormCalendarItem[]>();
    items.forEach((item) => {
      const due = new Date(item.dueAt);
      const key = `${due.getDate()} ${THAI_MONTHS_SHORT[due.getMonth()]}`;
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    });
    return [...map.entries()];
  }, [items]);

  return (
    <>
      {grouped.map(([dateLabel, group], gi) => (
        <div key={dateLabel} className="flex gap-3">
          {/* Left timeline */}
          <div className="flex w-12 flex-col items-center">
            <span className="font-heading text-sm font-bold text-[#52ad7e]">{dateLabel.split(" ")[0]}</span>
            <span className="font-heading text-xs text-[#52ad7e]">{dateLabel.split(" ")[1]}</span>
            {gi < grouped.length - 1 && (
              <div className="mt-1 w-[2px] flex-1 bg-black/10" />
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 space-y-2">
            {group.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onAcknowledge={onAcknowledge}
                loading={loading}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
