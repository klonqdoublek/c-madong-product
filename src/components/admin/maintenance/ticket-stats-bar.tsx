"use client";

import { useTranslations } from "next-intl";
import { MAINTENANCE_STATUS_CONFIG } from "@/lib/utils/constants";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import { cn } from "@/lib/utils";

interface TicketStatsBarProps {
  tickets: MaintenanceTicketWithRelations[];
}

const STAT_ORDER: MaintenanceStatus[] = [
  "pending",
  "acknowledged",
  "in_progress",
  "completed",
  "cancelled",
];

export function TicketStatsBar({ tickets }: TicketStatsBarProps) {
  const t = useTranslations();
  const { filters, setFilter } = useMaintenanceStore();

  const counts = STAT_ORDER.reduce(
    (acc, status) => {
      acc[status] = tickets.filter((t) => t.status === status).length;
      return acc;
    },
    {} as Record<MaintenanceStatus, number>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setFilter("status", "all")}
        className={cn(
          "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
          filters.status === "all"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        {t("common.viewAll")} ({tickets.length})
      </button>
      {STAT_ORDER.map((status) => {
        const config = MAINTENANCE_STATUS_CONFIG[status];
        return (
          <button
            key={status}
            onClick={() =>
              setFilter("status", filters.status === status ? "all" : status)
            }
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              filters.status === status
                ? cn(config.bgColor, config.color)
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <span className={cn("mr-1 inline-block size-2 rounded-full", config.dotColor)} />
            {t(config.labelKey)} ({counts[status]})
          </button>
        );
      })}
    </div>
  );
}
