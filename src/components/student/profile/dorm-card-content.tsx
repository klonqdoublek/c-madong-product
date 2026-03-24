"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { useBuildings, useRooms, useBeds } from "@/hooks/use-buildings";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsMenuItem } from "./settings-menu-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IdCard, X, MessageCircleQuestion, History } from "lucide-react";

// ─── Thai date formatter ─────────────────────────────────────
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543; // Buddhist era
  return `${day} ${month} ${year}`;
}

function getExpiryDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1); // +1 year
  d.setMonth(4); // May (0-indexed)
  d.setDate(31);
  return formatThaiDate(d.toISOString());
}

// ─── Decorative barcode (CSS bars) ───────────────────────────
function DecorativeBarcode({ className }: { className?: string }) {
  // Pseudo-random bar widths for visual effect
  const bars = [
    2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1,
    1, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 2,
    3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1,
  ];
  return (
    <div className={`flex items-end gap-[0.5px] ${className ?? ""}`}>
      {bars.map((w, i) => (
        <div
          key={i}
          className="bg-gray-900"
          style={{ width: `${w}px`, height: i % 7 === 0 ? "28px" : "32px" }}
        />
      ))}
    </div>
  );
}

// ─── CU Emblem (simplified SVG) ──────────────────────────────
function CuEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified trident/tower shape inspired by CU emblem */}
      <path
        d="M20 2 L20 12 M14 6 L14 12 M26 6 L26 12 M10 12 L30 12 L30 16 L10 16 Z M12 16 L12 36 L28 36 L28 16 M16 36 L16 42 L24 42 L24 36 M20 16 L20 36 M14 20 L26 20 M14 24 L26 24 M14 28 L26 28 M14 32 L26 32"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* Base */}
      <rect x="8" y="42" width="24" height="3" rx="1" fill="white" opacity="0.9" />
    </svg>
  );
}

// ─── DormIdCard Component ────────────────────────────────────
interface DormIdCardProps {
  profile: {
    full_name_th?: string | null;
    student_id?: string | null;
    avatar_url?: string | null;
    created_at?: string | null;
    [key: string]: unknown;
  } | null | undefined;
  building?: { name_th?: string | null; [key: string]: unknown } | null | undefined;
  room?: { room_number?: string | null; [key: string]: unknown } | null | undefined;
  bed?: { bed_label?: string | null; [key: string]: unknown } | null | undefined;
  scale?: "preview" | "fullscreen";
}

