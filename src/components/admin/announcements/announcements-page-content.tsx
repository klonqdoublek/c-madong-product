"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAnnouncements } from "@/hooks/use-announcements";
import { ANNOUNCEMENT_STATUSES } from "@/types/announcements";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
};

export function AnnouncementsPageContent() {
  const t = useTranslations("admin.announcementsPage");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: announcements, isLoading } = useAnnouncements({
    search: search || undefined,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/admin/announcements/new"
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t("allStatuses")}</option>
          {ANNOUNCEMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Link
              key={ann.id}
              href={`/admin/announcements/${ann.id}`}
              className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{ann.title_th}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {ann.content_th}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(ann.created_at).toLocaleDateString("th-TH")}
                    </span>
                    {ann.is_pinned && (
                      <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700">
                        {t("pinned")}
                      </span>
                    )}
                    {ann.message_type === "flex" && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-purple-700">
                        Flex
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ann.status] ?? STATUS_COLORS.draft}`}
                >
                  {t(
                    ANNOUNCEMENT_STATUSES.find((s) => s.value === ann.status)
                      ?.labelKey ?? "statusDraft"
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">{t("noAnnouncements")}</p>
      )}
    </div>
  );
}
