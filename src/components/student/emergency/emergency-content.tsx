"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Phone, Building2, Hospital, ShieldCheck, Landmark, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

const MAIN_EMERGENCY_NUMBER = "02-218-4181";

/** Collapsed sheet shows ~200px from bottom; expanded ~60% of viewport */
const COLLAPSED_HEIGHT = 200;
const EXPANDED_RATIO = 0.6;

interface Contact {
  category: "dorm" | "hospital" | "security" | "internal" | "external";
  name_th: string;
  name_en: string;
  phone: string;
}

const contacts: Contact[] = [
  // หอพัก
  { category: "dorm", name_th: "หอพักจำปา", name_en: "Champa Hall", phone: "02-218-4181" },
  { category: "dorm", name_th: "หอพักชวนชม", name_en: "Chuanchom Hall", phone: "02-218-4182" },
  { category: "dorm", name_th: "หอพักพุดซ้อน", name_en: "Pudson Hall", phone: "02-218-4183" },
  { category: "dorm", name_th: "หอพักพุดตาน", name_en: "Pudtan Hall", phone: "02-218-4184" },
  { category: "dorm", name_th: "สำนักงานหอพัก", name_en: "Dorm Office", phone: "02-218-4180" },
  // โรงพยาบาล
  { category: "hospital", name_th: "ศูนย์สุขภาพจุฬาฯ", name_en: "CU Health Center", phone: "02-218-0568" },
  { category: "hospital", name_th: "รพ.จุฬาลงกรณ์", name_en: "Chulalongkorn Hospital", phone: "02-256-4000" },
  { category: "hospital", name_th: "สายด่วนสุขภาพจิต", name_en: "Mental Health Hotline", phone: "1323" },
  // รปภ.
  { category: "security", name_th: "รปภ. หอพัก", name_en: "Dorm Security", phone: "02-218-4190" },
  { category: "security", name_th: "รปภ. จุฬาฯ กลาง", name_en: "CU Central Security", phone: "02-218-3572" },
  { category: "security", name_th: "แจ้งเหตุฉุกเฉิน", name_en: "Emergency Report", phone: "191" },
  // หน่วยงานภายในมหาวิทยาลัย
  { category: "internal", name_th: "สำนักบริหารกิจการนิสิต", name_en: "Office of Student Affairs", phone: "02-218-7045" },
  { category: "internal", name_th: "กองกิจการนิสิต", name_en: "Student Activities Division", phone: "02-218-7052" },
  { category: "internal", name_th: "ศูนย์ให้คำปรึกษา จุฬาฯ", name_en: "CU Counseling Center", phone: "02-218-3184" },
  { category: "internal", name_th: "งานทะเบียน", name_en: "Office of the Registrar", phone: "02-218-0004" },
  // ภายนอกมหาวิทยาลัย
  { category: "external", name_th: "สายด่วนตำรวจ", name_en: "Police Hotline", phone: "191" },
  { category: "external", name_th: "สายด่วนดับเพลิง", name_en: "Fire Department", phone: "199" },
  { category: "external", name_th: "สายด่วนกู้ชีพ", name_en: "Emergency Medical", phone: "1669" },
  { category: "external", name_th: "สายด่วนสุขภาพจิต", name_en: "Mental Health Hotline", phone: "1323" },
];

type Category = Contact["category"];

const categoryIcons: Record<Category, React.ReactNode> = {
  dorm: <Building2 className="h-4 w-4" />,
  hospital: <Hospital className="h-4 w-4" />,
  security: <ShieldCheck className="h-4 w-4" />,
  internal: <Landmark className="h-4 w-4" />,
  external: <MapPin className="h-4 w-4" />,
};

const categories: { key: Category; labelKey: string }[] = [
  { key: "dorm", labelKey: "tabDorm" },
  { key: "hospital", labelKey: "tabHospital" },
  { key: "security", labelKey: "tabSecurity" },
  { key: "internal", labelKey: "tabInternal" },
  { key: "external", labelKey: "tabExternal" },
];

