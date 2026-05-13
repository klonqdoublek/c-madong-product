"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
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
import { User, Calendar, MessageSquare, Brain, RefreshCw, XCircle, Loader2, X } from "lucide-react";
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
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl overflow-visible border-0 bg-transparent p-0 shadow-none"
      >
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute -top-4 right-0 z-10 rounded-full border border-slate-200 bg-white text-slate-500 shadow-md hover:bg-slate-100 hover:text-slate-700 sm:-top-5 sm:right-1"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </Button>
        </DialogClose>

        <div className="max-h-[85vh] overflow-y-auto rounded-2xl border bg-background shadow-lg">
          {isLoading || !ticket ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <DialogHeader className="gap-0 border-b bg-gradient-to-br from-slate-50 via-white to-amber-50/40 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-white shadow-sm">
                      <CategoryIcon
                        category={ticket.category}
                        size={22}
                        className="text-amber-600"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 pr-2">
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100/90 px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.04em] text-slate-700"
                        >
                          {formatTicketCode(ticket.ticket_code)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                        >
                          {t(`maintenance.categories.${ticket.category}`)}
                        </Badge>
                        <StatusBadge
                          status={ticket.status as MaintenanceStatus}
                          className="sm:hidden"
                        />
                      </div>
                      <DialogTitle className="mt-3 pr-2 text-xl leading-tight text-slate-900 sm:text-[22px]">
                        {ticket.title}
                      </DialogTitle>
                      <DialogDescription className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">
                        <span>{t("admin.serviceDesk.created")}</span>
                        <span>{formatDistanceToNow(ticket.created_at)}</span>
                        <span className="hidden text-slate-300 sm:inline">•</span>
                        <span>{ticket.requester?.full_name_th ?? t("common.noData")}</span>
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start">
                    <StatusBadge
                      status={ticket.status as MaintenanceStatus}
                      className="hidden translate-y-0.5 sm:inline-flex"
                    />
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                {/* Requester info */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <User className="size-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {ticket.requester?.full_name_th ?? t("common.noData")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t("admin.serviceDesk.requester")}
                      </p>
                    </div>
                  </div>
                </div>

              {/* Description */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">
                  {t("maintenance.description")}
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {ticket.description}
                </p>
              </div>

              {/* Photos */}
              {ticket.photos && ticket.photos.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-900">
                    {t("maintenance.photos")}
                  </h4>
                  <PhotoGallery photos={ticket.photos} />
                </div>
              )}

              {/* Appointment */}
              {ticket.appointment_date && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-blue-900">
                  <Calendar className="size-4 text-blue-600" />
                  <span>
                    {ticket.appointment_date}{" "}
                    {ticket.appointment_time && `@ ${ticket.appointment_time}`}
                  </span>
                </div>
              )}

              {/* AI Analysis */}
              {ticket.ai_provider && (
                <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
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
                  <div className="flex flex-col gap-2 sm:flex-row">
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
                      className="gap-1.5 sm:self-start"
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
                  initialMaterials={(ticket.materials ?? []) as MaterialItem[]}
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
                    className="w-full rounded-xl border border-dashed p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50"
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
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
