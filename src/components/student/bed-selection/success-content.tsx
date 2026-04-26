"use client";

import { Link } from "@/i18n/navigation";
import { CheckCircle2, BedDouble } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useResidenceInfo } from "@/hooks/use-buildings";

interface SuccessContentProps {
  confirmedAt?: string;
}

export function SuccessContent({ confirmedAt }: SuccessContentProps) {
  const { profile } = useUser();

  const { data: residence } = useResidenceInfo({
    buildingId: profile?.building_id ?? null,
    roomId: profile?.room_id ?? null,
    bedId: profile?.bed_id ?? null,
  });

  const bedDisplay = residence?.building && residence?.room && residence?.bed
    ? `${residence.building.name_th} ห้อง ${residence.room.room_number} เตียง ${residence.bed.bed_label}`
    : null;

  const submittedLabel = confirmedAt
    ? new Date(confirmedAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fffbf1] px-6 pb-20">
      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#4da376]/10">
        <CheckCircle2 className="size-12 text-[#4da376]" />
      </div>

      {/* Title */}
      <h1 className="font-heading text-[26px] font-bold text-[#dd598b] tracking-tight text-center">
        ยืนยันเตียงสำเร็จ!
      </h1>

      {/* Subtitle */}
      <p className="mt-2 font-sans text-[14px] text-[#565655] text-center">
        ส่งเมื่อ {submittedLabel}
      </p>

      {/* Bed info card */}
      {bedDisplay && (
        <div className="mt-6 w-full max-w-xs rounded-[10px] border border-[#4da376]/30 bg-white px-4 py-4">
          <p className="font-sans text-[12px] text-[#565655]/60 mb-1">เตียงของคุณ</p>
          <div className="flex items-center gap-2">
            <BedDouble className="size-5 text-[#4da376]" />
            <p className="font-sans text-[16px] font-bold text-[#565655]">{bedDisplay}</p>
          </div>
        </div>
      )}

      {/* Note */}
      <p className="mt-4 max-w-xs text-center font-sans text-[12px] text-[#565655]/60">
        หากต้องการเปลี่ยนแปลงภายหลัง กรุณาติดต่อสำนักงานหอพักด้วยตัวเอง
      </p>

      {/* CTAs */}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#dd598b] font-sans text-base font-bold text-white active:scale-95 transition-all"
        >
          กลับสู่หน้าหลัก
        </Link>
        <Link
          href="/dorm-calendar"
          className="flex h-12 w-full items-center justify-center rounded-full border border-[rgba(88,88,86,0.24)] font-sans text-base font-bold text-[#565655] active:scale-95 transition-all"
        >
          ดูในปฏิทิน
        </Link>
      </div>
    </div>
  );
}
