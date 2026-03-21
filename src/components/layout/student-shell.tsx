"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { BottomNav } from "./bottom-nav";
import { NotificationModal } from "@/components/student/notification-modal";
import { ChatModal } from "@/components/student/chat-modal";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const [isLiff, setIsLiff] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    setIsLiff(sessionStorage.getItem("c-madong-liff") === "1");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Modals available on all pages */}
      {!isDashboard && <NotificationModal />}
      <ChatModal />
      <main className={`flex-1 ${isLiff ? "" : "pb-24 md:pb-0"}`}>
        {children}
      </main>
      {!isLiff && <BottomNav />}
    </div>
  );
}
