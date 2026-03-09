"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyBills } from "@/hooks/use-bills";
import { formatCurrency, THAI_MONTHS } from "@/lib/utils";
import { Banknote, ChevronRight, AlertTriangle } from "lucide-react";

export function DashboardBillCard() {
  const t = useTranslations("dashboard");
  const tBilling = useTranslations("billing");
  const tStatus = useTranslations("billing.status");
  const { data: bills, isLoading } = useMyBills();

  // Find the most urgent pending/overdue bill
  const pendingBills =
    bills?.filter((b) => b.status === "pending" || b.status === "overdue") ??
    [];
  const bill = pendingBills[0]; // Most recent pending bill

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!bill) return null;

  const isOverdue = bill.status === "overdue";

  return (
    <Link href="/billing" className="block">
      <div
        className={`rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
          isOverdue ? "border-destructive/30 bg-destructive/5" : "bg-card"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isOverdue
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {tBilling("billMonth", {
                  month: THAI_MONTHS[bill.billing_month - 1],
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {tBilling("dueDateLabel")}:{" "}
                {new Date(bill.due_date).toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-right">
              <p className="font-heading text-lg font-bold text-primary">
                {formatCurrency(Number(bill.total_amount))}
              </p>
              <span
                className={`text-xs font-medium ${
                  isOverdue ? "text-destructive" : "text-yellow-600"
                }`}
              >
                {tStatus(bill.status)}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {pendingBills.length > 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("moreBills", { count: pendingBills.length - 1 })}
          </p>
        )}
      </div>
    </Link>
  );
}
