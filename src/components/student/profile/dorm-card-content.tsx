"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsMenuItem } from "./settings-menu-item";
import { IdCard, X, MessageCircleQuestion, History } from "lucide-react";
import Image from "next/image";

export function DormCardContent() {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const serialNumber = profile?.student_id
    ? `SN-${profile.student_id}-2568`
    : "SN-0000000000-2568";

  // พิชญา พูลเพียร gets the real card, others get placeholder
  const isPitchaya = profile?.full_name_th === "พิชญา พูลเพียร";
  const cardImage = isPitchaya
    ? "/images/id-card-pitchaya.png"
    : "/images/id-card-example.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("dormCardTitle")} backHref="/profile" />

      <div className="space-y-6 px-4 pb-28 pt-2">
        {/* Serial number */}
        <p className="text-center text-xs text-muted-foreground">
          {serialNumber}
        </p>

        {/* Card image with rotation + shadow */}
        <div className="flex justify-center py-4">
          <div className="relative">
            {/* Pink blur shadow */}
            <div className="absolute inset-0 translate-y-2 rounded-2xl bg-primary/20 blur-xl" />
            <div className="relative -rotate-6 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={cardImage}
                alt={t("dormCardTitle")}
                width={300}
                height={190}
                className="h-auto w-[280px]"
                priority
              />
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

      {/* Fullscreen lightbox modal */}
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
            <Image
              src={cardImage}
              alt={t("dormCardTitle")}
              width={800}
              height={504}
              className="w-[60vh] max-w-none rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
