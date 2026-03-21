"use client";

import { useTranslations } from "next-intl";
import { useMyParcels, useMarkParcelPickedUp } from "@/hooks/use-parcels";
import { Package, Check, Clock, Bell, RotateCcw, XCircle, Truck } from "lucide-react";
import type { ParcelStatus } from "@/lib/supabase/types";
import { PageHeader } from "@/components/layout/page-header";

const STATUS_CONFIG: Record<ParcelStatus, { label: string; labelEn: string; color: string; icon: typeof Clock }> = {
  pending: { label: "รอแจ้ง", labelEn: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  notified: { label: "รอรับ", labelEn: "Ready", color: "bg-blue-100 text-blue-800", icon: Bell },
  picked_up: { label: "รับแล้ว", labelEn: "Picked Up", color: "bg-green-100 text-green-800", icon: Check },
  returned: { label: "ส่งคืน", labelEn: "Returned", color: "bg-gray-100 text-gray-600", icon: RotateCcw },
  cancelled: { label: "ยกเลิก", labelEn: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

const PARCEL_TYPE_EMOJI: Record<string, string> = {
  box: "📦",
  envelope: "💌",
  bag: "👜",
  oversized: "📐",
  other: "📮",
};

export function ParcelsPageContent() {
  const t = useTranslations("parcels");
  const { data: parcels, isLoading } = useMyParcels();
  const markPickedUp = useMarkParcelPickedUp();

  const activeParcels = (parcels ?? []).filter(
    (p) => p.status === "pending" || p.status === "notified"
  );
  const historyParcels = (parcels ?? []).filter(
    (p) => p.status !== "pending" && p.status !== "notified"
  );

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-6 p-4 pb-24">

      {/* Active Parcels */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : activeParcels.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("awaitingPickupSection")}
          </h2>
          {activeParcels.map((parcel) => {
            const statusInfo = STATUS_CONFIG[parcel.status as ParcelStatus] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const emoji = PARCEL_TYPE_EMOJI[parcel.parcel_type] ?? "📦";

            return (
              <div
                key={parcel.id}
                className="rounded-xl border-2 border-primary/20 bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    {parcel.tracking_number && (
                      <p className="text-sm font-medium mt-1">
                        {t("tracking")}: {parcel.tracking_number}
                      </p>
                    )}
                    {parcel.courier && (
                      <p className="text-xs text-muted-foreground">{parcel.courier}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {parcel.pickup_location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(parcel.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markPickedUp.mutate(parcel.id)}
                  disabled={markPickedUp.isPending}
                  className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check className="mr-1.5 inline h-4 w-4" />
                  {markPickedUp.isPending ? t("confirming") : t("confirmPickedUp")}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">{t("noActive")}</p>
        </div>
      )}

      {/* History */}
      {historyParcels.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("history")}
          </h2>
          {historyParcels.map((parcel) => {
            const statusInfo = STATUS_CONFIG[parcel.status as ParcelStatus] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const emoji = PARCEL_TYPE_EMOJI[parcel.parcel_type] ?? "📦";

            return (
              <div
                key={parcel.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 opacity-75"
              >
                <div className="text-lg">{emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                    {parcel.tracking_number && (
                      <span className="text-xs text-muted-foreground truncate">
                        {parcel.tracking_number}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {parcel.courier && `${parcel.courier} · `}
                    {new Date(parcel.created_at).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })}
                    {parcel.picked_up_at && (
                      <span>
                        {" "}
                        · {t("pickedUpAt")}{" "}
                        {new Date(parcel.picked_up_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
