"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTemplates } from "@/hooks/use-templates";
import { TEMPLATE_CATEGORIES } from "@/types/announcements";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function TemplatesPageContent() {
  const t = useTranslations("admin.templates");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: templates, isLoading } = useTemplates({
    search: search || undefined,
    category: categoryFilter,
  });

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/admin/templates/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("new")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={tCommon("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t("allCategories")}</option>
          {TEMPLATE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {t(c.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{tmpl.name}</h3>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {tmpl.message_type}
                </span>
              </div>
              {tmpl.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {tmpl.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">
                  {t(
                    TEMPLATE_CATEGORIES.find((c) => c.value === tmpl.category)
                      ?.labelKey ?? "categoryGeneral"
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">{t("noTemplates")}</p>
      )}
    </div>
  );
}
