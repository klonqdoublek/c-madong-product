"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { useNotificationStore } from "@/stores/notification-store";
import { Bell, Search } from "lucide-react";

export function DashboardHeader() {
  const t = useTranslations("dashboard");
  const { profile, isLoading } = useUser();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setOpen = useNotificationStore((s) => s.setOpen);

  const displayName = profile?.display_name || profile?.full_name_th || t("greeting");
  const initials = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="space-y-3 px-4 pt-4">
      {/* Top row: avatar + greeting + bell */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-cu-light-pink">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-heading text-lg font-bold text-primary">
              {isLoading ? "..." : initials}
            </span>
          )}
        </div>

        {/* Greeting */}
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
            {t("greeting")}, {isLoading ? "..." : displayName} :)
          </h1>
          <p className="text-sm leading-tight text-cu-muted">
            {t("subtitle")}
          </p>
        </div>

        {/* Notification bell — opens modal */}
        <button
          onClick={() => setOpen(true)}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-cu-light-pink transition-colors hover:bg-cu-light-pink/80"
        >
          <Bell className="size-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2.5">
        <Search className="size-4 shrink-0 text-cu-muted" />
        <span className="text-sm text-cu-muted">
          {t("searchPlaceholder")}
        </span>
      </div>
    </div>
  );
}
