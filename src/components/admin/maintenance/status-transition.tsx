"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MAINTENANCE_STATUS_CONFIG } from "@/lib/utils/constants";
import { STATUS_TRANSITIONS } from "@/types/maintenance";
import { useUpdateTicketStatus } from "@/hooks/use-maintenance-tickets";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface StatusTransitionProps {
  ticketId: string;
  currentStatus: MaintenanceStatus;
}

export function StatusTransition({
  ticketId,
  currentStatus,
}: StatusTransitionProps) {
  const t = useTranslations();
  const updateStatus = useUpdateTicketStatus();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [failureReason, setFailureReason] = useState("");

  const nextStatuses = STATUS_TRANSITIONS[currentStatus];

  if (nextStatuses.length === 0) return null;

  const handleTransition = (status: MaintenanceStatus) => {
    if (status === "cancelled") {
      setCancelDialogOpen(true);
      return;
    }
    updateStatus.mutate({ id: ticketId, status });
  };

  const handleCancel = () => {
    updateStatus.mutate({
      id: ticketId,
      status: "cancelled",
      failure_reason: failureReason || undefined,
    });
    setCancelDialogOpen(false);
    setFailureReason("");
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => {
          const config = MAINTENANCE_STATUS_CONFIG[status];
          return (
            <Button
              key={status}
              variant={status === "cancelled" ? "outline" : "default"}
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => handleTransition(status)}
              className={cn(
                status !== "cancelled" && "gap-1.5",
                status === "cancelled" && "text-destructive border-destructive/30"
              )}
            >
              <span className={cn("size-2 rounded-full", config.dotColor)} />
              {t(config.labelKey)}
            </Button>
          );
        })}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.serviceDesk.cancelConfirm")}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={t("admin.serviceDesk.failureReasonPlaceholder")}
            value={failureReason}
            onChange={(e) => setFailureReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t("common.back")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
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
