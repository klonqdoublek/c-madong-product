"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Search, ChevronLeft, Megaphone, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NewsAnnouncementsHeaderProps {
  activeTab: "announcements" | "news";
  search: string;
  onSearchChange: (value: string) => void;
  announcementCount?: number;
  newsCount?: number;
  placeholder?: string;
}

export function NewsAnnouncementsHeader({
  activeTab,
  search,
  onSearchChange,
  announcementCount = 24,
  newsCount = 24,
  placeholder,
}: NewsAnnouncementsHeaderProps) {
  const t = useTranslations("announcements");
  const router = useRouter();

  const handleToggle = (tab: "announcements" | "news") => {
    if (tab === "announcements") {
      router.push("/announcements");
    } else {
      router.push("/news");
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-cu-cream px-4 pb-4 pt-2 shadow-sm">
      {/* Page Header */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ChevronLeft className="h-6 w-6 text-cu-grey" />
        </button>
        <h1 className="font-heading text-lg font-bold text-cu-grey">
          ข่าวสารและประกาศ
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Segmented Control */}
      <div className="flex h-[46px] w-full items-center rounded-full bg-cu-cream-light p-1 shadow-sm border border-black/5">
        <button
          onClick={() => handleToggle("announcements")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full h-full transition-all ${
            activeTab === "announcements"
              ? "bg-[#E54F86] text-white shadow-md"
              : "text-cu-muted hover:bg-black/5"
          }`}
        >
          <Megaphone className={`h-4 w-4 ${activeTab === "announcements" ? "text-white" : "text-cu-muted"}`} />
          <span className="font-heading text-sm font-bold">ประกาศ</span>
          <div className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            activeTab === "announcements" ? "bg-white text-cu-grey" : "bg-black/10 text-cu-grey"
          }`}>
            {announcementCount}
          </div>
        </button>
        <button
          onClick={() => handleToggle("news")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full h-full transition-all ${
            activeTab === "news"
              ? "bg-[#E54F86] text-white shadow-md"
              : "text-cu-muted hover:bg-black/5"
          }`}
        >
          <Newspaper className={`h-4 w-4 ${activeTab === "news" ? "text-white" : "text-cu-muted"}`} />
          <span className="font-heading text-sm font-bold">ข่าวสาร</span>
          <div className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            activeTab === "news" ? "bg-white text-cu-grey" : "bg-black/10 text-cu-grey"
          }`}>
            {newsCount}
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cu-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || "ค้นหา..."}
          className="h-10 rounded-full border border-black/5 bg-cu-cream-light pl-9 text-sm shadow-sm focus-visible:ring-cu-pink"
        />
      </div>
    </div>
  );
}
