"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAINTENANCE_CATEGORIES } from "@/lib/utils/constants";
import { useMaintenanceStore } from "@/stores/maintenance-store";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketFilters() {
  const t = useTranslations();
  const { filters, setFilter, resetFilters } = useMaintenanceStore();

  const hasActiveFilters =
    filters.search || filters.category !== "all" || filters.building !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(v) => setFilter("category", v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("maintenance.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.viewAll")}</SelectItem>
          {MAINTENANCE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`maintenance.categories.${cat}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-1 size-4" />
          {t("common.filter")}
        </Button>
      )}
    </div>
  );
}
