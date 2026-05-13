"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronLeft,
  CircleAlert,
  MapPin,
  Package,
  Search,
  X,
} from "lucide-react";
import { useMyParcels } from "@/hooks/use-parcels";
import type { Database, ParcelStatus } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Parcel = Database["public"]["Tables"]["parcels"]["Row"];

const PARCEL_TYPE_LABEL: Record<string, string> = {
  box: "กล่องพัสดุ",
  envelope: "ซองจดหมาย",
  bag: "ถุงพัสดุ",
  oversized: "พัสดุขนาดใหญ่",
  other: "พัสดุ",
};

const STATUS_CONFIG: Record<
  ParcelStatus,
  { label: string; className: string; icon: "dot" | "check" | "x" }
> = {
  pending: {
    label: "ยังไม่ได้รับ",
    className: "bg-[#fff9ee] text-[#ffa600]",
    icon: "dot",
  },
  notified: {
    label: "ยังไม่ได้รับ",
    className: "bg-[#fff9ee] text-[#ffa600]",
    icon: "dot",
  },
  picked_up: {
    label: "รับแล้ว",
    className: "bg-[#edf5e8] text-cu-task-green-dark",
    icon: "check",
  },
  returned: {
    label: "ไม่สำเร็จ",
    className: "bg-[#ff6f6f]/20 text-[#e84a4a]",
    icon: "x",
  },
  cancelled: {
    label: "ไม่สำเร็จ",
    className: "bg-[#ff6f6f]/20 text-[#e84a4a]",
    icon: "x",
  },
};

function formatParcelDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatParcelDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  const day = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${day} เวลา ${time} น.`;
}

function statusDate(parcel: Parcel) {
  return parcel.picked_up_at ?? parcel.notified_at ?? parcel.created_at;
}

function StatusBadge({ status }: { status: ParcelStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-3 font-body text-xs font-bold",
        config.className
      )}
    >
      {config.icon === "dot" && <span className="size-1.5 rounded-full bg-current" />}
      {config.icon === "check" && <Check className="size-3" />}
      {config.icon === "x" && <X className="size-3" />}
      {config.label}
    </span>
  );
}

function ParcelIcon({ muted }: { muted?: boolean }) {
  return (
    <div
      className={cn(
        "flex size-[46px] shrink-0 items-center justify-center rounded-full",
        muted ? "bg-cu-task-green/10" : "bg-white"
      )}
    >
      <Package className={cn("size-6", muted ? "text-cu-task-green" : "text-cu-pink")} />
    </div>
  );
}

function ParcelListCard({ parcel }: { parcel: Parcel }) {
  return (
    <article className="relative flex h-[70px] items-center gap-3 rounded-[10px] border border-cu-cream bg-cu-cream-light px-4 py-2">
      <ParcelIcon muted />
      <div className="min-w-0 flex-1 pr-20 font-body tracking-[-0.32px]">
        <p className="truncate text-xs text-black">
          {parcel.tracking_number || parcel.pickup_code || "-"}
        </p>
        <p className="truncate text-sm font-bold text-black">
          {parcel.description || PARCEL_TYPE_LABEL[parcel.parcel_type] || "พัสดุ"}
        </p>
        <p className="truncate text-xs text-cu-grey">
          เข้าระบบเมื่อ {formatParcelDateTime(parcel.created_at)}
        </p>
      </div>
      <div className="absolute right-2 top-2">
        <StatusBadge status={parcel.status} />
      </div>
    </article>
  );
}

function groupByDate(parcels: Parcel[]) {
  return parcels.reduce<Record<string, Parcel[]>>((acc, parcel) => {
    const key = formatParcelDate(statusDate(parcel));
    acc[key] = [...(acc[key] ?? []), parcel];
    return acc;
  }, {});
}

export function ParcelsPageContent() {
  const t = useTranslations("parcels");
  const { data: parcels, isLoading } = useMyParcels();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"unclaimed" | "claimed">("unclaimed");

  const allParcels = parcels ?? [];
  const unclaimedParcels = allParcels.filter(
    (p) => p.status === "pending" || p.status === "notified"
  );
  const claimedParcels = allParcels.filter(
    (p) => p.status !== "pending" && p.status !== "notified"
  );
  const featuredParcel = unclaimedParcels[0] ?? allParcels[0] ?? null;
  const listSource = tab === "unclaimed" ? unclaimedParcels : claimedParcels;
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");

  const filteredParcels = useMemo(() => {
    if (!normalizedQuery) return listSource;

    return listSource.filter((parcel) => {
      const haystack = [
        parcel.tracking_number,
        parcel.pickup_code,
        parcel.description,
        parcel.courier,
        parcel.pickup_location,
        PARCEL_TYPE_LABEL[parcel.parcel_type],
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("th-TH");

      return haystack.includes(normalizedQuery);
    });
  }, [listSource, normalizedQuery]);

  const groupedParcels = groupByDate(filteredParcels);

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

      <main className="mx-auto w-full max-w-[393px] space-y-5 px-4">
        <section className="flex items-center justify-between pt-2">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.32px]">
            พัสดุใหม่วันนี้
          </h2>
          <p className="font-body text-sm font-bold text-cu-pink">
            {unclaimedParcels.length} รายการใหม่
          </p>
        </section>

        <section className="relative">
          <div className="absolute inset-x-3 bottom-[-10px] h-8 rounded-xl bg-[#e2b6c5]" />
          <article className="relative h-[124px] overflow-hidden rounded-2xl border border-cu-light-pink bg-cu-pink px-[18px] py-6 text-white shadow-[inset_-4px_-4px_10px_rgba(255,71,142,0.25),inset_4px_4px_20px_rgba(185,72,106,0.3)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(144deg,rgba(255,255,255,0.25)_8%,rgba(255,255,255,0)_48%)]" />
            {featuredParcel ? (
              <div className="relative flex items-center gap-4">
                <ParcelIcon />
                <div className="min-w-0 flex-1 font-body tracking-[-0.32px]">
                  <p className="font-body text-xl font-bold">กล่องพัสดุ</p>
                  <p className="mt-1 text-xs">
                    เลขพัสดุ: {featuredParcel.tracking_number || featuredParcel.pickup_code || "-"}
                  </p>
                  <p className="mt-1 truncate text-xs">
                    มาถึงเมื่อ{" "}
                    <span className="font-bold">
                      {formatParcelDateTime(featuredParcel.notified_at ?? featuredParcel.created_at)}
                    </span>
                  </p>
                </div>
                <div className="absolute right-0 top-[-12px]">
                  <StatusBadge status={featuredParcel.status} />
                </div>
              </div>
            ) : (
              <div className="relative flex h-full items-center gap-4">
                <ParcelIcon />
                <div>
                  <p className="font-body text-xl font-bold">ยังไม่มีพัสดุใหม่</p>
                  <p className="text-xs">รายการใหม่จะแสดงที่นี่เมื่อเข้าระบบ</p>
                </div>
              </div>
            )}
          </article>
          <div className="mt-5 flex justify-center gap-1">
            <span className="h-[3px] w-5 rounded-full bg-cu-pink" />
            <span className="size-[3px] rounded-full bg-cu-pink/60" />
            <span className="size-[3px] rounded-full bg-cu-pink/60" />
          </div>
        </section>

        <section className="rounded-[10px] border border-dashed border-[#e37aa1] px-4 py-2">
          <div className="mb-1 flex items-center gap-1 font-body text-xs font-bold text-cu-pink">
            <MapPin className="size-3.5" />
            สถานที่รับพัสดุ
          </div>
          <p className="font-body text-xs leading-normal text-black">
            {featuredParcel?.pickup_location ||
              "สำนักงานหอพักนิสิตจุฬาลงกรณ์มหาวิทยาลัย ตึกชวนชม ชั้น 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330"}
          </p>
        </section>

        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-cu-grey">รายการพัสดุ</h2>
            <button className="font-body text-sm font-bold text-cu-pink underline">
              ดูทั้งหมด
            </button>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-full border border-cu-grey/20 bg-cu-cream-light px-3">
            <Search className="size-4 text-cu-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาพัสดุ"
              className="min-w-0 flex-1 bg-transparent font-body text-xs text-cu-grey outline-none placeholder:text-cu-muted"
            />
          </label>
        </section>

        <section>
          <div className="-mx-4 flex h-[25px] border-b border-cu-grey/20">
            <button
              onClick={() => setTab("unclaimed")}
              className={cn(
                "ml-[88px] flex w-[96px] flex-col items-center font-body text-sm",
                tab === "unclaimed" ? "font-bold text-cu-pink" : "text-cu-grey"
              )}
            >
              ยังไม่รับ ({unclaimedParcels.length})
              {tab === "unclaimed" && <span className="mt-1 h-[3px] w-full bg-cu-pink" />}
            </button>
            <button
              onClick={() => setTab("claimed")}
              className={cn(
                "ml-10 flex w-[96px] flex-col items-center font-body text-sm",
                tab === "claimed" ? "font-bold text-cu-pink" : "text-cu-grey"
              )}
            >
              รับแล้ว ({claimedParcels.length})
              {tab === "claimed" && <span className="mt-1 h-[3px] w-full bg-cu-pink" />}
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[70px] animate-pulse rounded-[10px] bg-cu-cream-light" />
              ))
            ) : filteredParcels.length > 0 ? (
              Object.entries(groupedParcels).map(([date, dateParcels]) => (
                <div key={date} className="space-y-1.5">
                  <p className="font-body text-xs font-bold text-black/50">{date}</p>
                  <div className="space-y-2">
                    {dateParcels.map((parcel) => (
                      <ParcelListCard key={parcel.id} parcel={parcel} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-cu-grey/20 bg-cu-cream-light py-10">
                <CircleAlert className="size-8 text-cu-muted" />
                <p className="mt-2 font-body text-sm text-cu-muted">ไม่พบรายการพัสดุ</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
