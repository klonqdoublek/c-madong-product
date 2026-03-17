"use client";

import { useTranslations } from "next-intl";
import { useNotificationStore } from "@/stores/notification-store";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bell, CheckCheck } from "lucide-react";

export function NotificationModal() {
  const t = useTranslations("notifications");
  const { isOpen, setOpen, unreadCount } = useNotificationStore();
  const { notifications, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-0">
        <SheetHeader className="border-b px-4 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-lg font-bold">
              {t("title")}
            </SheetTitle>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs font-medium text-primary"
              >
                <CheckCheck className="size-4" />
                {t("markAllRead")}
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto px-4 pt-2 pb-safe">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-cu-light-pink">
                <Bell className="size-6 text-primary" />
              </div>
              <p className="mt-3 font-heading text-sm font-bold text-cu-grey">
                {t("empty")}
              </p>
              <p className="mt-1 text-xs text-cu-muted">
                {t("emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
