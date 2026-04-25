"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MAINTENANCE_STATUS_CONFIG } from "@/lib/utils/constants";
import { useUpdateTicketStatus } from "@/hooks/use-maintenance-tickets";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const ALL_STATUSES: MaintenanceStatus[] = [
  "under_review",
  "acknowledged",
  "in_progress",
  "completed",
  "cancelled",
];

interface StatusTransitionProps {
  ticketId: string;
  currentStatus: MaintenanceStatus;
}

export function StatusTransition({ ticketId, currentStatus }: StatusTransitionProps) {
  const t = useTranslations();
  const updateStatus = useUpdateTicketStatus();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    target: MaintenanceStatus | null;
  }>({ open: false, target: null });
  const [reason, setReason] = useState("");

  const handlePillClick = (target: MaintenanceStatus) => {
    if (target === currentStatus) return;
    setReason("");
    setConfirmDialog({ open: true, target });
  };

  const handleConfirm = () => {
    if (!confirmDialog.target) return;
    updateStatus.mutate({
      id: ticketId,
      status: confirmDialog.target,
      failure_reason:
        confirmDialog.target === "cancelled" ? reason || undefined : undefined,
    });
    setConfirmDialog({ open: false, target: null });
  };

  return (
    <>
      {/* Pill row */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => {
          const config = MAINTENANCE_STATUS_CONFIG[status];
          const isCurrent = status === currentStatus;
          const isInFlight =
            updateStatus.isPending && confirmDialog.target === status;

          return (
            <button
              key={status}
              disabled={updateStatus.isPending}
              onClick={() => handlePillClick(status)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50",
                status === "cancelled" &&
                  !isCurrent &&
                  "hover:border-destructive/40 hover:text-destructive",
                updateStatus.isPending && !isCurrent && "pointer-events-none opacity-50"
              )}
            >
              {isInFlight ? (
                <Loader2 className="size-3 animate-spin" />
              ) : isCurrent ? (
                <Check className="size-3" />
              ) : (
                <span className={cn("size-2 rounded-full", config.dotColor)} />
              )}
              {t(config.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((p) => ({ ...p, open }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.target
                ? t("admin.serviceDesk.confirmStatusChangeTo", {
                    status: t(
                      MAINTENANCE_STATUS_CONFIG[confirmDialog.target].labelKey
                    ),
                  })
                : t("admin.serviceDesk.changeStatus")}
            </DialogTitle>
          </DialogHeader>

          {confirmDialog.target === "cancelled" && (
            <Textarea
              placeholder={t("admin.serviceDesk.failureReasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          )}

          {(confirmDialog.target === "completed" ||
            confirmDialog.target === "under_review") &&
            (currentStatus === "completed" || currentStatus === "cancelled") && (
              <p className="text-sm text-muted-foreground">
                {t("admin.serviceDesk.reopenWarning")}
              </p>
            )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, target: null })}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={confirmDialog.target === "cancelled" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={updateStatus.isPending}
            >
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
