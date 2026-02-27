"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyTickets } from "@/hooks/use-my-tickets";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { StatusBadge } from "@/components/admin/maintenance/status-badge";
import { formatDistanceToNow } from "@/lib/utils/date";
import { ChevronRight, Wrench } from "lucide-react";
import type { MaintenanceStatus } from "@/lib/supabase/types";

export function MyRequestsList() {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const { data: tickets, isLoading } = useMyTickets();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border bg-muted/50"
          />
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8">
        <Wrench size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("detail.noTickets")}</p>
        <Link
          href="/maintenance/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          + {t("newRequest")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/maintenance/${ticket.id}`}
          className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <CategoryIcon category={ticket.category} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{ticket.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(ticket.created_at)}
            </p>
          </div>
          <StatusBadge status={ticket.status as MaintenanceStatus} />
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  );
}
