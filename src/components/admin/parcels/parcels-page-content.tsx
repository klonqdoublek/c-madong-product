"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParcels, useUpdateParcelStatus, useResendParcelNotification, useBulkNotifyParcels } from "@/hooks/use-parcels";
import { RegisterParcelForm } from "./register-parcel-form";
import { Package, Plus, Search, Bell, Check, Clock, Truck, XCircle, RotateCcw, Send } from "lucide-react";
import type { ParcelStatus, Database } from "@/lib/supabase/types";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

type Parcel = Database["public"]["Tables"]["parcels"]["Row"];
type ParcelWithProfile = Parcel & {
  profiles?: { full_name_th: string; student_id: string | null } | null;
};

const STATUS_CONFIG: Record<ParcelStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "รอแจ้ง", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  notified: { label: "แจ้งแล้ว", color: "bg-blue-100 text-blue-800", icon: Bell },
  picked_up: { label: "รับแล้ว", color: "bg-green-100 text-green-800", icon: Check },
  returned: { label: "ส่งคืน", color: "bg-gray-100 text-gray-600", icon: RotateCcw },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: XCircle },
};

const STATUS_FILTERS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอแจ้ง" },
  { value: "notified", label: "แจ้งแล้ว" },
  { value: "picked_up", label: "รับแล้ว" },
  { value: "returned", label: "ส่งคืน" },
  { value: "cancelled", label: "ยกเลิก" },
];

export function ParcelsPageContent() {
  const t = useTranslations("parcels");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useParcels({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });
  const updateStatus = useUpdateParcelStatus();
  const resendNotification = useResendParcelNotification();
  const bulkNotify = useBulkNotifyParcels();

  const parcels = (data?.data ?? []) as ParcelWithProfile[];
  const total = data?.total ?? 0;

  // Pending parcels that can be notified
  const pendingParcels = useMemo(
    () => parcels.filter((p) => p.status === "pending"),
    [parcels]
  );

  // Stats
  const pendingCount = parcels.filter((p) => p.status === "pending" || p.status === "notified").length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingParcels.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingParcels.map((p) => p.id)));
    }
  };

  const handleBulkNotify = async () => {
    if (selectedIds.size === 0) return;
    await bulkNotify.mutateAsync([...selectedIds]);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("adminTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("total")}: {total} {t("items")} | {t("awaitingPickup")}: {pendingCount}
          </p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("register")}
        </button>
      </div>

      {/* Bulk notify bar */}
      {pendingParcels.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-yellow-50 px-4 py-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === pendingParcels.length && pendingParcels.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            {t("selectAll")} ({pendingParcels.length})
          </label>
          <div className="flex-1" />
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkNotify}
              disabled={bulkNotify.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {bulkNotify.isPending
                ? t("sending")
                : `${t("notifySelected")} (${selectedIds.size})`}
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parcel List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : parcels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcels.map((parcel) => {
            const statusInfo = STATUS_CONFIG[parcel.status as ParcelStatus] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const profile = parcel.profiles;
            const isPending = parcel.status === "pending";

            return (
              <div
                key={parcel.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
              >
                {/* Checkbox for pending parcels */}
                {isPending ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(parcel.id)}
                    onChange={() => toggleSelect(parcel.id)}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 accent-primary"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {profile?.full_name_th ?? t("unknownStudent")}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {parcel.tracking_number && (
                      <span className="text-xs text-muted-foreground">
                        {t("tracking")}: {parcel.tracking_number}
                      </span>
                    )}
                    {parcel.courier && (
                      <span className="text-xs text-muted-foreground">
                        {parcel.courier}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(parcel.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {(parcel.status === "pending" || parcel.status === "notified") && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ id: parcel.id, status: "picked_up" })}
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                        title={t("markPickedUp")}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      {parcel.status === "pending" && (
                        <button
                          onClick={() => resendNotification.mutate(parcel.id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title={t("notifyOne")}
                        >
                          <Bell className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Dialog */}
      {showRegister && (
        <RegisterParcelForm onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}
