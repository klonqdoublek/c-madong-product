"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KANBAN_COLUMNS } from "@/lib/utils/constants";
import { KanbanColumn } from "./kanban-column";
import { useUpdateTicketStatus } from "@/hooks/use-maintenance-tickets";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface KanbanBoardProps {
  tickets: MaintenanceTicketWithRelations[];
  isLoading: boolean;
}

export function KanbanBoard({ tickets, isLoading }: KanbanBoardProps) {
  const updateStatus = useUpdateTicketStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const ticketsByStatus = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tickets.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<MaintenanceStatus, MaintenanceTicketWithRelations[]>
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      // The "over" id is the column status
      const newStatus = over.id as MaintenanceStatus;
      const ticketId = active.id as string;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket || ticket.status === newStatus) return;

      // Terminal states can't be changed
      if (ticket.status === "completed" || ticket.status === "cancelled") return;

      updateStatus.mutate({ id: ticketId, status: newStatus });
    },
    [tickets, updateStatus]
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className="w-[280px] shrink-0">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              tickets={ticketsByStatus[col.id] ?? []}
              labelKey={col.labelKey}
            />
          ))}
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
