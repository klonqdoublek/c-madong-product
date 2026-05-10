"use client";

import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: string | number;
  suffix?: string;
  subtext?: string;
  loading?: boolean;
}

export function ReportsKpiCard({ icon: Icon, iconBg, label, value, suffix, subtext, loading }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="font-heading text-2xl font-bold leading-tight tracking-tight">
            {value}
            {suffix && <span className="ml-0.5 text-sm font-medium text-muted-foreground">{suffix}</span>}
          </p>
        )}
        {subtext && !loading && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
        )}
      </div>
    </div>
  );
}
