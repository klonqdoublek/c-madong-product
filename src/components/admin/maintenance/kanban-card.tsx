"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "./category-icon";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { formatDistanceToNow } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { User, MapPin } from "lucide-react";

interface KanbanCardProps {
  ticket: MaintenanceTicketWithRelations;
}

export function KanbanCard({ ticket }: KanbanCardProps) {
  const { setSelectedTicketId } = useMaintenanceStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { ticket } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={() => setSelectedTicketId(ticket.id)}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <CategoryIcon category={ticket.category} className="mt-0.5 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{ticket.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ticket.category}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span className="truncate max-w-[100px]">
              {ticket.requester?.full_name_th ?? "-"}
            </span>
          </div>
          <span>{formatDistanceToNow(ticket.created_at)}</span>
        </div>

        {ticket.technician && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <MapPin className="size-3" />
            <span className="truncate">{ticket.technician.display_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
