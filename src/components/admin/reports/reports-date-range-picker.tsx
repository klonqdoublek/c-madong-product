"use client";

import { cn } from "@/lib/utils";

export type DatePreset = "30d" | "90d" | "6mo" | "1y";

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "30d", label: "30 วัน" },
  { value: "90d", label: "90 วัน" },
  { value: "6mo", label: "6 เดือน" },
  { value: "1y", label: "1 ปี" },
];

export function presetToDates(preset: DatePreset): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (preset === "30d") from.setDate(to.getDate() - 30);
  else if (preset === "90d") from.setDate(to.getDate() - 90);
  else if (preset === "6mo") from.setMonth(to.getMonth() - 6);
  else from.setFullYear(to.getFullYear() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

interface Props {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

export function ReportsDateRangePicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
            value === p.value
              ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/60"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
