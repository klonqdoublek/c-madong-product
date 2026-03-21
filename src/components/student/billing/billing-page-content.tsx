"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyBills } from "@/hooks/use-bills";
import { formatCurrency, BILL_STATUS_COLORS, THAI_MONTHS } from "@/lib/utils";
import type { BillStatus } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export function BillingPageContent() {
  const t = useTranslations("billing");
  const tStatus = useTranslations("billing.status");
  const { data: bills, isLoading } = useMyBills();

  // Split into current (pending/overdue) and history (paid/cancelled)
  const currentBills = bills?.filter(
    (b) => b.status === "pending" || b.status === "overdue"
  ) ?? [];
  const historyBills = bills?.filter(
    (b) => b.status === "paid" || b.status === "cancelled"
  ) ?? [];

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-6 p-4">
        {/* Current Bills */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : currentBills.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">
              {t("currentBills")}
            </h2>
            {currentBills.map((bill) => (
              <Link key={bill.id} href={`/billing/${bill.id}`}>
                <Card
                  className={`shadow-card transition-all hover:shadow-hover ${
                    bill.status === "overdue"
                      ? "border-l-4 border-l-red-400"
                      : "border-l-4 border-l-yellow-400"
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Banknote className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {t("billMonth", {
                            month: THAI_MONTHS[bill.billing_month - 1],
                          })}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${BILL_STATUS_COLORS[bill.status as BillStatus]}`}
                        >
                          {tStatus(bill.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("dueDateLabel")}:{" "}
                        {new Date(bill.due_date).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg font-bold text-primary">
                        {formatCurrency(Number(bill.total_amount))}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <Banknote className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("noBills")}</p>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {historyBills.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">
              {t("history")}
            </h2>
            <div className="space-y-2">
              {historyBills.map((bill) => (
                <Link key={bill.id} href={`/billing/${bill.id}`}>
                  <div className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {t("billMonth", {
                          month: THAI_MONTHS[bill.billing_month - 1],
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bill.created_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(Number(bill.total_amount))}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${BILL_STATUS_COLORS[bill.status as BillStatus]}`}
                      >
                        {tStatus(bill.status)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
