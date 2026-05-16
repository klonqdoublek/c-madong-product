"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, Clock3, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useMyTickets } from "@/hooks/use-my-tickets";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { cn } from "@/lib/utils";
import type { MaintenanceRequest } from "@/types/maintenance";
import type { MaintenanceStatus } from "@/lib/supabase/types";

type Ticket = MaintenanceRequest;

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
    th: "ส่งคำขอแล้ว",
    en: "Submitted",
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

function formatSubmitted(dateStr: string, locale: string) {
  const created = new Date(dateStr);
  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const isThai = locale === "th";

  if (isThai) {
    if (diffMin < 1) return "แจ้งเมื่อสักครู่";
    if (diffMin < 60) return `แจ้งเมื่อ ${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `แจ้งเมื่อ ${diffHour} ชั่วโมงก่อน`;
    return `แจ้งเมื่อ ${diffDay} วันก่อน`;
  }

  if (diffMin < 1) return "Submitted just now";
  if (diffMin < 60) return `Submitted ${diffMin}m ago`;
  if (diffHour < 24) return `Submitted ${diffHour}h ago`;
  return `Submitted ${diffDay}d ago`;
}

function formatDateGroup(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function dateKey(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function ticketCode(ticket: Ticket) {
  return ticket.ticket_code ? `Ticket #${ticket.ticket_code}` : `Ticket #${ticket.id.slice(0, 8)}`;
}

function StudentStatusBadge({ status, locale }: { status: string; locale: string }) {
  const config = STUDENT_STATUS[(status as MaintenanceStatus) || "under_review"] ?? STUDENT_STATUS.under_review;

  return (
    <span
      className={cn(
        "absolute right-2 top-2 inline-flex h-7 min-w-20 items-center justify-center gap-1 rounded-full px-2.5 font-body text-xs font-bold tracking-[-0.32px]",
        config.badge,
        config.text
      )}
    >
      <span className={cn("size-2 rounded-full", config.dot)} />
      {locale === "th" ? config.th : config.en}
    </span>
  );
}

function RepairTicketCard({ ticket, locale }: { ticket: Ticket; locale: string }) {
  const tCategory = useTranslations("maintenance.categories");

  return (
    <Link
      href={`/maintenance/${ticket.id}`}
      className="relative flex h-20 w-full items-end rounded-lg bg-cu-cream-light pb-[9px] pl-2 pr-[9px] pt-[7px] shadow-[0_1px_1.5px_rgba(0,0,0,0.01)] transition-transform active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-cu-cream text-cu-pink">
          <CategoryIcon category={ticket.category} size={22} />
        </div>

        <div className="min-w-0 pr-20 tracking-[-0.32px]">
          <div className="flex max-w-[190px] items-center gap-1 overflow-hidden whitespace-nowrap font-body text-xs leading-[21px] text-[#7e7b75]">
            <span className="truncate">{tCategory(ticket.category)}</span>
            <span className="font-bold">•</span>
            <span className="truncate">{ticketCode(ticket)}</span>
          </div>
          <p className="max-w-[190px] truncate font-heading text-base font-bold leading-[21px] text-cu-grey">
            {ticket.title}
          </p>
          <div className="flex items-center gap-0.5 font-body text-[10px] leading-[21px] text-[#7e7b75]">
            <Clock3 className="size-2.5 shrink-0" />
            <span className="truncate">{formatSubmitted(ticket.created_at, locale)}</span>
          </div>
        </div>
      </div>

      <StudentStatusBadge status={ticket.status} locale={locale} />
    </Link>
  );
}

function HistoryEmptyState() {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-2 pt-8 text-center">
      <div className="flex size-[58px] items-center justify-center rounded-full border border-cu-grey/10 text-cu-grey/20">
        <Wrench className="size-7" />
      </div>
      <p className="font-body text-base tracking-[-0.32px] text-cu-grey/50">
        ยังไม่มีรายการที่เคยแจ้งซ่อมตอนนี้นะ!
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-lg bg-cu-cream-light" />
      <div className="border-t border-dashed border-cu-grey/20" />
      <div className="space-y-3">
        <div className="h-5 w-36 animate-pulse rounded bg-cu-cream-light" />
        <div className="h-20 animate-pulse rounded-lg bg-cu-cream-light" />
        <div className="h-20 animate-pulse rounded-lg bg-cu-cream-light" />
      </div>
    </div>
  );
}

