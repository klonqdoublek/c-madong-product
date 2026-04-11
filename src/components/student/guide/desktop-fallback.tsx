"use client"

import { useTranslations } from "next-intl"
import { Smartphone } from "lucide-react"

export function DesktopFallback() {
  const t = useTranslations("guide")

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-white to-[#f5f2ea] p-6">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cu-light-pink">
          <Smartphone className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground font-heading">
          {t("desktopOnly")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("desktopOnlyDescription")}
        </p>
      </div>
    </div>
  )
}
