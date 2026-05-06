"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  type?: "all_done" | "none";
}

export function EmptyState({ type = "all_done" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16">
      {/* Mascot float */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="opacity-25"
      >
        {/* Placeholder mascot — replace with actual image */}
        <div className="size-16 rounded-full bg-primary/30 flex items-center justify-center">
          <span className="text-2xl select-none">🏠</span>
        </div>
      </motion.div>
      <p className="mt-3 font-heading text-sm font-bold text-[#979795]">
        {type === "all_done" ? "หมดแล้ว!" : "ไม่มีรายการ"}
      </p>
      <p className="mt-1 text-xs text-[#979795]">
        {type === "all_done"
          ? "ทำครบทุกอย่างแล้ว"
          : "ยังไม่มีรายการในช่วงนี้"}
      </p>
    </div>
  );
}
