"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, Kanban } from "lucide-react";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import { useMaintenanceTickets } from "@/hooks/use-maintenance-tickets";
import { useRealtime } from "@/hooks/use-realtime";
import { useQueryClient } from "@tanstack/react-query";
import { TicketFilters } from "./ticket-filters";
import { TicketStatsBar } from "./ticket-stats-bar";
import { TicketListView } from "./ticket-list-view";
import { KanbanBoard } from "./kanban-board";
import { TicketDetailModal } from "./ticket-detail-modal";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function MaintenancePageContent() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, filters, selectedTicketId, setSelectedTicketId } =
    useMaintenanceStore();

  const { data: tickets = [], isLoading } = useMaintenanceTickets(filters);

  // Deep-link: ?ticket={id} from LINE group push CTA
  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    if (ticketId && !selectedTicketId) {
      setSelectedTicketId(ticketId);
    }
  }, [searchParams, selectedTicketId, setSelectedTicketId]);

  const handleRealtimeChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
  }, [queryClient]);

  useRealtime({
    table: "maintenance_requests",
    onPayload: handleRealtimeChange,
  });

  return (
    <div className="flex flex-col space-y-4 min-w-0">
      <AdminBreadcrumb />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold">
          {t("admin.serviceDesk.title")}
        </h1>
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "list" | "kanban")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="list" className="gap-1.5">
              <LayoutList className="size-4" />
              {t("admin.serviceDesk.listView")}
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-1.5">
              <Kanban className="size-4" />
              {t("admin.serviceDesk.kanbanView")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TicketStatsBar tickets={tickets} />
      <TicketFilters />

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden rounded-xl">
        {viewMode === "list" ? (
          <TicketListView tickets={tickets} isLoading={isLoading} />
        ) : (
          <KanbanBoard tickets={tickets} isLoading={isLoading} />
        )}
      </div>

      <TicketDetailModal
        ticketId={selectedTicketId}
        open={!!selectedTicketId}
        onOpenChange={(open) => {
          if (!open) setSelectedTicketId(null);
        }}
      />
    </div>
  );
}
