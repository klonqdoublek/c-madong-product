"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BotLibraryFilterBar } from "./bot-library-filter-bar";
import { BotLibraryTable } from "./bot-library-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/use-announcement-organize";

type CategoryFilter = "all" | "announcement" | "alert" | "activity" | "news" | "pr";

export function BotLibraryPageContent() {
  const t = useTranslations("admin");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [showPr, setShowPr] = useState(false);

  // Fetch announcements with bot_only filter
  const { data: announcements, isLoading } = useAnnouncements({
    search,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    archived: false,
    bot_only: true,
    include_pr: showPr,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bot Library</h1>
        <p className="text-sm text-muted-foreground">
          ประกาศที่ถูกจัดทำเป็น index สำหรับ AI Bot
        </p>
      </div>

      {/* Filter Bar */}
      <BotLibraryFilterBar
        categoryFilter={categoryFilter}
        onCategoryChange={(cat) => setCategoryFilter(cat as CategoryFilter)}
        search={search}
        onSearchChange={setSearch}
        showPr={showPr}
        onShowPrChange={setShowPr}
        announcementCount={announcements?.length ?? 0}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <BotLibraryTable announcements={(announcements as any) ?? []} />
      )}
    </div>
  );
}
