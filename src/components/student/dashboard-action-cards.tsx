"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInsights } from "@/hooks/use-insights";
import {
  Flame,
  FileText,
  CreditCard,
  Wrench,
  Calendar,
  Star,
  Sparkles,
  Lightbulb,
  Banknote,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Insight = Database["public"]["Tables"]["ai_insights"]["Row"];

const ICON_MAP: Record<string, typeof FileText> = {
  FileText,
  CreditCard,
  Wrench,
  Calendar,
  Star,
  Sparkles,
  Lightbulb,
  Banknote,
};

export function DashboardActionCards() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: insights, isLoading } = useInsights();

  if (isLoading) {
    return (
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            {t("actionItems")}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[140px] w-[180px] shrink-0 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!insights || insights.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("actionItems")}
        </h2>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function InsightCard({
  insight,
  locale,
}: {
  insight: Insight;
  locale: string;
}) {
  const t = useTranslations("dashboard");
  const isFeatured = insight.variant === "featured";
  const Icon = ICON_MAP[insight.icon_name ?? ""] ?? FileText;
  const title =
    locale === "th"
      ? insight.title_th
      : insight.title_en || insight.title_th;
  const description =
    locale === "th"
      ? insight.description_th
      : insight.description_en || insight.description_th;

  const card = isFeatured ? (
    <div className="relative flex w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-cu-pink-dark p-4 shadow-[2px_4px_10px_0px_rgba(0,0,0,0.05)]">
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-white/30" />
      <div className="space-y-2 pl-2">
        <div className="flex items-center gap-2">
          {insight.urgency_label && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
              <Flame className="size-3" />
              {insight.urgency_label}
            </span>
          )}
          {insight.deadline && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
              {insight.deadline}
            </span>
          )}
        </div>
        <div>
          <p className="font-heading text-sm font-bold text-white">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/80">
            {description}
          </p>
        </div>
      </div>
      {insight.action_url && (
        <button className="mt-3 w-full rounded-full bg-white py-2 text-xs font-bold text-primary transition-colors hover:bg-white/90">
          {t("doNow")}
        </button>
      )}
    </div>
  ) : (
    <div className="flex w-[180px] shrink-0 snap-start flex-col justify-between rounded-xl border border-border bg-white p-3.5 shadow-[2px_4px_10px_0px_rgba(0,0,0,0.05)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-cu-light-pink">
            <Icon className="size-4 text-primary" />
          </div>
          {insight.deadline && (
            <span className="text-[11px] font-medium text-cu-muted">
              {insight.deadline}
            </span>
          )}
        </div>
        <div>
          <p className="font-heading text-sm font-bold text-foreground">
            {title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-cu-muted">
            {description}
          </p>
        </div>
      </div>
      {insight.action_url && (
        <button className="mt-3 w-full rounded-full border border-primary bg-white py-1.5 text-xs font-bold text-primary transition-colors hover:bg-cu-pink-tint">
          {t("doNow")}
        </button>
      )}
    </div>
  );

  if (insight.action_url) {
    return (
      <Link href={insight.action_url} className="block shrink-0">
        {card}
      </Link>
    );
  }

  return card;
}
