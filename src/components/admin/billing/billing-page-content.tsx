"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useBills, useBatchSendReminder } from "@/hooks/use-bills";
import { formatCurrency, BILL_STATUS_COLORS, THAI_MONTHS } from "@/lib/utils";
import type { BillStatus } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

const currentYear = new Date().getFullYear();

export function BillingPageContent() {
  const t = useTranslations("admin.billingPage");
  const tStatus = useTranslations("billing.status");

  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState<number | undefined>();
  const [yearFilter, setYearFilter] = useState<number | undefined>();
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());

  const { data: bills, isLoading } = useBills({
    status: statusFilter,
    month: monthFilter,
    year: yearFilter,
  });

  const batchSend = useBatchSendReminder();

  // Compute stats
  const totalRevenue = bills
    ?.filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + Number(b.total_amount), 0) ?? 0;
  const outstanding = bills
    ?.filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + Number(b.total_amount), 0) ?? 0;
  const overdueCount = bills?.filter((b) => b.status === "overdue").length ?? 0;
  const paidCount = bills?.filter((b) => b.status === "paid").length ?? 0;

  const statCards = [
    {
      label: t("totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: "bg-green-50 text-green-600",
    },
    {
      label: t("outstanding"),
      value: formatCurrency(outstanding),
      icon: <Clock className="h-5 w-5" />,
      iconBg: "bg-yellow-50 text-yellow-600",
    },
    {
      label: t("overdueCount"),
      value: String(overdueCount),
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: "bg-red-50 text-red-600",
    },
    {
      label: t("paidCount"),
      value: String(paidCount),
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconBg: "bg-green-50 text-green-600",
    },
  ];

  const toggleBill = (billId: string) => {
    setSelectedBills((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) {
        next.delete(billId);
      } else {
        next.add(billId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!bills) return;
    if (selectedBills.size === bills.length) {
      setSelectedBills(new Set());
    } else {
      setSelectedBills(new Set(bills.map((b) => b.id)));
    }
  };

  const handleBatchSend = async () => {
    if (selectedBills.size === 0) return;
    try {
      const { sent, failed } = await batchSend.mutateAsync(
        Array.from(selectedBills)
      );
      if (sent > 0) {
        toast.success(`ส่งแจ้งเตือนสำเร็จ ${sent} รายการ`);
      }
      if (failed > 0) {
        toast.error(`ส่งไม่สำเร็จ ${failed} รายการ (นิสิตไม่มี LINE UID)`);
      }
      setSelectedBills(new Set());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "ส่งแจ้งเตือนไม่สำเร็จ"
      );
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <AdminBreadcrumb />
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/admin/billing/create">
          <Button className="gradient-primary text-white shadow-sm hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" />
            {t("createBill")}
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-2xl font-bold">
                  {isLoading ? (
                    <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Batch Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="pending">{tStatus("pending")}</SelectItem>
            <SelectItem value="paid">{tStatus("paid")}</SelectItem>
            <SelectItem value="overdue">{tStatus("overdue")}</SelectItem>
            <SelectItem value="cancelled">{tStatus("cancelled")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={monthFilter?.toString() ?? "all"}
          onValueChange={(v) =>
            setMonthFilter(v === "all" ? undefined : parseInt(v))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("allMonths")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allMonths")}</SelectItem>
            {THAI_MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={yearFilter?.toString() ?? "all"}
          onValueChange={(v) =>
            setYearFilter(v === "all" ? undefined : parseInt(v))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("allYears")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allYears")}</SelectItem>
            {[currentYear, currentYear - 1].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y + 543}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Batch send button */}
        {selectedBills.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchSend}
            disabled={batchSend.isPending}
            className="ml-auto border-primary text-primary hover:bg-primary/5"
          >
            {batchSend.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            {t("sendLineReminder")} ({selectedBills.size})
          </Button>
        )}
      </div>

      {/* Bills List */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-base">
                <Banknote className="mr-2 inline-block h-4 w-4" />
                {t("billsList")}
              </CardTitle>
              <CardDescription>
                {t("totalCount", { count: bills?.length ?? 0 })}
              </CardDescription>
            </div>
            {bills && bills.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    bills.length > 0 && selectedBills.size === bills.length
                  }
                  onCheckedChange={toggleAll}
                />
                <span className="text-xs text-muted-foreground">เลือกทั้งหมด</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="ml-auto h-5 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : bills && bills.length > 0 ? (
              bills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedBills.has(bill.id)}
                    onCheckedChange={() => toggleBill(bill.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Link
                    href={`/admin/billing/${bill.id}`}
                    className="flex flex-1 items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 shrink-0 text-primary" />
                        <p className="truncate text-sm font-medium">
                          {t("billLabel", {
                            month: THAI_MONTHS[bill.billing_month - 1],
                            year: bill.billing_year + 543,
                            round: bill.billing_round,
                          })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("dueDate")}: {new Date(bill.due_date).toLocaleDateString("th-TH")}
                        {" · "}
                        {formatCurrency(Number(bill.total_amount))}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 shrink-0 ${BILL_STATUS_COLORS[bill.status as BillStatus]}`}
                    >
                      {tStatus(bill.status)}
                    </Badge>
                  </Link>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t("noBills")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
