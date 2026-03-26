"use client";

import { useCallback } from "react";
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
  const { viewMode, setViewMode, filters, selectedTicketId, setSelectedTicketId } =
    useMaintenanceStore();

  const { data: tickets = [], isLoading } = useMaintenanceTickets(filters);

  // Realtime: invalidate cache on any maintenance_requests change
  const handleRealtimeChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
  }, [queryClient]);

  useRealtime({
    table: "maintenance_requests",
    onPayload: handleRealtimeChange,
  });

  return (
    <div className="space-y-4">
      <AdminBreadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">
          {t("admin.serviceDesk.title")}
        </h1>
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "list" | "kanban")}
        >
          <TabsList>
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

      {/* Stats */}
      <TicketStatsBar tickets={tickets} />

      {/* Filters */}
      <TicketFilters />

      {/* Content */}
      {viewMode === "list" ? (
        <TicketListView tickets={tickets} isLoading={isLoading} />
      ) : (
        <KanbanBoard tickets={tickets} isLoading={isLoading} />
      )}

      {/* Detail Modal */}
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
