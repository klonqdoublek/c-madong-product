"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notification-store";
import { useMenuStore } from "@/stores/menu-store";
import { Home, LayoutGrid, Calendar, Bell, User } from "lucide-react";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/profile") return pathname === "/profile";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav({ visible = true }: { visible?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { unreadCount, setOpen } = useNotificationStore();
  const { setMenuModalOpen, isMenuModalOpen } = useMenuStore();

  if (!visible) return null;

  const itemClass = (active: boolean) =>
    cn("flex flex-col items-center gap-0.5 transition-colors", active ? "text-white" : "text-[#F9E1E9]");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="flex items-center justify-around bg-primary px-6 pb-8 pt-3 rounded-t-[26px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {/* Home */}
        <Link
          href="/dashboard"
          onClick={() => setMenuModalOpen(false)}
          className={itemClass(isNavActive(pathname, "/dashboard") && !isMenuModalOpen)}
        >
          <Home className="size-[18px]" strokeWidth={(isNavActive(pathname, "/dashboard") && !isMenuModalOpen) ? 2.5 : 2} />
          <span className={cn("text-[12px] leading-tight tracking-tight", (isNavActive(pathname, "/dashboard") && !isMenuModalOpen) ? "font-bold" : "font-normal")}>
            {t("home")}
          </span>
        </Link>

        {/* Menu — opens menu overlay */}
        <button
          type="button"
          onClick={() => setMenuModalOpen(!isMenuModalOpen)}
          className={itemClass(isMenuModalOpen)}
        >
          <LayoutGrid className="size-[18px]" strokeWidth={isMenuModalOpen ? 2.5 : 2} />
          <span className={cn("text-[12px] leading-tight tracking-tight", isMenuModalOpen ? "font-bold" : "font-normal")}>
            {t("menu")}
          </span>
        </button>

        {/* Calendar */}
        <Link
          href="/dorm-calendar"
          onClick={() => setMenuModalOpen(false)}
          className={itemClass(isNavActive(pathname, "/dorm-calendar") && !isMenuModalOpen)}
        >
          <Calendar className="size-[18px]" strokeWidth={(isNavActive(pathname, "/dorm-calendar") && !isMenuModalOpen) ? 2.5 : 2} />
          <span className={cn("text-[12px] leading-tight tracking-tight", (isNavActive(pathname, "/events") && !isMenuModalOpen) ? "font-bold" : "font-normal")}>
            {t("calendar")}
          </span>
        </Link>

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
        <Link href="/profile" onClick={() => setMenuModalOpen(false)} className={itemClass(isNavActive(pathname, "/profile"))}>
          <User className="size-[18px]" strokeWidth={isNavActive(pathname, "/profile") ? 2.5 : 2} />
          <span className={cn("text-[12px] leading-tight tracking-tight", isNavActive(pathname, "/profile") ? "font-bold" : "font-normal")}>
            {t("myAccount")}
          </span>
        </Link>
      </div>
    </nav>
  );
}
