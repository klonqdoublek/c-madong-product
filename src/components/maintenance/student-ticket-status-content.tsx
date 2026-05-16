"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  Clock,
  Clock3,
  Loader2,
  MapPin,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCancelTicket, useTicketDetail } from "@/hooks/use-my-tickets";
import { useRealtime } from "@/hooks/use-realtime";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MaintenanceStatus } from "@/lib/supabase/types";

const STATUS_STEPS: MaintenanceStatus[] = [
  "under_review",
  "acknowledged",
  "in_progress",
  "completed",
];

const STUDENT_STATUS: Record<
  MaintenanceStatus,
  { th: string; en: string; badge: string; dot: string; text: string }
> = {
  under_review: {
    th: "ส่งคำขอแล้ว",
    en: "Submitted",
    badge: "bg-[#dbeafe]",
    dot: "bg-[#3b82f6]",
    text: "text-[#3b82f6]",
  },
  acknowledged: {
    th: "รับเรื่องแล้ว",
    en: "Received",
    badge: "bg-[#dbeafe]",
    dot: "bg-[#3b82f6]",
    text: "text-[#3b82f6]",
  },
  in_progress: {
    th: "กำลังซ่อม",
    en: "Repairing",
    badge: "bg-[#f7edd4]",
    dot: "bg-[#ffa600]",
    text: "text-[#ffa600]",
  },
  completed: {
    th: "เสร็จสิ้น",
    en: "Completed",
    badge: "bg-[#edf5e8]",
    dot: "bg-[#4da376]",
    text: "text-[#4da376]",
  },
  cancelled: {
    th: "ยกเลิก",
    en: "Cancelled",
    badge: "bg-[rgba(255,0,0,0.2)]",
    dot: "bg-red-500",
    text: "text-red-500",
  },
};

const STEP_LABELS: Record<MaintenanceStatus, { th: string; en: string }> = {
  under_review: { th: "ส่งคำขอแล้ว", en: "Submitted" },
  acknowledged: { th: "รับเรื่องแล้ว", en: "Received" },
  in_progress: { th: "กำลังดำเนินการ", en: "In progress" },
  completed: { th: "เสร็จสิ้น", en: "Completed" },
  cancelled: { th: "ยกเลิก", en: "Cancelled" },
};

interface StudentTicketStatusContentProps {
  ticketId: string;
}

function safeStatus(status: string): MaintenanceStatus {
  return (STUDENT_STATUS[status as MaintenanceStatus] ? status : "under_review") as MaintenanceStatus;
}

function ticketCode(ticket: { ticket_code: string | null; id: string }) {
  return ticket.ticket_code ? `Ticket #${ticket.ticket_code}` : `Ticket #${ticket.id.slice(0, 8)}`;
}

