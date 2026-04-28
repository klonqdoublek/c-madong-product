"use client";

import { useBotSearchableAnnouncements } from "@/hooks/use-announcements";
import { ExternalLink, Megaphone } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ประกาศ",
  alert: "แจ้งเตือน",
  activity: "กิจกรรม",
  news: "ข่าวสาร",
  pr: "ประชาสัมพันธ์",
};

const CATEGORY_COLORS: Record<string, string> = {
  announcement: "bg-blue-50 text-blue-700",
  alert: "bg-red-50 text-red-700",
  activity: "bg-green-50 text-green-700",
  news: "bg-purple-50 text-purple-700",
  pr: "bg-orange-50 text-orange-700",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AnnouncementsInKB() {
  const { data, isLoading } = useBotSearchableAnnouncements();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2 px-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
          <Megaphone className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          ยังไม่มีประกาศในฐานข้อมูล Bot
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          ประกาศที่ส่งแล้วและเปิดใช้ Bot จะปรากฏที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-1">
      {data.map((ann) => {
        const hasEmbedding = !!ann.embedding;
        const catLabel = ann.category ? (CATEGORY_LABELS[ann.category] ?? ann.category) : null;
        const catColor = ann.category ? (CATEGORY_COLORS[ann.category] ?? "bg-gray-50 text-gray-600") : null;

        return (
          <button
            key={ann.id}
            onClick={() => router.push(`/admin/announcements?id=${ann.id}` as any)}
            className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
          >
            {/* Embedding status dot */}
            <div className="mt-1 shrink-0">
              <div
                title={hasEmbedding ? "Bot ค้นหาได้" : "กำลังสร้าง embedding"}
                className={`h-2 w-2 rounded-full ${
                  hasEmbedding ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {ann.title_th}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {catLabel && catColor && (
                  <span className={`rounded-full px-1.5 py-px text-[9px] font-medium ${catColor}`}>
                    {catLabel}
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground">
                  {formatDate(ann.sent_at)}
                </span>
              </div>
            </div>

            {/* External link icon */}
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}
