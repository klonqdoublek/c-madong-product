"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { CategoryIcon } from "./category-icon";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { formatDistanceToNow } from "@/lib/utils/date";

interface TicketListViewProps {
  tickets: MaintenanceTicketWithRelations[];
  isLoading: boolean;
}

export function TicketListView({ tickets, isLoading }: TicketListViewProps) {
  const t = useTranslations();
  const { setSelectedTicketId } = useMaintenanceStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {t("common.noData")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]" />
            <TableHead>{t("maintenance.category")}</TableHead>
            <TableHead className="min-w-[200px]">
              {t("admin.serviceDesk.ticketTitle")}
            </TableHead>
            <TableHead>{t("admin.serviceDesk.requester")}</TableHead>
            <TableHead>{t("admin.serviceDesk.status")}</TableHead>
            <TableHead>{t("admin.serviceDesk.technician")}</TableHead>
            <TableHead>{t("admin.serviceDesk.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <TableCell>
                <CategoryIcon category={ticket.category} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {t(`maintenance.categories.${ticket.category}`)}
              </TableCell>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="text-sm">
                {ticket.requester?.full_name_th ?? "-"}
              </TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="text-sm">
                {ticket.technician?.display_name ?? "-"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(ticket.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
