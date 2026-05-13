"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface LocaleSwitcherProps {
  className?: string;
  variant?: "pill" | "inline";
}

function LocaleSwitcherInner({ className, variant = "pill" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function switchTo(next: "th" | "en") {
    if (next === locale) return;
    const search = searchParams.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;
    router.replace(fullPath, { locale: next });
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <button
          onClick={() => switchTo("th")}
          className={cn(
            "text-sm font-bold transition-colors",
            locale === "th" ? "text-primary" : "text-cu-grey opacity-40 hover:opacity-70"
          )}
        >
          ไทย
        </button>
        <span className="text-cu-grey opacity-30 text-sm">/</span>
        <button
          onClick={() => switchTo("en")}
          className={cn(
            "text-sm font-bold transition-colors",
            locale === "en" ? "text-primary" : "text-cu-grey opacity-40 hover:opacity-70"
          )}
        >
          English
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-full border border-[#e0e0e0] bg-white/90 backdrop-blur-sm shadow-sm",
        className
      )}
    >
      <button
        onClick={() => switchTo("th")}
        className={cn(
          "px-3 py-1.5 text-[13px] font-bold transition-colors",
          locale === "th" ? "bg-primary text-white" : "text-cu-grey hover:bg-primary/10"
        )}
      >
        TH
      </button>
      <button
        onClick={() => switchTo("en")}
        className={cn(
          "px-3 py-1.5 text-[13px] font-bold transition-colors",
          locale === "en" ? "bg-primary text-white" : "text-cu-grey hover:bg-primary/10"
        )}
      >
        EN
      </button>
    </div>
  );
}

export function LocaleSwitcher(props: LocaleSwitcherProps) {
  return (
    <Suspense>
      <LocaleSwitcherInner {...props} />
    </Suspense>
  );
}
