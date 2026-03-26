"use client";

import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/user-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function DashboardHeader() {
  const t = useTranslations("admin.dashboardPage");
  const profile = useUserStore((s) => s.profile);
  const name = profile?.full_name_th ?? profile?.display_name ?? "Admin";

  const handleComingSoon = () => {
    toast.info(t("comingSoon"));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {t("greeting", { name })}
        </h1>
        <p className="text-sm text-muted-foreground">{t("systemSubtitle")}</p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              {t("exportData")}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleComingSoon}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleComingSoon}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className="gradient-primary text-white shadow-sm hover:opacity-90"
          onClick={handleComingSoon}
        >
          <FileText className="mr-1.5 h-4 w-4" />
          {t("createReport")}
        </Button>
      </div>
    </div>
  );
}
