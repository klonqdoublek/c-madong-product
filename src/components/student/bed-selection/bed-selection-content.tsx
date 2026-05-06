"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Layers, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { useBedSelectionLayout } from "@/hooks/use-bed-selection";
import { useUser } from "@/hooks/use-user";
import { useResidenceInfo } from "@/hooks/use-buildings";
import { useBedSelectionStore } from "@/stores/bed-selection-store";
import { RoomCard } from "./room-card";
import { BedReservationSheet } from "./bed-reservation-sheet";

const FLOORS = Array.from({ length: 17 }, (_, i) => i + 1);

export function BedSelectionContent() {
  const { profile } = useUser();
  const store = useBedSelectionStore();

  const { data: residence } = useResidenceInfo({
    buildingId: profile?.building_id ?? null,
    roomId: profile?.room_id ?? null,
    bedId: profile?.bed_id ?? null,
  });

  const currentFloorFromProfile = residence?.room
    ? parseInt(residence.room.room_number.slice(0, -2))
    : null;

  const [selectedFloor, setSelectedFloor] = useState<number>(
    store.selectedFloor ?? currentFloorFromProfile ?? 6
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (currentFloorFromProfile && !store.selectedFloor) {
      setSelectedFloor(currentFloorFromProfile);
    }
  }, [currentFloorFromProfile, store.selectedFloor]);

  // Re-open sheet if there's a non-expired selection in store
  useEffect(() => {
    if (store.selectedBedId && !store.isExpired()) {
      setSheetOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: layout, isLoading } = useBedSelectionLayout(selectedFloor);

  const currentBedLabel = residence?.room && residence?.bed
    ? `${residence.room.room_number}${residence.bed.bed_label}`
    : null;

  const handleSelectBed = (
    bedId: string,
    bedLabel: string,
    roomId: string,
    roomNumber: string,
    floor: number
  ) => {
    store.setSelection({ bedId, bedLabel, roomId, roomNumber, floor });
    setSheetOpen(true);
  };

  const totalAvailable = layout?.availableCount ?? 0;

  return (
    <div className="relative min-h-[100dvh] bg-cu-warm-cream">
      {/* Page header */}
      <PageHeader
        title="เลือกเตียงใหม่"
        backHref="/dorm-calendar"
      />

      {/* Current bed pill (top-right absolute) */}
      {currentBedLabel && (
        <div className="absolute right-4 top-[114px] z-10">
          <span className="rounded-full bg-cu-cream px-3 py-1 font-sans text-sm font-bold text-black">
            เตียงเดิม {currentBedLabel}
          </span>
        </div>
      )}

      {/* Pink heading */}
      <div className="px-4 pt-[121px]">
        <h1 className="font-heading text-2xl font-bold text-primary tracking-tight">
          เลือกเตียงใหม่
        </h1>
      </div>

      {/* Floor selector */}
      <div className="mt-[14px] flex items-center gap-5 px-4">
        <div className="flex shrink-0 items-center gap-1.5">
          <Layers className="size-4 text-cu-grey" />
          <span className="font-sans text-[14px] font-bold text-cu-grey">เลือกชั้น</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={cn(
                "flex size-[28px] shrink-0 items-center justify-center rounded-[5px] border font-sans text-[14px] font-bold transition-all",
                selectedFloor === f
                  ? "border-primary bg-primary text-white"
                  : "border-cu-neutral-warm-dark text-black/30"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-4 flex items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[14px] text-cu-grey">สถานะ</span>
          <span className="rounded-full bg-cu-cream px-3 py-1 font-sans text-[14px] font-bold text-black">
            {residence?.building?.name_th ?? "—"} ชั้น {selectedFloor}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BedDouble className="size-4 text-primary" />
          <span className="font-sans text-[14px] font-bold text-primary">เตียงว่าง</span>
          <span className="min-w-[43px] rounded-full bg-primary/10 px-1 py-0.5 text-center font-sans text-[14px] font-bold text-primary">
            {totalAvailable}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-3 px-4">
        <span className="font-sans text-[14px] text-cu-grey">
          <span className="inline-block align-middle">
            <BedDouble className="mr-1 inline size-4 text-cu-grey" />
          </span>
          เลือกเตียงที่ต้องการ
        </span>
        <div className="ml-auto flex items-center gap-3">
          <LegendItem color="bg-cu-task-green" label="กำลังเลือก" />
          <LegendItem color="border border-cu-task-green" label="เตียงว่าง" outline />
          <LegendItem color="bg-cu-neutral-warm" label="ถูกจองแล้ว" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-2 h-px w-full bg-[rgba(88,88,86,0.16)]" />

      {/* Room grid */}
      <div className="px-4 pb-[180px] pt-4">
        {isLoading ? (
          <RoomGridSkeleton />
        ) : !layout?.rooms.length ? (
          <p className="py-10 text-center font-sans text-sm text-cu-grey/60">
            ไม่พบห้องในชั้น {selectedFloor}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {layout.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selectingBedId={store.selectedBedId}
                onSelectBed={handleSelectBed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <BedReservationSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
      />
    </div>
  );
}

function LegendItem({
  color,
  label,
  outline,
}: {
  color: string;
  label: string;
  outline?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block size-3 rounded-full",
          outline ? "border border-cu-task-green" : color
        )}
      />
      <span className="font-sans text-[10px] text-black">{label}</span>
    </div>
  );
}

function RoomGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[62px] animate-pulse rounded-[5px] border border-cu-grey/25 bg-[rgba(88,88,86,0.06)]"
        />
      ))}
    </div>
  );
}
