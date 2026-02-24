"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const adminNavItems = [
  { href: "/admin/dashboard", labelKey: "dashboard" as const },
  { href: "/admin/maintenance", labelKey: "openTickets" as const },
  { href: "/admin/students", labelKey: "students" as const },
  { href: "/admin/announcements", labelKey: "title" as const },
  { href: "/admin/broadcast", labelKey: "title" as const },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const tAnnouncements = useTranslations("announcements");
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const getLabel = (item: (typeof adminNavItems)[number]) => {
    if (item.href === "/admin/announcements" || item.href === "/admin/broadcast") {
      return tAnnouncements(item.labelKey);
    }
    return t(item.labelKey);
  };

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/admin/dashboard"
            className="font-heading text-lg font-bold text-primary"
          >
            C-Madong Admin
          </Link>
        </div>
        <nav className="space-y-1 p-2">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {getLabel(item)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
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
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <span className="ml-3 font-heading font-bold text-primary">C-Madong Admin</span>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
