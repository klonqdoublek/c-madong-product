"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMyScore, useMyScoreHistory } from "@/hooks/use-score";
import {
  Trophy,
  History,
  Bell,
  X,
  Sunrise,
  Flag,
  ShieldCheck,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

const BAR_COLORS = ["#D4AF37", "#C9A96E", "#A8C5A0"];

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return Star;
  const lower = categoryName.toLowerCase();
  if (lower.includes("พัก") || lower.includes("residence")) return Sunrise;
  if (lower.includes("กิจกรรม") || lower.includes("activity")) return Flag;
  if (lower.includes("ประพฤติ") || lower.includes("conduct")) return ShieldCheck;
  return Star;
};

export function ScorePageContent() {
  const t = useTranslations("score");
  const { data: scoreData, isLoading: scoreLoading } = useMyScore();
  const { data: history, isLoading: historyLoading } = useMyScoreHistory();
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false);

  if (scoreLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-40 animate-pulse rounded-lg bg-muted flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const score = scoreData?.composite_score ?? 0;
  const categories = scoreData?.categories ?? [];
  const displayHistory = showAllHistory ? history : (history ?? []).slice(0, 10);
  const passedThreshold = score >= 60;

  const totalScore = categories.reduce((s, c) => s + c.max_score, 0) || 100;

  return (
    <>
      <PageHeader
        title={t("title")}
        right={
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-muted-foreground/20">
            <span className="text-sm font-semibold text-muted-foreground">ⓘ</span>
          </button>
        }
      />
      <div className="space-y-4 bg-cu-warm-cream p-4 pb-24">

        {/* Hero Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-cu-score-green p-5 text-white">
          {/* Top row: Trophy + Title + Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Trophy className="h-6 w-6 flex-shrink-0" />
              <span className="font-heading font-semibold">{t("categoryBreakdown")}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white">
              <span className="text-xs">●</span>
              <span className="text-xs font-medium">
                {passedThreshold ? t("passThreshold") : t("failThreshold")}
              </span>
            </div>
          </div>

          {/* Score Display */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-7xl font-bold">{Math.round(score)}</span>
            <span className="text-sm opacity-70">/100 {t("unit")}</span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/20">
            {categories.map((cat, idx) => {
              const width = (cat.score / totalScore) * 100;
              return (
                <div
                  key={cat.category_id}
                  className="transition-all"
                  style={{
                    width: `${Math.min(width, 100)}%`,
                    backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                  }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {categories.map((cat, idx) => (
              <div key={cat.category_id} className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                />
                <span className="opacity-80">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Mascot decoration (bottom right) */}
          <div className="absolute -bottom-4 -right-4 h-36 w-36 opacity-40">
            <Image
              src="/images/mascot.svg"
              alt=""
              fill
              className="object-cover"
              priority={false}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="px-1 text-xs italic text-muted-foreground">{t("disclaimer")}</p>

        {/* Promo Banner */}
        {!promoBannerDismissed && (
          <div className="relative flex gap-3 rounded-xl border border-dashed border-primary bg-[#FFFCE8] p-4">
            {/* Bell Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-cu-grey">{t("promoBannerTitle")}</p>
              <p className="text-xs text-primary">{t("promoBannerSubtitle")}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setPromoBannerDismissed(true)}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Mascot decoration (bottom right) */}
            <div className="absolute -bottom-2 -right-2 h-24 w-24 opacity-30 pointer-events-none">
              <Image
                src="/images/mascot.svg"
                alt=""
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">{t("categoryBreakdown")}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.name);
              return (
                <div
                  key={cat.category_id}
                  className="flex flex-shrink-0 flex-col gap-2 rounded-xl border bg-white p-3 min-w-[140px]"
                >
                  {/* Header with icon, name, menu */}
                  <div className="flex items-start gap-2">
                    <IconComponent className="h-4 w-4 flex-shrink-0 text-cu-grey" />
                    <span className="flex-1 text-xs font-medium text-muted-foreground">{cat.name}</span>
                    <button className="flex-shrink-0 rounded p-1 hover:bg-muted">
                      <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Score */}
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {Math.round(cat.score)}
                    </span>
                    <span className="text-xs text-muted-foreground">/{cat.max_score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Score History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-heading text-lg font-semibold">{t("history")}</h2>
            </div>
            {(history?.length ?? 0) > 10 && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAllHistory ? t("loadMore") : t("viewAll")}
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : !history || history.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-center">
              <History className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t("noHistory")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(displayHistory ?? []).map((entry, idx) => {
                const date = new Date(entry.created_at);
                const category = (entry as any).score_categories;
                const isPositive = entry.points >= 0;
                const items = displayHistory ?? [];

                return (
                  <div key={entry.id} className={idx !== items.length - 1 ? "border-b pb-3" : ""}>
                    <div className="flex items-center gap-3">
                      {/* Score badge */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cu-task-green/10">
                        <span className="font-heading text-sm font-bold text-cu-task-green">
                          {isPositive ? "+" : ""}{entry.points}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {entry.description_th || entry.reason || category?.name_th || category?.name || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("enteredAt")} {date.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })} {date.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
