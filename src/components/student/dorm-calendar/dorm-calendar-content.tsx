"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarDays, List } from "lucide-react";
import { CalendarView } from "./calendar-view";
import { ListView } from "./list-view";
import type { DormCalendarCategory } from "@/hooks/use-dorm-calendar";

type ViewMode = "calendar" | "list";
type TabStatus = "pending" | "done" | "all";

export function DormCalendarContent() {
  const t = useTranslations("dormCalendar");
  const [view, setView] = useState<ViewMode>("calendar");
  const [tab, setTab] = useState<TabStatus>("pending");
  const [semester, setSemester] = useState<string | undefined>();
  const [category, setCategory] = useState<DormCalendarCategory | undefined>();
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fbf6e9]">
      {/* Pink hero bar for calendar view */}
      {view === "calendar" && (
        <div className="absolute inset-x-0 top-0 h-[298px] bg-[#dd598b]" />
      )}

      <div className="relative z-10">
        <PageHeader
          title={t("title")}
          transparent={view === "calendar"}
          titleClassName={view === "calendar" ? "text-white/90" : "text-[#565655]"}
          backHref="/dashboard"
          right={<ViewToggle view={view} onChange={setView} />}
        />

        <AnimatePresence mode="wait">
          {view === "calendar" ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <CalendarView
                tab={tab}
                onTabChange={setTab}
                semester={semester}
                onSemesterChange={setSemester}
                category={category}
                onCategoryChange={setCategory}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ListView
                tab={tab}
                onTabChange={setTab}
                semester={semester}
                onSemesterChange={setSemester}
                category={category}
                onCategoryChange={setCategory}
                search={search}
                onSearchChange={setSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "calendar" | "list";
  onChange: (v: "calendar" | "list") => void;
}) {
  const isCalendar = view === "calendar";
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full p-1 transition-colors",
        isCalendar
          ? "border border-white/30 bg-white/20 backdrop-blur-sm"
          : "border border-black/10 bg-[#fffef5]"
      )}
    >
      <button
        onClick={() => onChange("calendar")}
        className={cn(
          "flex size-[32px] items-center justify-center rounded-full transition-all duration-200",
          view === "calendar"
            ? "bg-white shadow-sm"
            : "opacity-50"
        )}
        aria-label="Calendar view"
      >
        <CalendarDays
          className={cn(
            "size-[18px]",
            view === "calendar"
              ? "text-[#dd598b]"
              : isCalendar ? "text-white" : "text-[#565655]"
          )}
        />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex size-[32px] items-center justify-center rounded-full transition-all duration-200",
          view === "list"
            ? isCalendar ? "bg-white shadow-sm" : "bg-[#dd598b]"
            : "opacity-50"
        )}
        aria-label="List view"
      >
        <List
          className={cn(
            "size-[18px]",
            view === "list"
              ? isCalendar ? "text-[#dd598b]" : "text-white"
              : isCalendar ? "text-white" : "text-[#565655]"
          )}
        />
      </button>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
