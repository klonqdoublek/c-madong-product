"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMyScore, useMyScoreHistory } from "@/hooks/use-score";
import {
  getScoreTier,
  getScoreColor,
  getScoreProgressColor,
  formatScoreChange,
} from "@/lib/utils/score-constants";
import { Trophy, History, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export function ScorePageContent() {
  const t = useTranslations("score");
  const { data: scoreData, isLoading: scoreLoading } = useMyScore();
  const { data: history, isLoading: historyLoading } = useMyScoreHistory();
  const [showAll, setShowAll] = useState(false);

  if (scoreLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const score = scoreData?.composite_score ?? 0;
  const tier = getScoreTier(score);
  const scoreColor = getScoreColor(score);
  const categories = scoreData?.categories ?? [];
  const displayHistory = showAll ? history : (history ?? []).slice(0, 10);

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-6 p-4">

      {/* Composite Score Card */}
      <div className={`rounded-xl border p-6 ${tier.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("compositeScore")}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`font-heading text-5xl font-bold ${scoreColor}`}>
                {Math.round(score)}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className={`mt-1 text-sm font-medium ${tier.color}`}>
              {tier.label}
            </p>
          </div>
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tier.bgColor}`}>
            <Trophy className={`h-8 w-8 ${tier.color}`} />
          </div>
        </div>
        {/* Renewal priority text */}
        <p className="mt-3 text-xs text-muted-foreground">
          {t("renewalPriority")}: {score >= 75 ? t("excellent") : score >= 60 ? t("good") : t("needsImprovement")}
        </p>
      </div>

      {/* Category Breakdown */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          {t("categoryBreakdown")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const pct =
              cat.max_score > 0 ? (cat.score / cat.max_score) * 100 : 0;
            const progressColor = getScoreProgressColor(pct);

            return (
              <div
                key={cat.category_id}
                className="rounded-lg border bg-card p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {cat.name}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading text-xl font-bold">
                    {Math.round(cat.score)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{cat.max_score}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {cat.entries} {t("points")} ({cat.weight}%)
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Score History */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading text-lg font-semibold">{t("history")}</h2>
        </div>

        {historyLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <History className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("noHistory")}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {(displayHistory ?? []).map((entry) => {
                const { text, color } = formatScoreChange(entry.points);
                const date = new Date(entry.created_at);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const category = (entry as any).score_categories;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        entry.points >= 0
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {entry.points >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {entry.description_th || entry.reason || category?.name_th || category?.name || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                        {" · "}
                        {category?.name_th || category?.name || ""}
                      </p>
                    </div>
                    <span
                      className={`font-heading text-sm font-bold ${color}`}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
            {(history?.length ?? 0) > 10 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full text-center text-sm font-medium text-primary hover:underline"
              >
                {t("loadMore")}
              </button>
            )}
          </>
        )}
      </section>
      </div>
    </>
  );
}
