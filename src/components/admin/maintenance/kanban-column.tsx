"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAINTENANCE_STATUS_CONFIG } from "@/lib/utils/constants";
import { KanbanCard } from "./kanban-card";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: MaintenanceStatus;
  tickets: MaintenanceTicketWithRelations[];
  labelKey: string;
}

export function KanbanColumn({ status, tickets, labelKey }: KanbanColumnProps) {
  const t = useTranslations();
  const config = MAINTENANCE_STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30",
        isOver && "ring-2 ring-primary/30"
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className={cn("size-2 rounded-full", config.dotColor)} />
        <span className="text-sm font-medium">{t(labelKey)}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div ref={setNodeRef} className="space-y-2 min-h-[60px]">
          <SortableContext
            items={tickets.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tickets.map((ticket) => (
              <KanbanCard key={ticket.id} ticket={ticket} />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
