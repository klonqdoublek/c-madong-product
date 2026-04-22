"use client";

import { useCallback, useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { KANBAN_COLUMNS } from "@/lib/utils/constants";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { useUpdateTicketStatus } from "@/hooks/use-maintenance-tickets";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { createPortal } from "react-dom";

interface KanbanBoardProps {
  tickets: MaintenanceTicketWithRelations[];
  isLoading: boolean;
}

export function KanbanBoard({ tickets, isLoading }: KanbanBoardProps) {
  const updateStatus = useUpdateTicketStatus();
  const [activeTicket, setActiveTicket] = useState<MaintenanceTicketWithRelations | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const ticketsByStatus = useMemo(() => 
    KANBAN_COLUMNS.reduce(
      (acc, col) => {
        acc[col.id] = tickets.filter((t) => t.status === col.id);
        return acc;
      },
      {} as Record<MaintenanceStatus, MaintenanceTicketWithRelations[]>
    ),
    [tickets]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const ticket = active.data.current?.ticket as MaintenanceTicketWithRelations;
    if (ticket) {
      setActiveTicket(ticket);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTicket(null);
      
      if (!over) return;

      const ticketId = active.id as string;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) return;

      // Terminal states can't be changed via drag
      if (ticket.status === "completed" || ticket.status === "cancelled") return;

      // Resolve the new status
      // If dropped over a column, over.id is the status
      // If dropped over a card, over.data.current.ticket.status is the status
      let newStatus: MaintenanceStatus;
      
      if (over.data.current?.type === "Column") {
        newStatus = over.id as MaintenanceStatus;
      } else if (over.data.current?.ticket) {
        newStatus = over.data.current.ticket.status;
      } else {
        // Fallback: check if id matches a status
        const isStatus = KANBAN_COLUMNS.some(c => c.id === over.id);
        if (isStatus) {
          newStatus = over.id as MaintenanceStatus;
        } else {
          return;
        }
      }

      if (ticket.status === newStatus) return;

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
      <div className="flex gap-4 pb-4 px-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
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

          {typeof document !== "undefined" &&
            createPortal(
              <DragOverlay
                dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: "0.5",
                      },
                    },
                  }),
                }}
              >
                {activeTicket ? (
                  <div className="w-[264px] rotate-2 cursor-grabbing shadow-2xl">
                    <KanbanCard ticket={activeTicket} isOverlay />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body
            )}
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
