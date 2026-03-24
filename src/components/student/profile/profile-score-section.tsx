"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyScore } from "@/hooks/use-score";
import { ChevronRight } from "lucide-react";

const BAR_COLORS = {
  mandatory: "#DD598B",
  external: "#FFF3D2",
  internal: "#CFFFCD",
};

export function ProfileScoreSection() {
  const t = useTranslations("profile");
  const { data: scoreData, isLoading } = useMyScore();

  if (isLoading) {
    return (
      <div className="h-28 animate-pulse rounded-xl bg-white" />
    );
  }

  const score = scoreData?.composite_score ?? 0;
  const categories = scoreData?.categories ?? [];
  const totalMax = categories.reduce((sum, c) => sum + c.max_score, 0) || 100;

  // Map categories to color segments
  const segments = categories.map((cat, i) => {
    const colorKeys = Object.keys(BAR_COLORS) as (keyof typeof BAR_COLORS)[];
    const colorKey = colorKeys[i % colorKeys.length];
    return {
      name: cat.name,
      score: cat.score,
      maxScore: cat.max_score,
      color: BAR_COLORS[colorKey],
      width: (cat.score / totalMax) * 100,
    };
  });

  return (
    <Link
      href="/score"
      className="block rounded-xl bg-white p-4 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#565655]">
            {t("dormScore")}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {t("scoreLatest")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-heading text-2xl font-bold text-primary">
            {Math.round(score)}
          </span>
          <span className="text-xs text-muted-foreground">{t("scoreUnit")}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Stacked bar */}
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${seg.width}%`,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {seg.name}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