export function StudentMaintenancePageContent() {
  const locale = useLocale();
  const t = useTranslations("maintenance");
  const { data: tickets, isLoading } = useMyTickets();

  const latestTicket = tickets?.[0];
  const historyGroups = useMemo(() => {
    const historyTickets = tickets?.slice(1) ?? [];
    const groups: Array<{ key: string; label: string; items: Ticket[] }> = [];

    for (const ticket of historyTickets) {
      const key = dateKey(ticket.created_at);
      const current = groups.find((group) => group.key === key);

      if (current) {
        current.items.push(ticket);
      } else {
        groups.push({
          key,
          label: formatDateGroup(ticket.created_at, locale),
          items: [ticket],
        });
      }
    }

    return groups;
  }, [tickets, locale]);

  return (
    <div className="min-h-dvh bg-cu-cream pb-8 text-cu-grey">
      <header className="sticky top-0 z-30 bg-cu-cream/95 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-[393px] items-center justify-center px-4">
          <Link
            href="/dashboard"
            aria-label="กลับ"
            className="absolute left-4 flex size-10 items-center justify-center rounded-full border border-cu-grey/20 bg-cu-cream-light"
          >
            <ChevronLeft className="size-[18px]" />
          </Link>
          <h1 className="font-heading text-sm font-bold text-black">{t("title")}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[393px] px-4 pt-8">
        <section className="flex items-start justify-between">
          <div className="tracking-[-0.32px]">
            <h2 className="font-heading text-2xl font-bold leading-[21px] text-cu-grey">
              การแจ้งซ่อมของฉัน
            </h2>
            <p className="mt-4 font-body text-xs text-cu-grey">รายการล่าสุด</p>
          </div>
          <Link
            href="/maintenance/new"
            className="flex h-10 w-[150px] items-center justify-center gap-1 rounded-full bg-cu-pink px-3 font-body text-sm font-bold tracking-[-0.32px] text-white active:scale-[0.98]"
          >
            <Wrench className="size-4" />
            + {t("newRequest")}
          </Link>
        </section>

        <section className="mt-4">
          {isLoading ? (
            <LoadingState />
          ) : latestTicket ? (
            <RepairTicketCard ticket={latestTicket} locale={locale} />
          ) : (
            <div className="rounded-lg border border-dashed border-cu-grey/20 bg-cu-cream-light py-8 text-center font-body text-sm text-cu-grey/60">
              {t("detail.noTickets")}
            </div>
          )}
        </section>

        {!isLoading && (
          <>
            <div className="mt-5 border-t border-dashed border-cu-grey/20" />

            <section className="mt-4">
              <div className="flex items-center justify-between tracking-[-0.32px]">
                <h2 className="font-heading text-xl font-bold leading-[21px] text-cu-grey">
                  ประวัติการแจ้งซ่อม
                </h2>
                <button className="font-body text-base font-bold leading-[21px] text-cu-pink underline">
                  ดูทั้งหมด
                </button>
              </div>

              {historyGroups.length > 0 ? (
                <div className="mt-4 space-y-[18px]">
                  {historyGroups.map((group) => (
                    <div key={group.key} className="space-y-1">
                      <p className="font-heading text-xs leading-[21px] tracking-[-0.32px] text-cu-grey">
                        {group.label}
                      </p>
                      <div className="space-y-[11px]">
                        {group.items.map((ticket) => (
                          <RepairTicketCard key={ticket.id} ticket={ticket} locale={locale} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HistoryEmptyState />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
