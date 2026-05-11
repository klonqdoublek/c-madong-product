"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageCircle, Zap, Newspaper, Ban } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: null },
  { id: "announcement", label: "ทั่วไป", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { id: "alert", label: "แจ้งเตือน", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { id: "activity", label: "กิจกรรม", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "news", label: "ข่าว", icon: <Newspaper className="h-3.5 w-3.5" /> },
] as const;

interface BotLibraryFilterBarProps {
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  showPr: boolean;
  onShowPrChange: (show: boolean) => void;
  announcementCount: number;
}

export function BotLibraryFilterBar({
  categoryFilter,
  onCategoryChange,
  search,
  onSearchChange,
  showPr,
  onShowPrChange,
  announcementCount,
}: BotLibraryFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              categoryFilter === cat.id
                ? "bg-primary text-white font-medium shadow-sm"
                : "bg-card text-foreground border border-border hover:bg-muted"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search + PR Toggle */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="ค้นหาประกาศ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />

        {/* PR Toggle */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => onShowPrChange(!showPr)}
              className={`inline-flex items-center justify-center rounded-md h-9 w-9 transition-colors ${
                showPr
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
            <span className="text-muted-foreground">รวม PR</span>
          </label>

          <Badge variant="secondary" className="ml-2">
            {announcementCount}
          </Badge>
        </div>
      </div>
    </div>
  );
}
