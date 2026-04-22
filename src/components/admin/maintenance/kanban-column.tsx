"use client";

import { useDroppable, useDndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAINTENANCE_STATUS_CONFIG, KANBAN_COLUMNS } from "@/lib/utils/constants";
import { KanbanCard } from "./kanban-card";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface KanbanColumnProps {
  status: MaintenanceStatus;
  tickets: MaintenanceTicketWithRelations[];
  labelKey: string;
}

export function KanbanColumn({ status, tickets, labelKey }: KanbanColumnProps) {
  const t = useTranslations();
  const config = MAINTENANCE_STATUS_CONFIG[status];
  const { over } = useDndContext();

  const { setNodeRef, isOver: isDirectlyOver } = useDroppable({ 
    id: status,
    data: {
      type: "Column",
      status
    }
  });

  // A column is "active" if we are dragging directly over it OR over any card inside it
  const isActive = useMemo(() => {
    if (isDirectlyOver) return true;
    if (!over) return false;

    // Check if we're hovering over a card in this column
    if (over.data.current?.type === "Card" && over.data.current?.ticket?.status === status) {
      return true;
    }

    // Fallback: check if the over.id matches this status (some collision detection styles return ID directly)
    if (over.id === status) return true;

    return false;
  }, [isDirectlyOver, over, status]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30 transition-all duration-200",
        isActive ? "bg-primary/10 border-primary ring-4 ring-primary/10 shadow-lg scale-[1.01]" : "border-transparent"
      )}
    >
      {/* Column header */}
      <div className={cn(
        "flex items-center gap-2 border-b px-3 py-2 transition-colors",
        isActive ? "bg-primary/10 border-primary/20" : "bg-transparent"
      )}>
        <span className={cn("size-2 rounded-full", config.dotColor)} />
        <span className={cn(
          "text-sm font-semibold transition-colors",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {t(labelKey)}
        </span>
        <span className={cn(
          "ml-auto rounded-full px-2 py-0.5 text-xs font-bold transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {tickets.length}
        </span>
      </div>

      {/* Cards container */}
      <ScrollArea className="flex-1 p-2" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div className="space-y-2 min-h-[200px]">
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

      {/* Optional drop hint text */}
      {isActive && (
        <div className="px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary animate-pulse">
            Drop to {t(labelKey)}
          </p>
        </div>
      )}
    </div>
  );
}
