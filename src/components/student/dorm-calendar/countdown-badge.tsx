"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  dueAt: string;
}

export const CountdownBadge = memo(function CountdownBadge({ dueAt }: CountdownBadgeProps) {
  const due = new Date(dueAt);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return (
      <span className="text-[10px] font-bold text-[#979795]">
        หมดเวลาแล้ว
      </span>
    );
  }

  const isUrgent = diffDays <= 1;
  const isWarning = diffDays <= 3;

  const label =
    diffDays === 0
      ? "! วันสุดท้ายวันนี้"
      : diffDays === 1
      ? "! เหลือเวลาอีก 1 วัน"
      : `! เหลือเวลาอีก ${diffDays} วัน`;

  return (
    <motion.span
      animate={
        isUrgent
          ? { opacity: [1, 0.4, 1] }
          : {}
      }
      transition={
        isUrgent
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
      className={cn(
        "text-[10px] font-bold",
        isUrgent  ? "text-red-500"    :
        isWarning ? "text-[#dd598b]" :
                    "text-[#dd598b]"
      )}
    >
      {label}
    </motion.span>
  );
});
