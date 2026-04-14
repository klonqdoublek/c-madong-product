"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMyScore } from "@/hooks/use-score";
import { getScoreColor, getScoreProgressColor, getScoreTier } from "@/lib/utils/score-constants";
import { Trophy, ChevronRight } from "lucide-react";

export function DashboardScoreCard() {
  const t = useTranslations("score");
  const tDash = useTranslations("dashboard");
  const { data: scoreData, isLoading } = useMyScore();

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-3 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!scoreData) return null;

  const score = scoreData.composite_score ?? 0;
  const tier = getScoreTier(score);
  const scoreColor = getScoreColor(score);

  return (
    <Link href="/score" className="block">
      <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{tDash("dormScore")}</p>
              <p className="text-xs text-muted-foreground">{tier.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-heading text-2xl font-bold ${scoreColor}`}>
              {Math.round(score)}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Category mini progress bars */}
        {scoreData.categories && scoreData.categories.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {scoreData.categories.map((cat: any) => {
              const pct = cat.max_score > 0 ? (cat.score / cat.max_score) * 100 : 0;
              return (
                <div key={cat.category_id} className="flex items-center gap-2">
                  <span className="w-16 truncate text-[10px] text-muted-foreground">
                    {cat.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreProgressColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] font-medium text-muted-foreground">
                    {Math.round(cat.score)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
