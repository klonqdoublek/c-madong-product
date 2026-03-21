"use client";

import { Link } from "@/i18n/navigation";
import { useNotificationStore } from "@/stores/notification-store";
import { ChevronLeft, Bell } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
}

export function PageHeader({ title, backHref = "/dashboard" }: PageHeaderProps) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setOpen = useNotificationStore((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Back button */}
        <Link
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        {/* Centered title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 font-sans text-sm font-bold">
          {title}
        </h1>

        {/* Notification bell */}
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cu-light-pink"
        >
          <Bell className="h-4 w-4 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary text-primary px-1 text-[10px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
