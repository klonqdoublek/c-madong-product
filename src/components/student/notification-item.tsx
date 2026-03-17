"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Wrench,
  Banknote,
  Star,
  Calendar,
  Megaphone,
  Info,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const ICON_MAP: Record<string, typeof Wrench> = {
  maintenance_update: Wrench,
  bill_due: Banknote,
  bill_overdue: Banknote,
  score_added: Star,
  event_new: Calendar,
  event_reminder: Calendar,
  announcement: Megaphone,
  system: Info,
};

const COLOR_MAP: Record<string, string> = {
  maintenance_update: "bg-blue-100 text-blue-600",
  bill_due: "bg-amber-100 text-amber-600",
  bill_overdue: "bg-red-100 text-red-600",
  score_added: "bg-green-100 text-green-600",
  event_new: "bg-purple-100 text-purple-600",
  event_reminder: "bg-purple-100 text-purple-600",
  announcement: "bg-pink-100 text-pink-600",
  system: "bg-gray-100 text-gray-600",
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const locale = useLocale();
  const Icon = ICON_MAP[notification.type] ?? Info;
  const colorClass = COLOR_MAP[notification.type] ?? "bg-gray-100 text-gray-600";
  const isUnread = !notification.read_at;
  const title = locale === "th" ? notification.title_th : (notification.title_en || notification.title_th);
  const body = locale === "th" ? notification.body_th : (notification.body_en || notification.body_th);

  const content = (
    <div
      className={`flex gap-3 rounded-xl p-3 transition-colors ${
        isUnread ? "bg-cu-light-pink/50" : "bg-white"
      }`}
      onClick={() => {
        if (isUnread) onMarkRead(notification.id);
      }}
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              isUnread ? "font-bold text-foreground" : "font-medium text-cu-grey"
            }`}
          >
            {title}
          </p>
          {isUnread && (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {body && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-cu-muted">
            {body}
          </p>
        )}
        <p className="mt-1 text-[11px] text-cu-muted">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  );

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return <button className="w-full text-left">{content}</button>;
}
