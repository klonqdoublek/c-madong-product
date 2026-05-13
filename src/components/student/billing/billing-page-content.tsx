"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Banknote,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplets,
  FileText,
  Home,
  Info,
  ReceiptText,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useMyBills } from "@/hooks/use-bills";
import { formatCurrency, THAI_MONTHS } from "@/lib/utils";
import type { BillStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type BillItem = {
  id: string;
  label: string;
  category: string;
  amount: number;
};

type BillWithItems = {
  id: string;
  billing_month: number;
  billing_year: number;
  billing_round: number;
  due_date: string;
  paid_at: string | null;
  status: BillStatus;
  total_amount: number;
  created_at: string | null;
  bill_items?: BillItem[];
};

const STATUS_CONFIG: Record<BillStatus, { label: string; className: string }> = {
  pending: { label: "รอชำระ", className: "bg-[#fff9ee] text-[#ffa600]" },
  sent: { label: "รอชำระ", className: "bg-[#fff9ee] text-[#ffa600]" },
  viewed: { label: "รอชำระ", className: "bg-[#fff9ee] text-[#ffa600]" },
  overdue: { label: "เกินกำหนด", className: "bg-[#ff6f6f]/20 text-[#e84a4a]" },
  paid: { label: "ชำระแล้ว", className: "bg-[#b8ffb2] text-cu-task-green-dark" },
  cancelled: { label: "ยกเลิก", className: "bg-cu-grey/10 text-cu-grey" },
  adjusted: { label: "ปรับปรุง", className: "bg-cu-light-pink text-cu-pink" },
};

const BILL_BREAKDOWN = [
  { category: "water", label: "ค่าน้ำ", icon: Droplets, fallback: 0 },
  { category: "room", label: "ค่าห้อง", icon: Home, fallback: 0 },
  { category: "electricity", label: "ค่าไฟ", icon: Zap, fallback: 0 },
  { category: "fine", label: "ค่าปรับ", icon: Banknote, fallback: 0 },
];

function formatThaiDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatThaiDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  const day = formatThaiDate(value);
  const time = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${day} ก่อน ${time} น.`;
}

function monthLabel(bill: BillWithItems) {
  return `เดือน${THAI_MONTHS[bill.billing_month - 1] ?? ""} ${bill.billing_year + 543}`;
}

function statusLabel(status: BillStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

function getCategoryAmount(items: BillItem[] | undefined, category: string) {
  return (items ?? [])
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function daysUntil(value: string | null | undefined) {
  if (!value) return null;

  const due = new Date(value);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function MoneyText({ amount }: { amount: number }) {
  const formatted = formatCurrency(Number(amount || 0)).replace("฿", "฿ ");

  return <>{formatted}</>;
}

function BillStatusPill({ status }: { status: BillStatus }) {
  const config = statusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-3 font-body text-xs font-bold",
        config.className
      )}
    >
      <span className="size-2 rounded-full bg-current opacity-60" />
      {config.label}
    </span>
  );
}

function SummaryCard({ bill }: { bill: BillWithItems }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-cu-light-pink bg-cu-pink p-[15px] text-white shadow-[inset_-4px_-4px_10px_rgba(255,71,142,0.25),inset_4px_4px_20px_rgba(185,72,106,0.3)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(132deg,rgba(255,255,255,0.25)_8%,rgba(255,255,255,0)_48%)]" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1 font-body text-xs">
              <span>ยอดที่ต้องชำระรวม</span>
              <Info className="size-4" />
            </div>
            <p className="font-heading text-5xl font-bold leading-tight tracking-[-0.32px]">
              <MoneyText amount={bill.total_amount} />
            </p>
            <p className="font-body text-[10px] tracking-[-0.32px]">
              อัปเดทล่าสุด <span className="font-bold">{formatThaiDate(bill.created_at)}</span>
            </p>
          </div>
          <BillStatusPill status={bill.status} />
        </div>

        <div className="my-3 border-t border-white/35" />

        <div className="grid grid-cols-4 gap-2">
          {BILL_BREAKDOWN.map(({ category, label, icon: Icon }) => {
            const amount = getCategoryAmount(bill.bill_items, category);
            return (
              <div
                key={category}
                className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-cu-light-pink bg-[#fefbfc] px-1 py-1 text-center"
              >
                <div className="mb-0.5 flex items-center gap-1 font-body text-xs font-bold text-cu-grey">
                  <Icon className="size-3" />
                  {label}
                </div>
                <p className="font-body text-base font-bold leading-none text-cu-pink">
                  {amount > 0 ? amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HistoryItem({ bill }: { bill: BillWithItems }) {
  return (
    <Link
      href={`/billing/${bill.id}`}
      className="flex items-center justify-between rounded-xl border border-cu-grey/10 bg-cu-cream-light px-4 py-2"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-cu-task-green/10">
          <ReceiptText className="size-7 text-cu-task-green-dark" />
        </div>
        <div className="min-w-0 font-body tracking-[-0.32px]">
          <p className="truncate text-sm font-bold text-cu-grey">{monthLabel(bill)}</p>
          <p
            className={cn(
              "truncate text-xs",
              bill.status === "paid" ? "text-cu-task-green-dark" : "text-cu-grey"
            )}
          >
            {bill.status === "paid" && bill.paid_at
              ? `ชำระเมื่อ ${formatThaiDate(bill.paid_at)}`
              : statusLabel(bill.status).label}
          </p>
        </div>
      </div>
      <p className="shrink-0 font-body text-base font-bold text-cu-grey">
        {Number(bill.total_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        บาท
      </p>
    </Link>
  );
}

export function BillingPageContent() {
  const t = useTranslations("billing");
  const { data: rawBills, isLoading } = useMyBills();
  const [query, setQuery] = useState("");

  const bills = (rawBills ?? []) as BillWithItems[];
  const featuredBill =
    bills.find((bill) => ["pending", "sent", "viewed", "overdue"].includes(bill.status)) ??
    bills[0] ??
    null;
  const historyBills = bills.filter((bill) => bill.id !== featuredBill?.id);
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");

  const filteredHistory = useMemo(() => {
    if (!normalizedQuery) return historyBills;

    return historyBills.filter((bill) =>
      [monthLabel(bill), statusLabel(bill.status).label, String(bill.total_amount)]
        .join(" ")
        .toLocaleLowerCase("th-TH")
        .includes(normalizedQuery)
    );
  }, [historyBills, normalizedQuery]);

  const dueInDays = daysUntil(featuredBill?.due_date);

  return (
    <div className="min-h-dvh bg-cu-cream pb-8 text-cu-grey">
      <header className="sticky top-0 z-30 bg-cu-cream/95 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-[393px] items-center justify-center px-4">
          <Link
            href="/dashboard"
            aria-label="กลับ"
            className="absolute left-4 flex size-10 items-center justify-center rounded-full border border-cu-grey/20 bg-cu-cream-light"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="font-heading text-sm font-bold text-black">{t("title")}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[393px] space-y-4 px-4 pt-2">
        <section className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-[-0.32px]">
            ค่าหอพักรอชำระ
          </h2>
          <div className="flex items-center gap-1 font-body text-sm text-cu-grey">
            <CalendarDays className="size-4" />
            {featuredBill ? monthLabel(featuredBill) : "เดือนกุมภาพันธ์ 2569"}
          </div>
        </section>

        {isLoading ? (
          <div className="h-48 animate-pulse rounded-xl bg-cu-cream-light" />
        ) : featuredBill ? (
          <>
            <SummaryCard bill={featuredBill} />

            <section className="grid grid-cols-2 gap-2">
              <button className="flex h-[46px] items-center justify-center gap-1 rounded-full border border-[#ffd4e5] bg-cu-pink px-3 font-body text-sm font-bold text-cu-pink-tint shadow-[0_1px_1.5px_rgba(211,39,82,0.02)]">
                <Download className="size-4" />
                ดาวน์โหลดใบแจ้งชำระ
              </button>
              <button
                className={cn(
                  "flex h-[46px] items-center justify-center gap-1 rounded-full border px-3 font-body text-sm font-bold",
                  featuredBill.status === "paid"
                    ? "border-[#ffd4e5] bg-cu-pink text-cu-pink-tint"
                    : "border-cu-grey/10 bg-cu-grey/10 text-cu-grey"
                )}
              >
                <FileText className="size-4" />
                ดาวน์โหลดใบเสร็จ
              </button>
            </section>

            {dueInDays !== null && dueInDays >= 0 && featuredBill.status !== "paid" && (
              <section className="relative overflow-hidden rounded-xl border border-dashed border-cu-grey/20 bg-[#fef3c7] p-3">
                <button aria-label="ปิด" className="absolute right-2 top-2 text-cu-pink">
                  <X className="size-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex size-[55px] shrink-0 items-center justify-center rounded-full bg-cu-pink text-white">
                    <Bell className="size-8" />
                  </div>
                  <div className="font-body text-cu-pink tracking-[-0.32px]">
                    <p className="font-heading text-2xl font-bold">อีก {dueInDays} วัน!</p>
                    <p className="text-sm">ให้พี่ซีช่วยเตือนให้นำเงินเข้าบัญชีเลย!</p>
                  </div>
                  <Sparkles className="ml-auto mr-2 size-10 text-cu-pink" />
                </div>
              </section>
            )}

            <section className="flex gap-3">
              <div className="w-px bg-cu-pink" />
              <div className="font-body tracking-[-0.32px]">
                <p className="font-heading text-sm font-bold">กำหนดการตัดค่าหอพัก</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full border border-cu-grey/10 bg-cu-cream-light px-3 py-1 text-xs font-bold">
                    รอบที่ {featuredBill.billing_round}
                  </span>
                  <span className="text-xs font-bold text-cu-pink">
                    {formatThaiDateTime(featuredBill.due_date)}
                  </span>
                </div>
              </div>
            </section>

            <section className="flex items-center justify-between rounded-xl border border-cu-grey/10 bg-cu-cream-light p-3">
              <div className="flex items-center gap-2">
                <div className="flex size-[41px] items-center justify-center rounded-md bg-[#138f4b] font-heading text-xl font-bold text-white">
                  K+
                </div>
                <div className="font-body tracking-[-0.32px]">
                  <p className="text-sm font-bold text-cu-grey">
                    ธนาคารกสิกรไทย <span className="text-[#9c9c9c]">*0002</span>
                  </p>
                  <span className="rounded-full border border-cu-grey/10 bg-cu-cream-light px-3 py-1 text-xs font-bold">
                    หักผ่านบัญชีอัตโนมัติ
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5" />
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-cu-grey/20 bg-cu-cream-light py-10 text-center">
            <Banknote className="mx-auto mb-2 size-8 text-cu-muted" />
            <p className="font-body text-sm text-cu-muted">{t("noBills")}</p>
          </div>
        )}

        <div className="border-t border-dashed border-cu-grey/20 pt-4" />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-cu-grey">
              ประวัติการทำรายการ
            </h2>
            <button className="font-body text-sm font-bold text-cu-pink underline">
              ดูทั้งหมด
            </button>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-full border border-cu-grey/10 bg-cu-cream-light px-3">
            <Search className="size-4 text-cu-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหารายการ"
              className="min-w-0 flex-1 bg-transparent font-body text-xs text-cu-grey outline-none placeholder:text-cu-muted"
            />
          </label>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[62px] animate-pulse rounded-xl bg-cu-cream-light" />
              ))
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((bill) => <HistoryItem key={bill.id} bill={bill} />)
            ) : (
              <div className="rounded-xl border border-dashed border-cu-grey/20 bg-cu-cream-light py-8 text-center font-body text-sm text-cu-muted">
                ไม่พบประวัติการทำรายการ
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
