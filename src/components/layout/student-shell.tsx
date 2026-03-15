"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const [isLiff, setIsLiff] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    setIsLiff(sessionStorage.getItem("c-madong-liff") === "1");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      {!isDashboard && <Header />}
      <main className={`flex-1 ${isLiff ? "" : "pb-24 md:pb-0"}`}>
        {children}
      </main>
      {!isLiff && <BottomNav />}
    </div>
  );
}
