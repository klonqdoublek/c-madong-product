"use client";

import { BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

type BedState = "occupied" | "available" | "selecting" | "current";

interface BedButtonProps {
  label: string;
  state: BedState;
  onClick?: () => void;
  disabled?: boolean;
}

export function BedButton({ label, state, onClick, disabled }: BedButtonProps) {
  const isClickable = state === "available" && !disabled;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        "flex h-[28px] w-[65px] items-center justify-center gap-1.5 rounded-[3px] transition-all active:scale-95",
        state === "occupied" && "cursor-not-allowed bg-cu-neutral-warm",
        state === "available" && "cursor-pointer border border-cu-task-green hover:bg-cu-task-green/10",
        state === "selecting" && "cursor-pointer bg-cu-task-green",
        state === "current" && "cursor-not-allowed border border-cu-neutral-warm-dark bg-cu-grey/10"
      )}
    >
      <span
        className={cn(
          "font-sans text-base font-bold leading-none",
          state === "occupied" && "text-cu-neutral-warm-dark",
          state === "available" && "text-cu-task-green",
          state === "selecting" && "text-white",
          state === "current" && "text-cu-grey/40"
        )}
      >
        {label}
      </span>
      <BedDouble
        className={cn(
          "size-4",
          state === "occupied" && "text-cu-neutral-warm-dark",
          state === "available" && "text-cu-task-green",
          state === "selecting" && "text-white",
          state === "current" && "text-cu-grey/40"
        )}
      />
    </button>
  );
}