function relativeSubmitted(dateStr: string, locale: string) {
  const created = new Date(dateStr);
  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (locale === "th") {
    if (diffMin < 1) return "สักครู่";
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชั่วโมงก่อน`;
    return `${diffDay} วันก่อน`;
  }

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

function formatShortDateTime(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastUpdated(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  const day = formatShortDateTime(dateStr, locale);
  const time = date.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return locale === "th" ? `อัปเดทล่าสุด ${day} ${time} น.` : `Last updated ${day} ${time}`;
}

function formatAppointmentDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return dateStr;

  if (locale === "th") {
    const weekday = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"][date.getDay()];
    const month = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ][date.getMonth()];
    return `${weekday}ที่ ${date.getDate()} ${month} ${date.getFullYear() + 543}`;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAppointmentTime(time: string) {
  return `${time.slice(0, 5).replace(":", ".")} น.`;
}

function StatusBadge({ status, locale }: { status: MaintenanceStatus; locale: string }) {
  const config = STUDENT_STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-20 items-center justify-center gap-1 rounded-full px-2.5 font-body text-xs font-bold tracking-[-0.32px]",
        config.badge,
        config.text
      )}
    >
      <span className={cn("size-2 rounded-full", config.dot)} />
      {locale === "th" ? config.th : config.en}
    </span>
  );
}

function StatusTracker({
  status,
  updatedAt,
  locale,
}: {
  status: MaintenanceStatus;
  updatedAt: string;
  locale: string;
}) {
  const currentIndex = status === "cancelled" ? -1 : STATUS_STEPS.indexOf(status);

  return (
    <section className="rounded-xl border border-cu-cream bg-cu-cream-light px-4 py-3 shadow-[0_2px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-body text-sm font-bold tracking-[-0.32px] text-cu-grey">
          <MapPin className="size-3.5" />
          สถานะปัจจุบัน
        </div>
        <StatusBadge status={status} locale={locale} />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[300px]">
        <div className="grid grid-cols-4">
          {STATUS_STEPS.map((step, index) => {
            const isDone = currentIndex >= index;
            const isCurrent = currentIndex === index;

            return (
              <div key={step} className="relative flex flex-col items-center gap-1.5">
                {index > 0 && (
                  <span
                    className={cn(
                      "absolute right-1/2 top-4 h-px w-[48px] translate-x-[-16px]",
                      currentIndex >= index ? "bg-cu-pink" : "bg-cu-grey/15"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-8 items-center justify-center rounded-2xl",
                    isDone ? "bg-cu-pink text-white" : "bg-cu-grey/10 text-cu-grey/45"
                  )}
                >
                  {isCurrent ? (
                    <CircleDot className="size-4" />
                  ) : isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Clock className="size-4" />
                  )}
                </span>
                <span
                  className={cn(
                    "min-h-[21px] text-center font-body text-xs leading-[21px] tracking-[-0.32px]",
                    isDone ? "font-bold text-cu-pink" : "text-cu-grey"
                  )}
                >
                  {locale === "th" ? STEP_LABELS[step].th : STEP_LABELS[step].en}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center font-body text-[10px] tracking-[-0.32px] text-cu-grey">
          {formatLastUpdated(updatedAt, locale)}
        </p>
      </div>
    </section>
  );
}

function PhotoStrip({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="font-body text-xs leading-[21px] tracking-[-0.32px] text-cu-grey">
        รูปประกอบ ({photos.length})
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.slice(0, 3).map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            className="h-[90px] rounded-lg bg-cu-cream bg-cover bg-center"
            style={{ backgroundImage: `url(${photo})` }}
            aria-label={`รูปประกอบ ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function StudentTicketStatusContent({ ticketId }: StudentTicketStatusContentProps) {
  const locale = useLocale();
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const tCategory = useTranslations("maintenance.categories");
  const queryClient = useQueryClient();
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const cancelMutation = useCancelTicket();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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
      <div className="min-h-dvh bg-cu-cream px-4 pt-20 text-cu-grey">
        <div className="mx-auto max-w-[393px] space-y-4">
          <div className="h-10 w-48 animate-pulse rounded bg-cu-cream-light" />
          <div className="h-36 animate-pulse rounded-xl bg-cu-cream-light" />
          <div className="h-72 animate-pulse rounded-xl bg-cu-cream-light" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-dvh bg-cu-cream px-4 pt-20 text-center font-body text-sm text-cu-grey">
        {t("detail.notFound")}
      </div>
    );
  }

  const status = safeStatus(ticket.status);
  const canCancel = ["under_review", "acknowledged"].includes(status);

  return (
    <div className="min-h-dvh bg-cu-cream pb-8 text-cu-grey">
      <header className="sticky top-0 z-30 bg-cu-cream/95 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-[393px] items-center justify-center px-4">
          <Link
            href="/maintenance"
            aria-label="กลับ"
            className="absolute left-4 flex size-10 items-center justify-center rounded-full border border-cu-grey/20 bg-cu-cream-light"
          >
            <ChevronLeft className="size-[18px]" />
          </Link>
          <h1 className="font-heading text-sm font-bold text-black">สถานะการแจ้งซ่อม</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[393px] space-y-4 px-4 pt-16">
        <section className="flex items-start justify-between gap-3">
          <div className="min-w-0 tracking-[-0.32px]">
            <h2 className="truncate font-heading text-2xl font-bold leading-[21px] text-cu-pink">
              {ticketCode(ticket)}
            </h2>
            <p className="mt-1 font-body text-sm leading-[21px] text-cu-grey">
              ติดตามสถานะการแจ้งซ่อม
            </p>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="mt-0.5 flex shrink-0 items-center gap-0.5 font-body text-xs leading-[21px] tracking-[-0.32px] text-red-500 underline"
            >
              <X className="size-3" />
              ยกเลิกการแจ้งซ่อมนี้
            </button>
          )}
        </section>

        <StatusTracker status={status} updatedAt={ticket.updated_at} locale={locale} />

        <section className="rounded-[14px] bg-cu-cream-light p-4 shadow-[0_2px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-body text-sm font-bold leading-[21px] tracking-[-0.32px] text-cu-grey">
              <Wrench className="size-3.5" />
              รายละเอียดการแจ้งซ่อม
            </div>
            <p className="shrink-0 font-body text-[10px] leading-[19px] tracking-[-0.32px] text-cu-grey">
              แจ้งเมื่อ {formatShortDateTime(ticket.created_at, locale)} ({relativeSubmitted(ticket.created_at, locale)})
            </p>
          </div>

          <div className="my-3 border-t border-dashed border-cu-grey/20" />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-cu-pink">
                <CategoryIcon category={ticket.category} size={20} />
                <p className="font-body text-base font-bold leading-[21px] tracking-[-0.32px]">
                  {tCategory(ticket.category)}
                </p>
              </div>
              <p className="font-body text-sm leading-[21px] tracking-[-0.32px] text-cu-grey">
                {ticket.description || ticket.title}
              </p>
            </div>

            <PhotoStrip photos={ticket.photos ?? []} />

            {(ticket.appointment_date || ticket.appointment_time) && (
              <div className="space-y-0.5">
                <p className="font-body text-xs leading-[21px] tracking-[-0.32px] text-cu-grey">
                  เวลาที่ต้องการนัดหมาย
                </p>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-body text-sm font-bold leading-[21px] text-cu-grey">
                  {ticket.appointment_date && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-4" />
                      {formatAppointmentDate(ticket.appointment_date, locale)}
                    </span>
                  )}
                  {ticket.appointment_time && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-4" />
                      {formatAppointmentTime(ticket.appointment_time)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {status === "cancelled" && ticket.failure_reason && (
              <div className="rounded-lg bg-red-50 p-3 font-body text-sm text-red-600">
                <p className="font-bold">{t("detail.cancelReason")}</p>
                <p>{ticket.failure_reason}</p>
              </div>
            )}
          </div>
        </section>

        <section className="pt-24 text-center tracking-[-0.32px]">
          <p className="font-body text-xs leading-[21px] text-cu-grey">
            ยังไม่ได้รับการแก้ไขใช่ไหม?
          </p>
          <button type="button" className="font-body text-sm font-bold leading-[21px] text-cu-pink underline">
            แจ้งปัญหาการดำเนินการ
          </button>
        </section>
      </main>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("detail.cancelDialogTitle")}</DialogTitle>
            <DialogDescription>{t("detail.cancelDialogDesc")}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder={t("detail.cancelReasonPlaceholder")}
            rows={3}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelMutation.isPending}>
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
    </div>
  );
}
