"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notification-store";
import { Home, IdCard, Calendar, Bell, User } from "lucide-react";

const linkItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/profile/dorm-card", icon: IdCard, labelKey: "dormCard" as const },
  { href: "/events", icon: Calendar, labelKey: "calendar" as const },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/profile") return pathname === "/profile";
  if (href === "/profile/dorm-card") return pathname === "/profile/dorm-card";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav({ visible = true }: { visible?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { unreadCount, setOpen } = useNotificationStore();

  if (!visible) return null;

  const itemClass = (active: boolean) =>
    cn("flex flex-col items-center gap-0.5", active ? "text-white" : "text-[#F9E1E9]");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="flex items-center justify-around bg-primary px-6 pb-8 pt-3 rounded-t-[26px]">
        {/* Link items: home, dorm card, calendar */}
        {linkItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={itemClass(active)}>
              <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[12px] leading-tight tracking-tight", active ? "font-bold" : "font-normal")}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Bell — opens notification modal */}
        <button type="button" onClick={() => setOpen(true)} className={itemClass(false)}>
          <div className="relative">
            <Bell className="size-[18px]" strokeWidth={2} />
            {unreadCount > 0 && (
              <div className="absolute -right-1.5 -top-0.5 size-[6px] rounded-full bg-red-500" />
            )}
          </div>
          <span className="text-[12px] leading-tight tracking-tight font-normal">
            {t("notifications")}
          </span>
        </button>

        {/* Profile */}
        <Link href="/profile" className={itemClass(isNavActive(pathname, "/profile"))}>
          <User className="size-[18px]" strokeWidth={isNavActive(pathname, "/profile") ? 2.5 : 2} />
          <span className={cn("text-[12px] leading-tight tracking-tight", isNavActive(pathname, "/profile") ? "font-bold" : "font-normal")}>
            {t("myAccount")}
          </span>
        </Link>
      </div>
    </nav>
  );
}
