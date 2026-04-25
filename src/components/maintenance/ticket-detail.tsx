"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useTicketDetail, useCancelTicket } from "@/hooks/use-my-tickets";
import { useRealtime } from "@/hooks/use-realtime";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { StatusBadge } from "@/components/admin/maintenance/status-badge";
import { PhotoGallery } from "@/components/admin/maintenance/photo-gallery";
import { formatDistanceToNow } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  CircleDot,
  User,
  CalendarDays,
  XCircle,
  Loader2,
} from "lucide-react";
import type { MaintenanceStatus } from "@/lib/supabase/types";

interface TicketDetailProps {
  ticketId: string;
}

const STATUS_STEPS: MaintenanceStatus[] = [
  "under_review",
  "acknowledged",
  "in_progress",
  "completed",
];

function getStatusTranslationKey(status: MaintenanceStatus) {
  switch (status) {
    case "under_review":
      return "underReview";
    case "in_progress":
      return "inProgress";
    default:
      return status;
  }
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const cancelMutation = useCancelTicket();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Realtime updates
  const onPayload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
    queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
  }, [queryClient, ticketId]);

  useRealtime({
    table: "maintenance_requests",
    event: "UPDATE",
    filter: `id=eq.${ticketId}`,
    onPayload,
  });

  const canCancel =
    ticket &&
    ["under_review", "acknowledged"].includes(ticket.status);

  const handleCancel = () => {
    cancelMutation.mutate(
      { ticketId, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          setCancelOpen(false);
          setCancelReason("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("detail.notFound")}
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(
    ticket.status as MaintenanceStatus
  );
  const isCancelled = ticket.status === "cancelled";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon category={ticket.category} size={20} />
          <h2 className="text-lg font-semibold">{ticket.title}</h2>
        </div>
        <StatusBadge status={ticket.status as MaintenanceStatus} />
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">{t("detail.timeline")}</h3>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((s, i) => {
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={s} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          isActive ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                    <div
                      className={`flex size-6 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isActive && i < currentStepIndex ? (
                        <CheckCircle2 size={14} />
                      ) : isCurrent ? (
                        <CircleDot size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          isActive && i < currentStepIndex
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground leading-tight">
                    {t(`status.${getStatusTranslationKey(s)}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <InfoRow
          label={t("category")}
          value={t(`categories.${ticket.category}`)}
        />
        <InfoRow label={t("description")} value={ticket.description} />
        <InfoRow
          label={t("detail.created")}
          value={formatDistanceToNow(ticket.created_at)}
        />
        {ticket.appointment_date && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">{t("appointment")}:</span>
            <span>
              {ticket.appointment_date}
              {ticket.appointment_time && ` ${ticket.appointment_time}`}
            </span>
          </div>
        )}
        {ticket.technician_id && (
          <div className="flex items-center gap-2 text-sm">
            <User size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("detail.technician")}:
            </span>
            <span>{t("detail.assigned")}</span>
          </div>
        )}
      </div>

      {/* Photos */}
      {ticket.photos && ticket.photos.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">
            {t("photos")} ({ticket.photos.length})
          </h3>
          <PhotoGallery photos={ticket.photos} />
        </div>
      )}

      {/* Cancellation reason */}
      {isCancelled && ticket.failure_reason && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <h3 className="text-sm font-medium text-destructive mb-1">
            {t("detail.cancelReason")}
          </h3>
          <p className="text-sm">{ticket.failure_reason}</p>
        </div>
      )}

      {/* Cancel button for student */}
      {canCancel && (
        <>
          <Button
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={() => setCancelOpen(true)}
          >
            <XCircle size={16} />
            {t("detail.cancelRequest")}
          </Button>

          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("detail.cancelDialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("detail.cancelDialogDesc")}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("detail.cancelReasonPlaceholder")}
                rows={3}
                maxLength={500}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelOpen(false)}
                  disabled={cancelMutation.isPending}
                >
                  {tCommon("back")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="gap-1.5"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {tCommon("confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm">{value}</p>
    </div>
  );
}