function DormIdCard({ profile, building, room, bed, scale = "preview" }: DormIdCardProps) {
  const initials = profile?.full_name_th?.slice(0, 2) ?? "?";
  const studentId = profile?.student_id ?? "0000000000";
  const yearCode = studentId.slice(0, 2);
  const isFullscreen = scale === "fullscreen";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-cu-light-pink bg-white ${
        isFullscreen ? "w-[540px]" : "w-[300px]"
      }`}
      style={{ aspectRatio: "1.586 / 1" }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #DD598B 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />

      {/* ── Header ── */}
      <div
        className={`relative flex items-center justify-between bg-gradient-to-r from-[#C94D7E] to-[#DD598B] ${
          isFullscreen ? "px-5 py-3" : "px-3 py-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <CuEmblem className={isFullscreen ? "h-10 w-8" : "h-7 w-5"} />
          <div>
            <p className={`font-heading font-bold leading-tight text-white ${
              isFullscreen ? "text-sm" : "text-[9px]"
            }`}>
              บัตรประจำตัวนิสิตหอพัก
            </p>
            <p className={`font-sans leading-tight text-white/80 ${
              isFullscreen ? "text-xs" : "text-[7px]"
            }`}>
              จุฬาลงกรณ์มหาวิทยาลัย
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-heading font-bold leading-tight text-white ${
            isFullscreen ? "text-sm" : "text-[9px]"
          }`}>
            RCU.CHULA
          </p>
          <p className={`font-sans leading-tight text-white/80 ${
            isFullscreen ? "text-xs" : "text-[7px]"
          }`}>
            Digital ID Card
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`relative flex gap-3 ${
        isFullscreen ? "px-5 pt-4" : "px-3 pt-2.5"
      }`}>
        {/* Photo */}
        <div className={`shrink-0 overflow-hidden rounded-lg border-2 border-cu-light-pink ${
          isFullscreen ? "h-[120px] w-[96px]" : "h-[68px] w-[54px]"
        }`}>
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
            <AvatarFallback className="rounded-none bg-cu-light-pink font-heading text-lg font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-sans text-cu-pink ${
            isFullscreen ? "mb-1 text-xs" : "mb-0.5 text-[7px]"
          }`}>
            ข้อมูลส่วนตัว
          </p>

          {/* Name + Student ID */}
          <p className={`font-heading font-bold leading-snug text-gray-900 ${
            isFullscreen ? "text-base" : "text-[9px]"
          }`}>
            {profile?.full_name_th ?? "-"}
            <span className={`ml-2 font-sans font-normal text-gray-600 ${
              isFullscreen ? "text-sm" : "text-[8px]"
            }`}>
              {studentId}
            </span>
          </p>

          {/* Year + Faculty */}
          <p className={`flex items-center leading-snug text-gray-700 ${
            isFullscreen ? "mt-1 gap-2 text-sm" : "mt-0.5 gap-1 text-[8px]"
          }`}>
            <span className="font-heading font-bold">รหัส {yearCode}</span>
            <span className={`inline-block rounded-full bg-gray-800 ${
              isFullscreen ? "h-2 w-2" : "h-1 w-1"
            }`} />
            <span className="truncate">คณะสถาปัตยกรรมศาสตร์ ({yearCode})</span>
          </p>

          {/* Room + Building + Bed */}
          <p className={`font-heading font-bold leading-snug text-gray-700 ${
            isFullscreen ? "mt-1 text-sm" : "mt-0.5 text-[8px]"
          }`}>
            {room?.room_number ?? "-"}
            <span className="mx-1.5 font-sans font-normal">
              {building?.name_th ? `ตึก${building.name_th}` : "-"}
            </span>
            <span className="font-sans font-normal">
              เตียง {bed?.bed_label ?? "-"}
            </span>
          </p>

          {/* Dates */}
          <div className={`flex gap-4 ${
            isFullscreen ? "mt-2" : "mt-1"
          }`}>
            <div>
              <p className={`text-cu-pink ${
                isFullscreen ? "text-[10px]" : "text-[6px]"
              }`}>
                วันที่ออกบัตร
              </p>
              <p className={`font-heading font-bold text-gray-900 ${
                isFullscreen ? "text-sm" : "text-[8px]"
              }`}>
                {formatThaiDate(profile?.created_at)}
              </p>
            </div>
            <div>
              <p className={`text-cu-pink ${
                isFullscreen ? "text-[10px]" : "text-[6px]"
              }`}>
                วันหมดอายุ
              </p>
              <p className={`font-heading font-bold text-gray-900 ${
                isFullscreen ? "text-sm" : "text-[8px]"
              }`}>
                {getExpiryDate(profile?.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer: Barcode + Signature ── */}
      <div className={`relative flex items-end justify-between ${
        isFullscreen ? "px-5 pb-3 pt-2" : "px-3 pb-2 pt-1"
      }`}>
        <DecorativeBarcode className={isFullscreen ? "h-8" : "h-5 scale-[0.6] origin-bottom-left"} />
        <div className="text-right">
          <p className={`font-sans italic text-cu-pink ${
            isFullscreen ? "text-3xl" : "text-lg"
          }`}
            style={{ fontFamily: "cursive" }}
          >
            {profile?.full_name_th?.split(" ")[0]?.slice(0, 4) ?? ""}
          </p>
          <p className={`font-sans font-bold uppercase tracking-wider text-cu-pink/60 ${
            isFullscreen ? "text-[10px]" : "text-[6px]"
          }`}>
            SIGNATURE
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Content ───────────────────────────────────────
export function DormCardContent() {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const { data: buildings } = useBuildings();
  const { data: rooms } = useRooms(profile?.building_id ?? null);
  const { data: beds } = useBeds(profile?.room_id ?? null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const building = buildings?.find((b) => b.id === profile?.building_id);
  const room = rooms?.find((r) => r.id === profile?.room_id);
  const bed = beds?.find((b) => b.id === profile?.bed_id);

  const serialNumber = profile?.student_id
    ? `SN-${profile.student_id}-2568`
    : "SN-0000000000-2568";

  const cardProps = { profile, building, room, bed };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("dormCardTitle")} backHref="/profile" />

      <div className="space-y-6 px-4 pb-28 pt-2">
        {/* Serial number */}
        <p className="text-center text-xs text-muted-foreground">
          {serialNumber}
        </p>

        {/* Card with rotation + shadow */}
        <div className="flex justify-center py-4">
          <div className="relative">
            {/* Pink blur shadow */}
            <div className="absolute inset-0 translate-y-2 rounded-2xl bg-primary/20 blur-xl" />
            <div className="relative -rotate-6 overflow-hidden rounded-2xl shadow-xl">
              <DormIdCard {...cardProps} scale="preview" />
            </div>
          </div>
        </div>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-white py-3 text-sm font-medium text-primary"
        >
          <IdCard className="h-4 w-4" />
          {t("showFullCard")}
        </button>

        {/* Security notice */}
        <p className="text-center text-[10px] text-muted-foreground">
          {t("cardSecurityNote")}
        </p>

        {/* Other menu */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("otherMenu")}
          </h3>
          <div className="space-y-2">
            <SettingsMenuItem
              icon={MessageCircleQuestion}
              label={t("reportLostCard")}
            />
            <SettingsMenuItem
              icon={History}
              label={t("cardHistory")}
            />
          </div>
        </section>
      </div>

      {/* Fullscreen lightbox — landscape card */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 touch-none"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="rotate-90 origin-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DormIdCard {...cardProps} scale="fullscreen" />
          </div>
        </div>
      )}
    </div>
  );
}
