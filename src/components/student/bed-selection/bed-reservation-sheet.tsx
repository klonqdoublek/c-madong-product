"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { X, BedDouble } from "lucide-react";
import { useBedSelectionStore } from "@/stores/bed-selection-store";
import { cn } from "@/lib/utils";

interface BedReservationSheetProps {
  open: boolean;
  onClose: () => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function BedReservationSheet({ open, onClose }: BedReservationSheetProps) {
  const router = useRouter();
  const store = useBedSelectionStore();
  const [remainingMs, setRemainingMs] = useState(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const { expiresAt, clearSelection } = useBedSelectionStore.getState();
    if (!expiresAt) return;
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      setRemainingMs(0);
      clearSelection();
      onClose();
      return;
    }
    setRemainingMs(ms);
    rafRef.current = requestAnimationFrame(tick);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, tick]);

  const handleConfirm = () => {
    router.push("/bed-selection/confirm");
  };

  const handleClose = () => {
    store.clearSelection();
    onClose();
  };

  if (!open) return null;

  const isExpired = remainingMs <= 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-[72px] z-50 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-md">
          {/* Cancel button (above sheet) */}
          <div className="flex justify-end px-4 pb-2">
            <button
              onClick={handleClose}
              className="flex size-9 items-center justify-center rounded-[18px] border border-cu-grey/25 bg-cu-cream"
            >
              <X className="size-5 text-cu-grey" />
            </button>
          </div>

          {/* Sheet card */}
          <div className="relative rounded-t-[10px] bg-cu-cream px-4 pt-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {/* Top row: label + bed badge */}
            <div className="flex items-center justify-between">
              <p className="font-heading text-base font-bold text-primary">
                กำลังเลือกเตียงใหม่
              </p>

              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-bold text-cu-grey">
                  ห้อง {store.selectedRoomNumber}
                </span>
                <div className="flex h-[28px] w-[65px] items-center justify-center gap-1.5 rounded-[3px] bg-cu-task-green">
                  <span className="font-sans text-base font-bold text-white">
                    {store.selectedBedLabel}
                  </span>
                  <BedDouble className="size-4 text-white" />
                </div>
              </div>
            </div>

            {/* CTA + countdown */}
            <div className="mt-4 flex flex-col items-center gap-1">
              <button
                onClick={handleConfirm}
                disabled={isExpired}
                className={cn(
                  "h-10 w-[214px] rounded-full font-sans text-base font-bold text-white transition-all active:scale-95",
                  isExpired ? "bg-primary/40" : "bg-primary"
                )}
              >
                ยืนยัน
              </button>
              <p className={cn(
                "font-sans text-[10px] text-center",
                remainingMs < 60000 ? "text-[#ff5d5d]" : "text-cu-grey"
              )}>
                {formatCountdown(remainingMs)} นาที นับถอยหลัง
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
