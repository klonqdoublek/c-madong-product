"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface NewsCardProps {
  item: {
    id: string;
    title_th: string | null;
    title_en: string | null;
    cover_image: string | null;
    published_at: string | null;
    created_at: string;
    category?: string;
    has_dorm_score?: boolean;
  };
}

export function NewsCard({ item }: NewsCardProps) {
  const t = useTranslations("announcements");
  
  const dateStr = item.published_at || item.created_at;
  const dateObj = new Date(dateStr);
  const day = dateObj.getDate();
  const month = format(dateObj, "MMM", { locale: th });
  const fullDate = `${format(dateObj, "d MMM", { locale: th })} ${dateObj.getFullYear() + 543}`;

  const title = item.title_th || item.title_en || "";

  return (
    <Link href={`/announcements/${item.id}`} className="block">
      <div className="flex h-[110px] w-full gap-3 rounded-2xl border border-black/5 bg-[#FFFEF5] p-3 shadow-sm hover:shadow-md transition-shadow">
        {/* Date Column */}
        <div className="flex h-full w-[56px] flex-col items-center justify-center rounded-xl bg-cu-pink/5 text-cu-grey">
          <span className="font-heading text-lg font-bold leading-none">{day}-{day+7}</span>
          <span className="text-[12px] font-bold">{month}</span>
        </div>

        {/* Image / Content Container */}
        <div className="flex flex-1 gap-3 overflow-hidden">
           {/* Image (Mock placeholder or cover_image) */}
           <div className="h-full w-[110px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
             {item.cover_image ? (
               <img src={item.cover_image} alt="" className="h-full w-full object-cover" />
             ) : (
               <div className="h-full w-full bg-cu-light-pink/20" />
             )}
           </div>

           {/* Text Info */}
           <div className="flex flex-col justify-between py-0.5">
             <div className="flex flex-col gap-1">
               <div className="flex gap-1.5">
                 <span className="inline-flex items-center rounded-full border border-black/24 bg-white px-2 py-0.5 text-[9px] font-medium text-cu-grey">
                   กิจกรรม
                 </span>
                 {item.has_dorm_score && (
                   <span className="inline-flex items-center rounded-full border border-black/24 bg-white px-2 py-0.5 text-[9px] font-medium text-cu-grey">
                     คะแนนหอพัก
                   </span>
                 )}
               </div>
               <h4 className="font-heading text-xs font-bold text-cu-grey line-clamp-2 leading-tight">
                 {title}
               </h4>
             </div>
             <span className="text-[9px] text-cu-muted">{fullDate}</span>
           </div>
        </div>
      </div>
    </Link>
  );
}
