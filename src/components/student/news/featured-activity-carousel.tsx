"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FeaturedActivityCarouselProps {
  activities: any[];
}

export function FeaturedActivityCarousel({ activities }: FeaturedActivityCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!activities || activities.length === 0) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col gap-3">
      <div 
        className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4"
        onScroll={handleScroll}
      >
        {activities.map((item, idx) => (
          <div key={item.id} className="w-[302px] shrink-0 snap-center">
            <Link href={`/announcements/${item.id}`} className="block">
              <div className="relative h-[110px] w-full overflow-hidden rounded-2xl border border-black/5 bg-[#FFFEF5] shadow-sm">
                {/* Background Image Placeholder or Item Cover */}
                <div className="absolute inset-0 z-0 bg-cu-light-pink/30">
                  {item.cover_image && (
                    <img src={item.cover_image} alt="" className="h-full w-full object-cover opacity-60" />
                  )}
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-white/95 p-3 backdrop-blur-sm">
                  <h4 className="font-heading text-sm font-bold text-cu-grey line-clamp-1">
                    {item.title_th || item.title_en}
                  </h4>
                  <p className="text-[10px] text-cu-muted line-clamp-1">
                    {item.location || "หอพักนิสิต"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5">
        {activities.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === activeIndex ? "w-8 bg-cu-pink" : "w-2 bg-black/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
