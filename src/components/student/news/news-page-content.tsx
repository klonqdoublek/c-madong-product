"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePublishedAnnouncements } from "@/hooks/use-announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Star, ChevronDown } from "lucide-react";
import { NewsAnnouncementsHeader } from "../announcements/news-announcements-header";
import { NewsCard } from "./news-card";
import { FeaturedActivityCarousel } from "./featured-activity-carousel";

type NewsCategory = "all" | "news" | "activity" | "pr";

const NEWS_CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "news", label: "ข่าวสาร" },
  { key: "activity", label: "กิจกรรม" },
  { key: "pr", label: "ประชาสัมพันธ์" },
];

export function NewsPageContent() {
  const t = useTranslations("announcements");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<NewsCategory>("all");

  const { data: announcements, isLoading } = usePublishedAnnouncements(
    search || undefined
  );

  // Filter logic for news and activities
  const filtered = useMemo(() => {
    if (!announcements) return [];
    
    // Only show 'activity' and 'news' categories in this tab
    const baseList = announcements.filter(
      (a: any) => a.category === "activity" || a.category === "news" || a.category === "pr"
    );

    // Apply category filter
    if (activeCategory === "all") return baseList;
    return baseList.filter((a: any) => a.category === activeCategory);
  }, [announcements, activeCategory]);

  const featuredActivities = useMemo(() => {
    if (!announcements) return [];
    return announcements.filter((a: any) => a.category === "activity").slice(0, 5);
  }, [announcements]);

  const announcementCount = announcements?.filter((a: any) => a.category === "announcement" || a.category === "alert").length || 0;
  const newsCount = announcements?.filter((a: any) => a.category === "activity" || a.category === "news" || a.category === "pr").length || 0;

  return (
    <div className="min-h-screen bg-cu-cream pb-20">
      <NewsAnnouncementsHeader
        activeTab="news"
        search={search}
        onSearchChange={setSearch}
        announcementCount={announcementCount}
        newsCount={newsCount}
        placeholder="ค้นหาข่าวสารหรือกิจกรรม..."
      />

      <div className="mt-4 flex flex-col gap-6">
        {/* Category Filter Pills */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 transition-all shadow-sm ${
                activeCategory === cat.key
                  ? "bg-cu-pink text-white"
                  : "bg-cu-cream-light text-cu-muted border border-black/5"
              }`}
            >
              <span className="font-heading text-xs font-bold">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Activities Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-cu-pink fill-cu-pink" />
              <h2 className="font-heading text-base font-bold text-cu-grey tracking-tight">กิจกรรมเด่นเดือนนี้</h2>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-cu-pink">
              <span>ล่าสุด</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          
          <FeaturedActivityCarousel activities={featuredActivities} />
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-cu-grey">ข่าวสารอื่นๆ</h2>
            <button className="text-xs font-bold text-cu-muted underline">ดูทั้งหมด</button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-[110px] w-full rounded-2xl" />
              <Skeleton className="h-[110px] w-full rounded-2xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-12 text-center shadow-sm">
              <Newspaper className="h-10 w-10 text-cu-neutral" />
              <p className="text-sm text-cu-muted">ไม่พบข่าวสารที่เกี่ยวข้อง</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
