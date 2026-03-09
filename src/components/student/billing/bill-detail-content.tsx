"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMyBill } from "@/hooks/use-bills";
import { formatCurrency, BILL_STATUS_COLORS, THAI_MONTHS, BILL_CATEGORIES } from "@/lib/utils";
import type { BillStatus } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, DoorOpen, Bed } from "lucide-react";

export function BillDetailContent({ billId }: { billId: string }) {
  const t = useTranslations("billing");
  const tStatus = useTranslations("billing.status");
  const router = useRouter();
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

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold">
            {t("billMonth", {
              month: THAI_MONTHS[bill.billing_month - 1],
            })}
          </h1>
          <Badge
            variant="secondary"
            className={`mt-0.5 ${BILL_STATUS_COLORS[bill.status as BillStatus]}`}
          >
            {tStatus(bill.status)}
          </Badge>
        </div>
      </div>

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
  );
}
