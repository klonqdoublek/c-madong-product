"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Wrench,
  FileText,
  UserCheck,
  Package,
  BookOpen,
  CalendarDays,
  Banknote,
} from "lucide-react";

const MENU_ITEMS = [
  { key: "quickBroadcast", href: "/admin/broadcast", icon: Send, color: "text-green-600 bg-green-50" },
  { key: "quickMaintenance", href: "/admin/maintenance", icon: Wrench, color: "text-amber-600 bg-amber-50" },
  { key: "quickTemplate", href: "/admin/templates", icon: FileText, color: "text-blue-600 bg-blue-50" },
  { key: "quickStudents", href: "/admin/students", icon: UserCheck, color: "text-primary bg-primary/10" },
  { key: "quickParcels", href: "/admin/parcels", icon: Package, color: "text-teal-600 bg-teal-50" },
  { key: "quickKnowledge", href: "/admin/knowledge-base", icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
  { key: "quickEvents", href: "/admin/events", icon: CalendarDays, color: "text-pink-600 bg-pink-50" },
  { key: "quickBilling", href: "/admin/billing", icon: Banknote, color: "text-yellow-600 bg-yellow-50" },
] as const;

export function DashboardQuickMenu() {
  const t = useTranslations("admin.dashboardPage");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">
          {t("quickMenu")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MENU_ITEMS.map(({ key, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all duration-200 hover:shadow-hover"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {t(key)}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