export function EmergencyContent() {
  const t = useTranslations("emergency");
  const [activeTab, setActiveTab] = useState<Category>("dorm");
  const [expanded, setExpanded] = useState(false);

  // Drag state
  const dragStartY = useRef(0);
  const dragStartExpanded = useRef(false);
  const isDragging = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const filteredContacts = contacts.filter((c) => c.category === activeTab);

  const handleDragStart = useCallback(
    (clientY: number) => {
      isDragging.current = true;
      dragStartY.current = clientY;
      dragStartExpanded.current = expanded;
      if (sheetRef.current) {
        sheetRef.current.style.transition = "none";
      }
    },
    [expanded]
  );

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current || !sheetRef.current) return;
    const delta = dragStartY.current - clientY;
    const expandedHeight = window.innerHeight * EXPANDED_RATIO;
    const baseHeight = dragStartExpanded.current ? expandedHeight : COLLAPSED_HEIGHT;
    const newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(expandedHeight, baseHeight + delta));
    sheetRef.current.style.height = `${newHeight}px`;
  }, []);

  const handleDragEnd = useCallback((clientY: number) => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    sheetRef.current.style.transition = "";

    const delta = dragStartY.current - clientY;
    const threshold = 50;

    if (dragStartExpanded.current) {
      // Was expanded — collapse if dragged down enough
      setExpanded(delta > -threshold);
    } else {
      // Was collapsed — expand if dragged up enough
      setExpanded(delta > threshold);
    }
    sheetRef.current.style.height = "";
  }, []);

  // Touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove]
  );
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => handleDragEnd(e.changedTouches[0].clientY),
    [handleDragEnd]
  );

  // Mouse handlers (for desktop)
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleDragStart(e.clientY);
      const onMouseMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
      const onMouseUp = (ev: MouseEvent) => {
        handleDragEnd(ev.clientY);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  );

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("title")} backHref="/dashboard" />

      {/* Hero section — fills available space above the sheet */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4">
        {/* Decorative concentric circles — gentle pulse (GPU-composited scale only) */}
        <style>{`
          @keyframes circle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.18); }
          }
        `}</style>
        <div className="pointer-events-none absolute flex items-center justify-center">
          <div
            className="absolute h-[320px] w-[320px] rounded-full bg-cu-light-pink/20 will-change-transform"
            style={{ animation: "circle-pulse 2.4s ease-in-out infinite" }}
          />
          <div
            className="absolute h-[240px] w-[240px] rounded-full bg-cu-light-pink/30 will-change-transform"
            style={{ animation: "circle-pulse 2.4s ease-in-out 0.8s infinite" }}
          />
          <div
            className="absolute h-[160px] w-[160px] rounded-full bg-cu-light-pink/40 will-change-transform"
            style={{ animation: "circle-pulse 2.4s ease-in-out 1.6s infinite" }}
          />
        </div>

        {/* Emergency call button */}
        <a
          href={`tel:${MAIN_EMERGENCY_NUMBER}`}
          className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-primary/20 active:scale-95 transition-transform"
        >
          <Phone className="h-12 w-12 text-primary" />
        </a>

        {/* CTA text */}
        <h2 className="relative z-10 mt-5 font-heading text-xl font-bold text-primary">
          {t("heroTitle")}
        </h2>
        <p className="relative z-10 mt-1 text-sm text-muted-foreground">
          {t("heroSubtitle")}
        </p>
      </div>

      {/* Draggable bottom sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "relative z-10 rounded-t-3xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-[height] duration-300 ease-out",
          "flex flex-col"
        )}
        style={{
          height: expanded ? `${EXPANDED_RATIO * 100}dvh` : `${COLLAPSED_HEIGHT}px`,
        }}
      >
        {/* Drag handle */}
        <div
          className="flex shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Sheet content */}
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-28">
          <h3 className="mb-3 font-heading text-base font-bold text-foreground">
            {t("otherContacts")}
          </h3>

          {/* Category tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveTab(cat.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === cat.key
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-foreground"
                )}
              >
                {categoryIcons[cat.key]}
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          {/* Contact list — scrollable when expanded */}
          <div className={cn("flex flex-col divide-y divide-border", expanded && "overflow-y-auto")}>
            {filteredContacts.map((contact) => (
              <div
                key={contact.phone}
                className="flex items-center justify-between py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {contact.name_th}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {contact.phone}
                  </p>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cu-light-pink text-primary active:scale-95 transition-transform"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
