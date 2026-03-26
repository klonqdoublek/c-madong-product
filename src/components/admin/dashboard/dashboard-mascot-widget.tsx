"use client";

import { useTranslations } from "next-intl";
import { useChatStore } from "@/stores/chat-store";
import Image from "next/image";

export function DashboardMascotWidget() {
  const t = useTranslations("admin.dashboardPage");
  const setOpen = useChatStore((s) => s.setOpen);

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-primary/20">
        <Image
          src="/images/mascot.svg"
          alt="น้องซีมะโด่ง"
          width={40}
          height={40}
          className="h-10 w-10"
        />
      </div>
      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
        {t("askNongC")}
      </span>
    </button>
  );
}
