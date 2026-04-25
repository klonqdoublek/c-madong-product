"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { CategoryIcon } from "./category-icon";
import { PhotoGallery } from "./photo-gallery";
import { StatusTransition } from "./status-transition";
import {
  useMaintenanceTicket,
  useAssignTechnician,
  useUpdateTicketNotes,
  useReanalyzeTicket,
} from "@/hooks/use-maintenance-tickets";
import { useTechnicians } from "@/hooks/use-technicians";
import { formatDistanceToNow } from "@/lib/utils/date";
import { User, Calendar, MessageSquare, Brain, RefreshCw, XCircle, Loader2 } from "lucide-react";
import { MaterialsSection } from "./materials-section";
import { formatTicketCode } from "@/lib/utils/ticket-code";
import type { MaterialItem } from "@/lib/supabase/types";

interface TicketDetailModalProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailModal({
  ticketId,
  open,
  onOpenChange,
}: TicketDetailModalProps) {
  const t = useTranslations();
  const { data: ticket, isLoading } = useMaintenanceTicket(ticketId);
  const { data: technicians = [] } = useTechnicians(true);
  const assignTechnician = useAssignTechnician();
  const updateNotes = useUpdateTicketNotes();
  const reanalyze = useReanalyzeTicket();
  const [notes, setNotes] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);
  const [markingIncorrect, setMarkingIncorrect] = useState(false);
  const [correctCategory, setCorrectCategory] = useState("");

  const handleAssign = (technicianId: string) => {
    if (!ticketId) return;
    assignTechnician.mutate({
      ticketId,
      technicianId: technicianId === "none" ? null : technicianId,
    });
  };

  const handleSaveNotes = () => {
    if (!ticketId) return;
    updateNotes.mutate({ id: ticketId, admin_notes: notes });
    setNotesEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading || !ticket ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <CategoryIcon
                  category={ticket.category}
                  size={24}
                  className="mt-1 text-muted-foreground"
                />
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg">
                    {ticket.title}
                  </DialogTitle>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {formatTicketCode((ticket as any).ticket_code)}
                    </span>
                    <span>·</span>
                    <span>{t(`maintenance.categories.${ticket.category}`)}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(ticket.created_at)}</span>
                  </div>
                </div>
                <StatusBadge status={ticket.status as MaintenanceStatus} />
              </div>
            </DialogHeader>

            <Separator />

            {/* Requester info */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {ticket.requester?.full_name_th ?? t("common.noData")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("admin.serviceDesk.requester")}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="mb-1 text-sm font-medium">
                {t("maintenance.description")}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Photos */}
            {ticket.photos && ticket.photos.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">
                  {t("maintenance.photos")}
                </h4>
                <PhotoGallery photos={ticket.photos} />
              </div>
            )}

            {/* Appointment */}
            {ticket.appointment_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>
                  {ticket.appointment_date}{" "}
                  {ticket.appointment_time && `@ ${ticket.appointment_time}`}
                </span>
              </div>
            )}

            {/* AI Analysis */}
            {ticket.ai_provider && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  <h4 className="text-sm font-medium">
                    {t("admin.serviceDesk.aiAnalysis")}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("admin.serviceDesk.aiProvider")}
                    </span>
                    <p className="font-medium capitalize">{ticket.ai_provider}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("admin.serviceDesk.aiConfidence")}
                    </span>
                    <p className="font-medium">
                      {ticket.ai_confidence
                        ? `${Math.round(ticket.ai_confidence * 100)}%`
                        : "-"}
                    </p>
                  </div>
                </div>
                {ticket.damage_details && (
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground">
                      {t("admin.serviceDesk.damageDetails")}
                    </span>
                    <p>{ticket.damage_details}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {!markingIncorrect ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setMarkingIncorrect(true)}
                    >
                      <XCircle size={14} />
                      {t("admin.serviceDesk.markIncorrect")}
                    </Button>
                  ) : (
                    <div className="flex-1 space-y-2">
                      <Select
                        value={correctCategory}
                        onValueChange={setCorrectCategory}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("admin.serviceDesk.correctCategory")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "electrical", "plumbing", "furniture",
                            "air_conditioning", "internet", "door_lock",
                            "pest", "cleaning", "other",
                          ].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {t(`maintenance.categories.${cat}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!correctCategory}
                          onClick={async () => {
                            if (!ticketId) return;
                            await fetch(`/api/admin/maintenance/${ticketId}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                ai_feedback: "incorrect",
                                correct_category: correctCategory,
                              }),
                            });
                            setMarkingIncorrect(false);
                            setCorrectCategory("");
                          }}
                        >
                          {t("common.confirm")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMarkingIncorrect(false);
                            setCorrectCategory("");
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={reanalyze.isPending}
                    onClick={() => {
                      if (ticketId) reanalyze.mutate(ticketId);
                    }}
                  >
                    {reanalyze.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    {t("admin.serviceDesk.reanalyze")}
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Technician assignment */}
            <div>
              <h4 className="mb-2 text-sm font-medium">
                {t("admin.serviceDesk.assignTechnician")}
              </h4>
              <Select
                value={ticket.technician_id ?? "none"}
                onValueChange={handleAssign}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("admin.serviceDesk.selectTechnician")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("admin.serviceDesk.unassigned")}
                  </SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.display_name} ({tech.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status transitions */}
            <div>
              <h4 className="mb-2 text-sm font-medium">
                {t("admin.serviceDesk.changeStatus")}
              </h4>
              <StatusTransition
                ticketId={ticket.id}
                currentStatus={ticket.status as MaintenanceStatus}
              />
            </div>

            {/* Materials */}
            <div>
              <MaterialsSection
                ticketId={ticket.id}
                initialMaterials={((ticket as any).materials ?? []) as MaterialItem[]}
              />
            </div>

            <Separator />

            {/* Admin notes */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">
                  {t("admin.serviceDesk.adminNotes")}
                </h4>
              </div>
              {notesEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={t("admin.serviceDesk.notesPlaceholder")}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes}>
                      {t("common.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNotesEditing(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNotes(ticket.admin_notes ?? "");
                    setNotesEditing(true);
                  }}
                  className="w-full rounded-lg border border-dashed p-3 text-left text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted/50 transition-colors"
                >
                  {ticket.admin_notes || t("admin.serviceDesk.addNotes")}
                </button>
              )}
            </div>

            {/* Failure reason (if cancelled) */}
            {ticket.status === "cancelled" && ticket.failure_reason && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <h4 className="text-sm font-medium text-destructive">
                  {t("admin.serviceDesk.failureReason")}
                </h4>
                <p className="mt-1 text-sm">{ticket.failure_reason}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                {t("admin.serviceDesk.created")}:{" "}
                {new Date(ticket.created_at).toLocaleString()}
              </p>
              {ticket.accepted_at && (
                <p>
                  {t("admin.serviceDesk.accepted")}:{" "}
                  {new Date(ticket.accepted_at).toLocaleString()}
                </p>
              )}
              {ticket.resolved_at && (
                <p>
                  {t("admin.serviceDesk.resolved")}:{" "}
                  {new Date(ticket.resolved_at).toLocaleString()}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
