"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePublishedAnnouncements } from "@/hooks/use-announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Megaphone, BellRing } from "lucide-react";
import { NewsAnnouncementsHeader } from "./news-announcements-header";
import { AnnouncementCard } from "./announcement-card";

type FilterTab = "unread" | "all" | "pinned" | "read";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "unread", label: "ยังไม่อ่าน" },
  { key: "all", label: "ทั้งหมด" },
  { key: "pinned", label: "ที่ปักหมุด" },
  { key: "read", label: "รับทราบแล้ว" },
];

export function AnnouncementsPageContent() {
  const t = useTranslations("announcements");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("unread");

  const { data: announcements, isLoading } = usePublishedAnnouncements(
    search || undefined
  );

  // Filter logic based on category (announcement, alert) and status
  const filtered = useMemo(() => {
    if (!announcements) return [];
    
    // Base filter: only show 'announcement' and 'alert' categories in this tab
    const baseList = announcements.filter(
      (a: any) => a.category === "announcement" || a.category === "alert"
    );

    // Apply sub-filters
    switch (activeFilter) {
      case "unread":
        // In a real app, we'd join with announcement_reads. For now, show all or mock it.
        return baseList.filter((a: any) => !a.is_read); 
      case "pinned":
        return baseList.filter((a: any) => a.is_pinned);
      case "read":
        return baseList.filter((a: any) => a.is_read);
      default:
        return baseList;
    }
  }, [announcements, activeFilter]);

  // Dynamic counts for sub-filters
  const counts = useMemo(() => {
    if (!announcements) return { unread: 0, all: 0, pinned: 0, read: 0 };
    const baseList = announcements.filter(
      (a: any) => a.category === "announcement" || a.category === "alert"
    );
    return {
      unread: baseList.filter((a: any) => !a.is_read).length,
      all: baseList.length,
      pinned: baseList.filter((a: any) => a.is_pinned).length,
      read: baseList.filter((a: any) => a.is_read).length,
    };
  }, [announcements]);

  const announcementCount = announcements?.filter((a: any) => a.category === "announcement" || a.category === "alert").length || 0;
  const newsCount = announcements?.filter((a: any) => a.category === "activity" || a.category === "news" || a.category === "pr").length || 0;

  return (
    <div className="min-h-screen bg-[#FBF6E9] pb-20">
      <NewsAnnouncementsHeader
        activeTab="announcements"
        search={search}
        onSearchChange={setSearch}
        announcementCount={announcementCount}
        newsCount={newsCount}
        placeholder="ค้นหาประกาศ..."
      />

      <div className="mt-4 flex flex-col gap-6 px-4">
        {/* LINE Notification Banner */}
        <div className="relative flex h-[100px] w-full items-center gap-3 overflow-hidden rounded-2xl bg-[#52AD7E] p-4 text-white shadow-md">
           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
             <BellRing className="h-6 w-6" />
           </div>
           <div className="flex flex-col">
             <h3 className="font-heading text-lg font-bold leading-tight">เปิดแจ้งเตือนใน LINE</h3>
             <p className="text-sm opacity-90">รับประกาศสำคัญได้เลย</p>
           </div>
           <button className="absolute right-3 top-3 opacity-60 hover:opacity-100">
             <X className="h-4 w-4" />
           </button>
           {/* Mascot Background Placeholder */}
           <div className="absolute -bottom-4 -right-4 h-24 w-24 opacity-30 bg-white/20 rounded-full" />
        </div>

        {/* Sub-Filters */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 transition-all ${
                  activeFilter === tab.key
                    ? "bg-[#52AD7E] text-white"
                    : "bg-[#FFFEF5] text-cu-muted shadow-sm border border-black/5"
                }`}
              >
                <span className="font-heading text-xs font-bold">{tab.label}</span>
                <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                  activeFilter === tab.key ? "bg-white text-[#52AD7E]" : "bg-black/10 text-cu-grey"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4">
           {/* Featured / Important Section if any pinned items */}
           {filtered.some(a => a.is_pinned) && activeFilter === "all" && (
             <div className="flex flex-col gap-3">
                {filtered.filter(a => a.is_pinned).slice(0, 1).map(item => (
                  <AnnouncementCard key={item.id} announcement={item} />
                ))}
             </div>
           )}

           {/* Latest Announcements */}
           <div className="flex items-center justify-between">
             <h2 className="font-heading text-base font-bold text-cu-grey">ประกาศล่าสุด</h2>
             <button className="text-xs font-bold text-cu-muted underline">ดูทั้งหมด</button>
           </div>

           {isLoading ? (
             <div className="flex flex-col gap-3">
                <Skeleton className="h-[140px] w-full rounded-2xl" />
                <Skeleton className="h-[140px] w-full rounded-2xl" />
             </div>
           ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-12 text-center shadow-sm">
                <Megaphone className="h-10 w-10 text-cu-neutral" />
                <p className="text-sm text-cu-muted">ไม่พบประกาศที่เกี่ยวข้อง</p>
             </div>
           ) : (
             <div className="flex flex-col gap-3">
                {filtered.map(item => (
                  <AnnouncementCard key={item.id} announcement={item} isRead={item.is_read} />
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

