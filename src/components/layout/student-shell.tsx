"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const [isLiff, setIsLiff] = useState(false);

  useEffect(() => {
    setIsLiff(sessionStorage.getItem("c-madong-liff") === "1");
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className={`flex-1 ${isLiff ? "" : "pb-24 md:pb-0"}`}>
        {children}
      </main>
      {!isLiff && <BottomNav />}
    </div>
  );
}
