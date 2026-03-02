"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Megaphone,
  Wrench,
  BookOpen,
  Settings,
  ChevronDown,
  Building2,
  Menu,
  LogOut,
  Users,
  HardHat,
  Tag,
  Shield,
  Cog,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();

  // Track which collapsible groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open group that contains the current path
    const groups: Record<string, boolean> = {};
    if (pathname.includes("/announcements") || pathname.includes("/templates") || pathname.includes("/broadcast")) {
      groups.announcements = true;
    }
    if (pathname.includes("/maintenance")) {
      groups.maintenance = true;
    }
    if (pathname.includes("/students") || pathname.includes("/technicians") || pathname.includes("/tags") || pathname.includes("/roles") || pathname.includes("/settings")) {
      groups.settings = true;
    }
    return groups;
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Top-level nav item
  const overviewItem: NavItem = {
    href: "/admin/dashboard",
    label: t("navOverview"),
  };

  // Collapsible nav groups
  const navGroups: (NavGroup & { key: string })[] = [
    {
      key: "announcements",
      label: t("navAnnouncementCenter"),
      icon: <Megaphone className="h-4 w-4" />,
      items: [
        { href: "/admin/announcements", label: t("navAllAnnouncements") },
        { href: "/admin/announcements/new", label: t("navNewAnnouncement") },
        { href: "/admin/templates", label: t("navTemplates") },
      ],
    },
    {
      key: "maintenance",
      label: t("navMaintenance"),
      icon: <Wrench className="h-4 w-4" />,
      items: [
        { href: "/admin/maintenance", label: t("navKanbanBoard") },
        { href: "/admin/maintenance/all", label: t("navAllTickets") },
      ],
    },
    {
      key: "settings",
      label: t("navSettings"),
      icon: <Settings className="h-4 w-4" />,
      items: [
        { href: "/admin/students", label: t("navStudents"), icon: <Users className="h-3.5 w-3.5" /> },
        { href: "/admin/maintenance/technicians", label: t("navTechnicians"), icon: <HardHat className="h-3.5 w-3.5" /> },
        { href: "/admin/tags", label: t("navTags"), icon: <Tag className="h-3.5 w-3.5" /> },
        { href: "/admin/roles", label: t("navRoles"), icon: <Shield className="h-3.5 w-3.5" /> },
        { href: "/admin/settings", label: t("navSystemSettings"), icon: <Cog className="h-3.5 w-3.5" /> },
      ],
    },
  ];

  // Knowledge base standalone item
  const knowledgeBaseItem: NavItem = {
    href: "/admin/knowledge-base",
    label: t("navKnowledgeBase"),
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isActive(item.href));
  };

  const linkClasses = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
      isActive(href)
        ? "bg-white text-primary font-medium shadow-lg"
        : "text-white/80 hover:bg-white/20 hover:text-white"
    );

  const subLinkClasses = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200",
      isActive(href)
        ? "bg-white/20 text-white font-medium"
        : "text-white/60 hover:bg-white/10 hover:text-white/90"
    );

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-bold text-white">
            {t("sidebarTitle")}
          </p>
          <p className="truncate text-xs text-white/60">
            {t("sidebarSubtitle")}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Overview */}
        <Link
          href={overviewItem.href}
          className={linkClasses(overviewItem.href)}
          onClick={() => setSidebarOpen(false)}
        >
          <LayoutDashboard className="h-4 w-4" />
          {overviewItem.label}
        </Link>

        {/* Collapsible groups */}
        {navGroups.map((group) => (
          <Collapsible
            key={group.key}
            open={openGroups[group.key] ?? isGroupActive(group)}
            onOpenChange={() => toggleGroup(group.key)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white">
              <span className="flex items-center gap-2">
                {group.icon}
                {group.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  (openGroups[group.key] ?? isGroupActive(group)) && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-4">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={subLinkClasses(item.href)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {/* Knowledge Base */}
        <Link
          href={knowledgeBaseItem.href}
          className={linkClasses(knowledgeBaseItem.href)}
          onClick={() => setSidebarOpen(false)}
        >
          <BookOpen className="h-4 w-4" />
          {knowledgeBaseItem.label}
        </Link>
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-3 py-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="gradient-primary hidden w-64 shrink-0 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "gradient-primary fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-muted/30">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-white/80 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-heading font-bold text-primary">
            C-Madong Admin
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
