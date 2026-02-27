"use client";

import { useTranslations } from "next-intl";
import { MAINTENANCE_CATEGORIES } from "@/lib/utils/constants";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { cn } from "@/lib/utils";

interface CategoryPickerProps {
  value: string | null;
  onChange: (category: string) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const t = useTranslations("maintenance.categories");

  return (
    <div className="grid grid-cols-3 gap-3">
      {MAINTENANCE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            value === cat
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-muted hover:border-primary/30 hover:bg-muted/50"
          )}
        >
          <CategoryIcon
            category={cat}
            size={24}
            className={cn(
              value === cat ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium leading-tight text-center",
              value === cat ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t(cat)}
          </span>
        </button>
      ))}
    </div>
  );
}
