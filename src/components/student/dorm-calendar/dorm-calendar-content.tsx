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
          titleClassName={view === "calendar" ? "text-white" : "text-[#565655]"}
          backHref="/dashboard"
          right={
            <ViewToggle view={view} onChange={setView} />
          }
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
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1 backdrop-blur-sm">
      <button
        onClick={() => onChange("calendar")}
        className={cn(
          "flex size-[32px] items-center justify-center rounded-full transition-all duration-200",
          view === "calendar" ? "bg-white shadow" : "opacity-60"
        )}
        aria-label="Calendar view"
      >
        <CalendarDays
          className={cn("size-[18px]", view === "calendar" ? "text-[#dd598b]" : "text-white")}
        />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex size-[32px] items-center justify-center rounded-full transition-all duration-200",
          view === "list" ? "bg-white shadow" : "opacity-60"
        )}
        aria-label="List view"
      >
        <List
          className={cn("size-[18px]", view === "list" ? "text-[#dd598b]" : "text-white")}
        />
      </button>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
