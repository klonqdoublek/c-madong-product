"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar, Check, Pin } from "lucide-react";
import { useMarkReadMutation } from "@/hooks/use-announcements";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title_th: string | null;
    title_en: string | null;
    content_th: string | null;
    content_en: string | null;
    cover_image: string | null;
    published_at: string | null;
    created_at: string;
    is_pinned: boolean | null;
    category?: string;
    has_dorm_score?: boolean;
    location?: string;
  };
  isRead?: boolean;
}

export function AnnouncementCard({ announcement, isRead = false }: AnnouncementCardProps) {
  const t = useTranslations("announcements");
  const markRead = useMarkReadMutation();

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markRead.mutateAsync(announcement.id);
      toast.success("รับทราบประกาศเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้ ลองใหม่อีกครั้งนะ");
    }
  };

  const dateStr = announcement.published_at || announcement.created_at;
  const formattedDate = dateStr 
    ? format(new Date(dateStr), "d MMM yyyy", { locale: th })
    : "";
  const displayDate = formattedDate ? `${formattedDate} ${new Date(dateStr).getFullYear() + 543}` : "";

  const title = announcement.title_th || announcement.title_en || "";
  const content = announcement.content_th || announcement.content_en || "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-cu-cream-light p-4 shadow-sm">
      {/* Pinned Icon Overlay - Figma Node 1461:20186 */}
      {announcement.is_pinned && (
        <div className="absolute right-[-8px] top-[-8px] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-cu-task-green/80 shadow-md">
           <Pin className="h-5 w-5 rotate-[45deg] text-white" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {announcement.is_pinned && (
            <span className="inline-flex h-[21px] items-center rounded-full border border-black/24 bg-white px-3 text-[10px] font-bold text-cu-grey">
              บังคับ
            </span>
          )}
          {announcement.has_dorm_score && (
            <span className="inline-flex h-[21px] items-center rounded-full border border-black/24 bg-white px-3 text-[10px] font-bold text-cu-grey">
              คะแนนหอพัก
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/announcements/${announcement.id}`}>
          <h3 className="font-heading text-base font-bold text-cu-grey line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-xs text-cu-muted line-clamp-1">
          {content.substring(0, 100)}
        </p>

        {/* Footer Area */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 rounded-[5px] border border-black/10 px-2 py-1 text-[10px] text-cu-muted">
              <Calendar className="h-3 w-3" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-cu-muted">
              <span>เผยแพร่โดย</span>
              <span>•</span>
              <span>เจ้าหน้าที่หอพัก</span>
            </div>
          </div>

          {!isRead && (
            <button
              onClick={handleMarkRead}
              disabled={markRead.isPending}
              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-cu-pink px-4 text-sm font-bold text-[#FFFEF5] shadow-sm hover:bg-cu-pink-dark active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
              <span>{markRead.isPending ? "กำลังบันทึก..." : "รับทราบ"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
