"use client"

import { Newspaper, Megaphone, CalendarDays, AlertTriangle, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface Category {
  value: string
  label: string
  Icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { value: "news",         label: "ข่าวสาร",        Icon: Newspaper },
  { value: "announcement", label: "ประกาศ",          Icon: Megaphone },
  { value: "activity",     label: "กิจกรรม",        Icon: CalendarDays },
  { value: "alert",        label: "แจ้งเตือนด่วน", Icon: AlertTriangle },
  { value: "pr",           label: "ประชาสัมพันธ์",  Icon: Radio },
]

interface AnnouncementCategoryPillsProps {
  value: string
  onChange: (v: string) => void
}

export function AnnouncementCategoryPills({
  value,
  onChange,
}: AnnouncementCategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value: v, label, Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium",
              "border transition-all duration-200",
              "active:scale-[0.97]",
              active
                ? "border-primary bg-primary text-white shadow-[0_2px_10px_rgba(221,89,139,0.25)]"
                : "border-transparent bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
