"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { MAINTENANCE_STATUS_CONFIG } from "@/lib/utils/constants";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: MaintenanceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations();
  const config = MAINTENANCE_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotColor)} />
      {t(config.labelKey)}
    </Badge>
  );
}
