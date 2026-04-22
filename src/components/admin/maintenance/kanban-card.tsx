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
  isOverlay?: boolean;
}

export function KanbanCard({ ticket, isOverlay }: KanbanCardProps) {
  const { setSelectedTicketId } = useMaintenanceStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: ticket.id, 
    data: { 
      type: "Card",
      ticket 
    },
    disabled: isOverlay
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging || isOverlay) return;
    setSelectedTicketId(ticket.id);
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] w-full rounded-lg border-2 border-dashed border-primary/20 bg-muted/50"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors",
        isOverlay && "cursor-grabbing shadow-2xl border-primary ring-1 ring-primary/20",
      )}
      onClick={handleClick}
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
