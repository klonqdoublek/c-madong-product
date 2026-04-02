"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePublishedAnnouncements } from "@/hooks/use-announcements";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, Calendar, Megaphone, Star } from "lucide-react";

const MAX_VISIBLE = 20;

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// Placeholder images for cards without cover_image
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=300&h=260&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=260&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&h=260&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=300&h=260&fit=crop&q=80",
];

type CategoryTab = "all" | "activity" | "announcement" | "alert";

const CATEGORY_TABS: { key: CategoryTab; labelKey: string }[] = [
  { key: "all", labelKey: "tabAll" },
  { key: "activity", labelKey: "tabActivity" },
  { key: "announcement", labelKey: "tabAnnouncement" },
  { key: "alert", labelKey: "tabAlert" },
];

function formatThaiDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export function AnnouncementsPageContent() {
  const t = useTranslations("announcements");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  const { data: announcements, isLoading } = usePublishedAnnouncements(
    search || undefined
  );

  const filtered = useMemo(() => {
    if (!announcements) return [];
    const list =
      activeTab === "all"
        ? announcements
        : announcements.filter(
            (a: any) => a.category === activeTab
          );
    return list.slice(0, MAX_VISIBLE);
  }, [announcements, activeTab]);

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <PageHeader title={t("title")} />

      <div className="space-y-4 px-4 pb-24 pt-2">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 rounded-full border-none bg-white pl-9 shadow-sm"
            />
          </div>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground shadow-sm"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ml-6 flex gap-3 rounded-xl bg-[#F7F7F7] p-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-[100px] w-[120px] shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-12 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {search ? t("noResults") : t("noAnnouncements")}
            </p>
          </div>
        ) : (
          <div className="relative space-y-3">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200" />

            {filtered.map((item, idx) => (
              <AnnouncementCard
                key={item.id}
                announcement={item}
                isPinned={!!item.is_pinned}
                isFirst={idx === 0 && !!item.is_pinned}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  activity: "กิจกรรม",
  announcement: "ประชาสัมพันธ์",
  alert: "แจ้งเตือน",
};

const CATEGORY_STYLE_MAP: Record<string, string> = {
  activity: "bg-blue-100 text-blue-700",
  announcement: "bg-yellow-100 text-yellow-700",
  alert: "bg-red-100 text-red-700",
};

function AnnouncementCard({
  announcement,
  isPinned,
  isFirst,
  index,
}: {
  announcement: {
    id: string;
    title_th: string | null;
    title_en: string | null;
    cover_image: string | null;
    published_at: string | null;
    created_at: string;
    is_pinned: boolean | null;
    category?: string;
    has_dorm_score?: boolean;
  };
  isPinned: boolean;
  isFirst: boolean;
  index: number;
}) {
  const bgColor = isFirst ? "bg-[#FFE9E9]" : "bg-[#F7F7F7]";
  const dateStr = formatThaiDate(announcement.published_at || announcement.created_at);
  const title = announcement.title_th || announcement.title_en || "";
  const imageUrl =
    announcement.cover_image ||
    PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const category = (announcement as any).category || "announcement";
  const hasDormScore = (announcement as any).has_dorm_score === true;

  return (
    <Link href={`/announcements/${announcement.id}`}>
      <div
        className={`relative ml-6 flex gap-3 rounded-xl p-3 ${bgColor} transition-transform active:scale-[0.98]`}
      >
        {/* Timeline dot */}
        <div className="absolute -left-[13px] top-5 h-3 w-3 rounded-full border-[2.5px] border-primary bg-white" />

        {/* Text content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div className="flex flex-wrap gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE_MAP[category] || CATEGORY_STYLE_MAP.announcement}`}
            >
              {CATEGORY_LABEL_MAP[category] || category}
            </span>
            {hasDormScore && (
              <span className="inline-flex w-fit items-center gap-0.5 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-medium text-pink-700">
                <Star className="h-2.5 w-2.5" />
                มีคะแนนหอพัก
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-heading text-[15px] font-bold leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Cover image — always visible */}
        <div className="h-[100px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-gray-200">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
}
