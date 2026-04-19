"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useUserStore } from "@/stores/user-store";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac/permissions";
import { ROLE_INFO, type AppRole } from "@/lib/rbac/roles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatModal } from "@/components/student/chat-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Banknote,
  CalendarDays,
  Trophy,
  Package,
  Headset,
  FolderTree,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  admin: "super_admin",
  staff: "admin_staff",
};

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  permission?: string;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { can, canAny } = usePermissions();
  const profile = useUserStore((s) => s.profile);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/th/login";
  };
  const { sidebarOpen, setSidebarOpen, toggleSidebar, adminSidebarCollapsed, toggleAdminSidebar } = useUIStore();

  // Track which collapsible groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const groups: Record<string, boolean> = {};
    if (pathname.includes("/announcements") || pathname.includes("/templates") || pathname.includes("/broadcast") || pathname.includes("/organize")) {
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

  // Collapsible nav groups (with permission requirements)
  const allNavGroups: (NavGroup & { key: string; permission?: string })[] = [
    {
      key: "announcements",
      label: t("navAnnouncementCenter"),
      icon: <Megaphone className="h-4 w-4" />,
      permission: Permission.ANNOUNCEMENTS_VIEW,
      items: [
        { href: "/admin/announcements", label: t("navAllAnnouncements") },
        { href: "/admin/announcements/new", label: t("navNewAnnouncement"), permission: Permission.ANNOUNCEMENTS_CREATE },
        { href: "/admin/announcements/organize", label: t("breadcrumb.organize"), icon: <FolderTree className="h-3.5 w-3.5" />, permission: Permission.ANNOUNCEMENTS_VIEW },
        { href: "/admin/templates", label: t("navTemplates"), permission: Permission.TEMPLATES_VIEW },
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
        { href: "/admin/students", label: t("navStudents"), icon: <Users className="h-3.5 w-3.5" />, permission: Permission.STUDENTS_VIEW },
        { href: "/admin/maintenance/technicians", label: t("navTechnicians"), icon: <HardHat className="h-3.5 w-3.5" />, permission: Permission.TECHNICIANS_VIEW },
        { href: "/admin/tags", label: t("navTags"), icon: <Tag className="h-3.5 w-3.5" />, permission: Permission.STUDENTS_TAGS },
        { href: "/admin/roles", label: t("navRoles"), icon: <Shield className="h-3.5 w-3.5" />, permission: Permission.SYSTEM_ROLES },
        { href: "/admin/settings", label: t("navSystemSettings"), icon: <Cog className="h-3.5 w-3.5" />, permission: Permission.SYSTEM_SETTINGS },
      ],
    },
  ];

  // Standalone nav items with permissions
  const standaloneItems: (NavItem & { icon: React.ReactNode; permission?: string })[] = [
    { href: "/admin/live-chat", label: t("navLiveChat"), icon: <Headset className="h-4 w-4" />, permission: Permission.TICKETS_VIEW_ALL },
    { href: "/admin/events", label: t("navEvents"), icon: <CalendarDays className="h-4 w-4" />, permission: Permission.EVENTS_VIEW },
    { href: "/admin/scores", label: t("navScores"), icon: <Trophy className="h-4 w-4" />, permission: Permission.SCORES_VIEW },
    { href: "/admin/billing", label: t("navBilling"), icon: <Banknote className="h-4 w-4" />, permission: Permission.BILLS_VIEW },
    { href: "/admin/parcels", label: t("parcels"), icon: <Package className="h-4 w-4" />, permission: Permission.PARCELS_VIEW },
    { href: "/admin/knowledge-base", label: t("navKnowledgeBase"), icon: <BookOpen className="h-4 w-4" />, permission: Permission.KNOWLEDGE_VIEW },
  ];

  // Group-level permission overrides (some groups need canAny check)
  const groupPermissionCheck: Record<string, () => boolean> = {
    maintenance: () => canAny([Permission.TICKETS_VIEW_ALL, Permission.TICKETS_VIEW_ASSIGNED]),
  };

  // Filter items by permission
  const navGroups = allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((group) => {
      const groupCheck = groupPermissionCheck[group.key];
      if (groupCheck) return groupCheck();
      if (group.permission && !can(group.permission)) return false;
      return group.items.length > 0;
    });

  const visibleStandaloneItems = standaloneItems.filter(
    (item) => !item.permission || can(item.permission)
  );

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

  // ── Collapsed sidebar (icon-only) ──────────────────────────────
  const collapsedSidebar = (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col items-center">
        {/* Logo icon + Expand button */}
        <div className="flex w-full flex-col items-center border-b border-white/10 py-3">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleAdminSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("expandSidebar")}</TooltipContent>
          </Tooltip>
        </div>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto px-1.5 py-2">
          {/* Overview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={overviewItem.href}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isActive(overviewItem.href)
                    ? "bg-white text-primary shadow-lg"
                    : "text-white/80 hover:bg-white/20 hover:text-white"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{overviewItem.label}</TooltipContent>
          </Tooltip>

          {/* Group icons — show first icon of group */}
          {navGroups.map((group) => (
            <Tooltip key={group.key}>
              <TooltipTrigger asChild>
                <Link
                  href={group.items[0]?.href ?? "#"}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isGroupActive(group)
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/80 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {group.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{group.label}</TooltipContent>
            </Tooltip>
          ))}

          {/* Standalone icons */}
          {visibleStandaloneItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/80 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* User avatar + logout */}
        <div className="flex flex-col items-center gap-2 border-t border-white/10 px-1.5 py-3">
          {profile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-heading text-xs font-bold text-white">
                      {profile.full_name_th?.charAt(0) || "?"}
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                {profile.display_name || profile.full_name_th}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">ออกจากระบบ</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );

  // ── Full sidebar ──────────────────────────────────────────────
  const fullSidebar = (
    <div className="flex h-full flex-col">
      {/* Logo + Collapse button */}
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
        <button
          onClick={toggleAdminSidebar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
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

        {/* Standalone items (filtered by permission) */}
        {visibleStandaloneItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClasses(item.href)}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-3 py-4 space-y-3">
        {/* Admin profile */}
        {profile && (
          <Link
            href="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-start gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-white/10"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 font-heading text-sm font-bold text-white">
                {profile.full_name_th?.charAt(0) || "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold text-white">
                {profile.display_name || profile.full_name_th}
              </p>
              <div className="flex items-center gap-1 text-white/70">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <p className="truncate text-xs">
                  {(() => {
                    const role = profile.role;
                    if (!role) return "";
                    const mapped = LEGACY_ROLE_MAP[role] ?? (role as AppRole);
                    return ROLE_INFO[mapped]?.nameTh ?? role;
                  })()}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  const sidebarWidth = adminSidebarCollapsed ? "w-[60px]" : "w-64";
  const sidebarMargin = adminSidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-64";

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar — fixed in place */}
      <aside
        className={cn(
          "gradient-primary fixed inset-y-0 left-0 z-30 hidden overflow-y-auto transition-all duration-300 lg:block",
          sidebarWidth
        )}
      >
        {adminSidebarCollapsed ? collapsedSidebar : fullSidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar — always full width */}
      <aside
        className={cn(
          "gradient-primary fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {fullSidebar}
      </aside>

      {/* Main content — offset for fixed sidebar on desktop */}
      <div className={cn("flex flex-1 flex-col bg-muted/30 transition-all duration-300", sidebarMargin)}>
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
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Chat modal for mascot widget */}
      <ChatModal />
    </div>
  );
}
