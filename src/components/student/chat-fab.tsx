"use client";

import { useChatStore } from "@/stores/chat-store";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ChatFAB({ showNav }: { showNav: boolean }) {
  const { setOpen, isOpen } = useChatStore();

  if (isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-4 z-[80] flex items-center gap-2 transition-all duration-300 md:hidden",
        showNav ? "bottom-24" : "bottom-6"
      )}
    >
      <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-primary shadow-md backdrop-blur">
        ถามน้องซี
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-14 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-primary/5 transition-transform active:scale-90"
      >
        <Image
          src="/images/mascot.svg"
          alt="Chat"
          width={36}
          height={36}
          className="size-9"
        />
      </button>
    </div>
  );
}
