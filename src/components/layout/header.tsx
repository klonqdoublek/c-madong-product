"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useNotificationStore } from "@/stores/notification-store";
import { Button } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/th/login";
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="font-heading text-lg font-bold text-primary">
          {t("appName")}
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary text-primary px-1 text-[10px] font-medium">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            title={tAuth("logout")}
            className="text-cu-grey hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
