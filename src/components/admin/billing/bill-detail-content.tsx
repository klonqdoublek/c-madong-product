"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useBill, useUpdateBillStatus, useSendBillReminder, useDeleteBill } from "@/hooks/use-bills";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bell,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function BillDetailContent({ billId }: { billId: string }) {
  const t = useTranslations("admin.billingPage");
  const tStatus = useTranslations("billing.status");
  const router = useRouter();
  const { data: bill, isLoading } = useBill(billId);
  const updateStatus = useUpdateBillStatus();
  const sendReminder = useSendBillReminder();
  const deleteBill = useDeleteBill();
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("billNotFound")}</p>
      </div>
    );
  }

  const handleStatusChange = async (status: BillStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: billId,
        status,
        adminNotes: notes || undefined,
      });
      toast.success("อัปเดตสถานะสำเร็จ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handleSendReminder = async () => {
    try {
      await sendReminder.mutateAsync(billId);
      toast.success("ส่งแจ้งเตือน LINE สำเร็จ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งแจ้งเตือนไม่สำเร็จ");
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deleteBill.mutateAsync(billId);
      toast.success("ลบบิลสำเร็จ");
      router.push("/admin/billing");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบบิลไม่สำเร็จ");
    }
  };

  const billItems = (bill.bill_items ?? []) as {
    id: string;
    label: string;
    category: string;
    amount: number;
    notes: string | null;
  }[];

  const getCategoryLabel = (cat: string) => {
    return BILL_CATEGORIES.find((c) => c.value === cat)?.labelTh ?? cat;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">
            {t("billLabel", {
              month: THAI_MONTHS[bill.billing_month - 1],
              year: bill.billing_year + 543,
              round: bill.billing_round,
            })}
          </h1>
          <Badge
            variant="secondary"
            className={`mt-1 ${BILL_STATUS_COLORS[bill.status as BillStatus]}`}
          >
            {tStatus(bill.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bill Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Breakdown */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                {t("billItems")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {billItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryLabel(item.category)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(Number(item.amount))}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <span className="font-heading font-semibold">{t("total")}</span>
                <span className="font-heading text-xl font-bold text-primary">
                  {formatCurrency(Number(bill.total_amount))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bill Info */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                {t("billInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("dueDate")}</span>
                <span>{new Date(bill.due_date).toLocaleDateString("th-TH", { dateStyle: "long" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("createdAt")}</span>
                <span>{new Date(bill.created_at).toLocaleDateString("th-TH", { dateStyle: "long" })}</span>
              </div>
              {bill.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("paidAt")}</span>
                  <span>{new Date(bill.paid_at).toLocaleDateString("th-TH", { dateStyle: "long" })}</span>
                </div>
              )}
              {bill.admin_notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground">{t("adminNotes")}</span>
                  <p className="mt-1 rounded bg-muted p-2 text-sm">
                    {bill.admin_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Status Actions */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                {t("actions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Notes */}
              <Textarea
                placeholder={t("adminNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />

              {bill.status !== "paid" && (
                <Button
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleStatusChange("paid")}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  {t("markPaid")}
                </Button>
              )}

              {bill.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => handleStatusChange("overdue")}
                  disabled={updateStatus.isPending}
                >
                  <AlertTriangle className="mr-1.5 h-4 w-4" />
                  {t("markOverdue")}
                </Button>
              )}

              {bill.status !== "cancelled" && bill.status !== "paid" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  {t("markCancelled")}
                </Button>
              )}

              <Separator />

              {/* LINE Reminder */}
              <Button
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleSendReminder}
                disabled={sendReminder.isPending}
              >
                <Bell className="mr-1.5 h-4 w-4" />
                {sendReminder.isPending
                  ? t("sendingReminder")
                  : t("sendLineReminder")}
              </Button>

              {sendReminder.isSuccess && (
                <p className="text-center text-xs text-green-600">
                  {t("reminderSent")}
                </p>
              )}

              <Separator />

              {/* Delete */}
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteBill.isPending}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {t("deleteBill")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
