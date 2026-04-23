"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { BottomNav } from "./bottom-nav";
import { MenuModal } from "./menu-modal";
import { NotificationModal } from "@/components/student/notification-modal";
import { ChatModal } from "@/components/student/chat-modal";
import { ChatFAB } from "@/components/student/chat-fab";
import { useMenuStore } from "@/stores/menu-store";

const NAV_ROUTES = ["/dashboard", "/profile/dorm-card", "/events", "/profile"];

function shouldShowNav(pathname: string): boolean {
  return NAV_ROUTES.some((r) => {
    if (r === "/profile") return pathname === "/profile";
    return pathname === r || pathname.startsWith(r + "/");
  });
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const [isLiff, setIsLiff] = useState(false);
  const pathname = usePathname();
  const setMenuModalOpen = useMenuStore((state) => state.setMenuModalOpen);
  const isDashboard = pathname === "/dashboard";
  const showNav = !isLiff && shouldShowNav(pathname);

  useEffect(() => {
    setIsLiff(sessionStorage.getItem("c-madong-liff") === "1");
  }, []);

  useEffect(() => {
    setMenuModalOpen(false);
  }, [pathname, setMenuModalOpen]);

  return (
    <div className="flex min-h-dvh flex-col">
      {!isDashboard && <NotificationModal />}
      <MenuModal />
      <ChatModal />
      <main className={`flex-1 ${isLiff ? "" : showNav ? "pb-28 md:pb-0" : "pb-6 md:pb-0"}`}>
        {children}
      </main>
      {!isLiff && <ChatFAB showNav={showNav} />}
      <BottomNav visible={showNav} />
    </div>
  );
}
