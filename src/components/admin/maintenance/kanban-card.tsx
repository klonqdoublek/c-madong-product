"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import type { MaintenanceTicketWithRelations } from "@/types/maintenance";
import { formatDistanceToNow } from "@/lib/utils/date";
import { formatTicketCode } from "@/lib/utils/ticket-code";
import { getSpecificIcon } from "@/lib/utils/specific-icons";
import { cn } from "@/lib/utils";
import { User, Wrench } from "lucide-react";
import type { MaterialItem } from "@/lib/supabase/types";

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
    data: { type: "Card", ticket },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (isDragging || isOverlay) return;
    setSelectedTicketId(ticket.id);
  };

  const t = ticket as typeof ticket & { ticket_code?: string; materials?: MaterialItem[]; specific_item?: string | null };
  const materialsCount = (t.materials ?? []).length;
  const SpecificIcon = getSpecificIcon(ticket.category, t.specific_item);

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
        isOverlay && "cursor-grabbing shadow-2xl border-primary ring-1 ring-primary/20"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-2 p-3">
        {/* Ticket code + icon row */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {formatTicketCode(t.ticket_code)}
          </span>
          <SpecificIcon className="size-3.5 text-muted-foreground shrink-0" />
        </div>

        {/* Title + category */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{ticket.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ticket.category}
            {t.specific_item && ` · ${t.specific_item.replace(/_/g, " ")}`}
          </p>
        </div>

        {/* Materials chip */}
        {materialsCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/5 rounded px-1.5 py-0.5 w-fit">
            <Wrench className="size-3" />
            <span>{materialsCount} รายการ</span>
          </div>
        )}

        {/* Requester + time */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span className="truncate max-w-[100px]">
              {ticket.requester?.full_name_th ?? "-"}
            </span>
          </div>
          <span>{formatDistanceToNow(ticket.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
