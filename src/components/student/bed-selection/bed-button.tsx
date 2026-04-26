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
        state === "occupied" && "cursor-not-allowed bg-[#d7d4cc]",
        state === "available" && "cursor-pointer border border-[#52ad7e] hover:bg-[#52ad7e]/10",
        state === "selecting" && "cursor-pointer bg-[#52ad7e]",
        state === "current" && "cursor-not-allowed border border-[#b2b0a9] bg-[rgba(88,88,86,0.1)]"
      )}
    >
      <span
        className={cn(
          "font-sans text-base font-bold leading-none",
          state === "occupied" && "text-[#b9b6b0]",
          state === "available" && "text-[#52ad7e]",
          state === "selecting" && "text-white",
          state === "current" && "text-[rgba(88,88,86,0.4)]"
        )}
      >
        {label}
      </span>
      <BedDouble
        className={cn(
          "size-4",
          state === "occupied" && "text-[#b9b6b0]",
          state === "available" && "text-[#52ad7e]",
          state === "selecting" && "text-white",
          state === "current" && "text-[rgba(88,88,86,0.4)]"
        )}
      />
    </button>
  );
}
