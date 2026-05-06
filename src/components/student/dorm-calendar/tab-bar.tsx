"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TabStatus = "pending" | "done" | "all";

interface TabBarProps {
  active: TabStatus;
  onChange: (tab: TabStatus) => void;
  pendingCount?: number;
}

const TABS: { key: TabStatus; label: string }[] = [
  { key: "pending", label: "ยังไม่ได้ทำ" },
  { key: "done",    label: "ทำแล้ว" },
  { key: "all",     label: "ทั้งหมด" },
];

export function TabBar({ active, onChange, pendingCount }: TabBarProps) {
  return (
    <div className="flex border-b border-black/8 bg-cu-cream px-4">
      {TABS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "relative flex items-center gap-1.5 py-3 pr-4 text-sm font-bold transition-colors",
              isActive ? "text-cu-task-green" : "text-[#969288]"
            )}
          >
            {label}
            {key === "pending" && !!pendingCount && (
              <span className="flex size-4 items-center justify-center rounded-full bg-cu-task-green text-[10px] text-[#fbf6e9]">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-cu-task-green"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
