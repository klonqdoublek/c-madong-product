"use client";

import { useTranslations } from "next-intl";
import { useMyBill } from "@/hooks/use-bills";
import { formatCurrency, BILL_STATUS_COLORS, THAI_MONTHS, BILL_CATEGORIES } from "@/lib/utils";
import type { BillStatus } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, DoorOpen, Bed } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export function BillDetailContent({ billId }: { billId: string }) {
  const t = useTranslations("billing");
  const tStatus = useTranslations("billing.status");
  const { data: bill, isLoading } = useMyBill(billId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-muted-foreground">{t("billNotFound")}</p>
      </div>
    );
  }

  const billItems = (bill.bill_items ?? []) as {
    id: string;
    label: string;
    category: string;
    amount: number;
  }[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = bill.building as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const room = bill.room as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bed = bill.bed as any;

  const billTitle = t("billMonth", {
    month: THAI_MONTHS[bill.billing_month - 1],
  });

  return (
    <>
      <PageHeader title={billTitle} backHref="/billing" />
      <div className="space-y-4 p-4">

      {/* Total Amount Card */}
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">{t("totalAmount")}</span>
          <span className="font-heading text-2xl font-bold text-primary">
            {formatCurrency(Number(bill.total_amount))}
          </span>
        </CardContent>
      </Card>

      {/* Room Info */}
      {(building || room || bed) && (
        <Card className="shadow-card">
          <CardContent className="flex gap-4 p-4 text-sm">
            {building && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {building.name_th}
              </div>
            )}
            {room && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DoorOpen className="h-3.5 w-3.5" />
                {t("roomLabel", { room: room.room_number })}
              </div>
            )}
            {bed && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Bed className="h-3.5 w-3.5" />
                {t("bedLabel", { bed: bed.bed_label })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items Breakdown */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">
            {t("itemsBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {billItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5"
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">
                {formatCurrency(Number(item.amount))}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading font-semibold">{t("total")}</span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatCurrency(Number(bill.total_amount))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Due Date */}
      <Card className="shadow-card">
        <CardContent className="space-y-2 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("dueDateLabel")}</span>
            <span className="font-medium">
              {new Date(bill.due_date).toLocaleDateString("th-TH", {
                dateStyle: "long",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("roundLabel")}</span>
            <span>{t("roundValue", { n: bill.billing_round })}</span>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
