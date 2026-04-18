"use client";

import { useChatStore } from "@/stores/chat-store";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ChatFAB({ showNav }: { showNav: boolean }) {
  const { setOpen, isOpen } = useChatStore();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "fixed right-4 z-50 flex size-14 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 md:hidden",
        showNav ? "bottom-[104px]" : "bottom-6"
      )}
    >
      <Image
        src="/images/mascot.svg"
        alt="Chat"
        width={36}
        height={36}
        className="size-9"
      />
    </button>
  );
}
