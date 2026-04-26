"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Building2, ArrowRight, BedDouble, UserRound, GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { useUser } from "@/hooks/use-user";
import { useResidenceInfo } from "@/hooks/use-buildings";
import { useBedSelectionStore } from "@/stores/bed-selection-store";
import { useConfirmBedSelection } from "@/hooks/use-bed-selection";

export function ConfirmContent() {
  const router = useRouter();
  const { profile } = useUser();
  const store = useBedSelectionStore();
  const confirm = useConfirmBedSelection();
  const [busy, setBusy] = useState(false);

  const { data: currentResidence } = useResidenceInfo({
    buildingId: profile?.building_id ?? null,
    roomId: profile?.room_id ?? null,
    bedId: profile?.bed_id ?? null,
  });

  const oldBedLabel = currentResidence?.room && currentResidence?.bed
    ? `${currentResidence.room.room_number} ${currentResidence.bed.bed_label}`
    : "—";

  const newBedLabel = store.selectedRoomNumber && store.selectedBedLabel
    ? `${store.selectedRoomNumber} ${store.selectedBedLabel}`
    : "—";

  const isSameBed = profile?.bed_id === store.selectedBedId;

  const handleConfirm = async () => {
    if (busy || !store.selectedBedId || !store.selectedRoomId) return;
    if (store.isExpired()) {
      toast.error("หมดเวลาเลือก กรุณาเลือกเตียงใหม่");
      store.clearSelection();
      router.push("/bed-selection");
      return;
    }
    setBusy(true);
    try {
      await confirm.mutateAsync({
        bedId: store.selectedBedId,
        roomId: store.selectedRoomId,
      });
      store.clearSelection();
      router.push("/bed-selection/success");
    } catch (err: any) {
      toast.error(err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-[100dvh] bg-[#fffbf1] pb-10">
      <PageHeader title="ยืนยันเตียงใหม่" backHref="/bed-selection" />

      <div className="px-4 pt-[100px]">
        {/* Heading */}
        <div className="text-center">
          <h1 className="font-heading text-[24px] font-bold text-[#dd598b] tracking-tight">
            ยืนยันเตียงใหม่
          </h1>
          <p className="mt-1 font-sans text-[14px] text-[#565655]">
            กรุณาตรวจสอบข้อมูลให้ถูกต้อง
          </p>
        </div>

        {/* Personal info card */}
        <div className="mt-5 rounded-[10px] border border-dashed border-[rgba(88,88,86,0.24)] p-4">
          <p className="mb-3 font-sans text-[14px] font-bold text-[#565655]">ข้อมูลส่วนตัว</p>

          {/* Name + student_id + faculty row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <UserRound className="size-4 shrink-0 text-[#565655]" />
              <span className="font-sans text-[14px] text-[#565655]">
                {profile?.full_name_th ?? profile?.display_name ?? "—"}
              </span>
            </div>
            {profile?.student_id && (
              <span className="font-sans text-[14px] text-[#565655]">
                {profile.student_id}
              </span>
            )}
            {profile?.faculty && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="size-4 shrink-0 text-[#565655]" />
                <span className="font-sans text-[14px] text-[#565655]">
                  {profile.faculty}
                </span>
              </div>
            )}
          </div>

          {/* Building */}
          <div className="mt-2 flex items-center gap-1.5">
            <Building2 className="size-4 shrink-0 text-[#565655]" />
            <span className="font-sans text-[14px] font-bold text-[#565655]">
              {currentResidence?.building?.name_th ?? "—"}
            </span>
          </div>
        </div>

        {/* Bed transition card */}
        <div className="mt-4 rounded-[10px] border border-dashed border-[rgba(88,88,86,0.24)] p-4">
          <p className="mb-4 font-sans text-[14px] font-bold text-[#565655]">ข้อมูลเตียง</p>

          {/* Labels row */}
          <div className="flex items-center justify-between px-2">
            <span className="rounded-full bg-[rgba(88,88,86,0.1)] px-3 py-1 font-sans text-[14px] font-bold text-[#565655]">
              เตียงเดิม
            </span>
            <span className="font-sans text-[12px] text-[#818181]">ย้ายไป</span>
            <span className="rounded-full bg-[rgba(77,163,118,0.1)] px-3 py-1 font-sans text-[14px] font-bold text-[#4da376]">
              {isSameBed ? "เตียงเดิม" : "เตียงใหม่"}
            </span>
          </div>

          {/* Bed numbers + arrow */}
          <div className="mt-3 flex items-center">
            {/* Old bed box */}
            <div className="flex-1 rounded-[10px] border border-[rgba(88,88,86,0.24)] py-5 text-center">
              <p className="font-sans text-[24px] font-bold text-[#565655]">
                {oldBedLabel}
              </p>
              <div className="mt-1.5 flex justify-center">
                <BedDouble className="size-5 text-[#565655]/40" />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex w-14 items-center justify-center">
              <ArrowRight className="size-6 text-[#818181]" />
            </div>

            {/* New bed box */}
            <div className={cn(
              "flex-1 rounded-[10px] border py-5 text-center",
              isSameBed
                ? "border-[rgba(88,88,86,0.24)]"
                : "border-[#4da376]"
            )}>
              <p className={cn(
                "font-sans text-[24px] font-bold",
                isSameBed ? "text-[#565655]" : "text-[#4da376]"
              )}>
                {newBedLabel}
              </p>
              <div className="mt-1.5 flex justify-center">
                <BedDouble className={cn(
                  "size-5",
                  isSameBed ? "text-[#565655]/40" : "text-[#4da376]/60"
                )} />
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-3 flex items-start gap-1.5 px-1">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[#565655]/50" />
          <p className="font-sans text-[10px] text-[#565655]/70">
            หากยืนยันแล้วจะไม่สามารถเปลี่ยนแปลงได้ หรือหากต้องการติดต่อภายหลัง โปรดแจ้งสำนักงานหอพักด้วยตัวเอง
          </p>
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full bg-[rgba(88,88,86,0.12)]" />

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="h-10 w-[214px] rounded-full bg-[#dd598b] font-sans text-base font-bold text-white transition-all active:scale-95 disabled:opacity-60"
          >
            {busy ? "กำลังบันทึก..." : "ยืนยันการเลือก"}
          </button>
          <button
            onClick={handleCancel}
            className="h-10 w-[214px] rounded-full border border-[#565655] font-sans text-base font-bold text-[#565655] transition-all active:scale-95"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
