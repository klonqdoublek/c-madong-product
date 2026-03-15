"use client";

import { useTranslations } from "next-intl";
import { Flame, FileText, CreditCard } from "lucide-react";

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  urgencyLabel: string;
  deadline: string;
  title: string;
  description: string;
  cta: string;
  variant: "featured" | "default";
}

const MOCK_ACTIONS: ActionItem[] = [
  {
    id: "1",
    icon: <FileText className="size-5" />,
    urgencyLabel: "urgent",
    deadline: "2days",
    title: "uploadDocTitle",
    description: "uploadDocDesc",
    cta: "doNow",
    variant: "featured",
  },
  {
    id: "2",
    icon: <CreditCard className="size-5" />,
    urgencyLabel: "",
    deadline: "5days",
    title: "payBillTitle",
    description: "payBillDesc",
    cta: "doNow",
    variant: "default",
  },
  {
    id: "3",
    icon: <FileText className="size-5" />,
    urgencyLabel: "",
    deadline: "7days",
    title: "evaluationTitle",
    description: "evaluationDesc",
    cta: "doNow",
    variant: "default",
  },
];

export function DashboardActionCards() {
  const t = useTranslations("dashboard");

  const completedCount = 2;
  const totalCount = MOCK_ACTIONS.length + completedCount;

  return (
    <section className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="font-heading text-base font-bold text-foreground">
          {t("actionItems")}
        </h2>
        <span className="text-xs font-medium text-cu-muted">
          {t("completed", { done: completedCount, total: totalCount })}
        </span>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-hide">
        {MOCK_ACTIONS.map((item) => (
          <ActionCard key={item.id} item={item} t={t} />
        ))}
      </div>
    </section>
  );
}

function ActionCard({
  item,
  t,
}: {
  item: ActionItem;
  t: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  const isFeatured = item.variant === "featured";

  if (isFeatured) {
    return (
      <div className="relative flex w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-cu-pink-dark p-4 shadow-[2px_4px_10px_0px_rgba(0,0,0,0.05)]">
        {/* Left accent line */}
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-white/30" />

        <div className="space-y-2 pl-2">
          {/* Badges row */}
          <div className="flex items-center gap-2">
            {item.urgencyLabel && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
                <Flame className="size-3" />
                {t("urgent")}
              </span>
            )}
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
              {t(item.deadline as "2days")}
            </span>
          </div>

          {/* Title + description */}
          <div>
            <p className="font-heading text-sm font-bold text-white">
              {t(item.title as "uploadDocTitle")}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/80">
              {t(item.description as "uploadDocDesc")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button className="mt-3 w-full rounded-full bg-white py-2 text-xs font-bold text-primary transition-colors hover:bg-white/90">
          {t("doNow")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-[180px] shrink-0 snap-start flex-col justify-between rounded-xl border border-border bg-white p-3.5 shadow-[2px_4px_10px_0px_rgba(0,0,0,0.05)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-cu-muted">
            {t(item.deadline as "5days")}
          </span>
        </div>
        <div>
          <p className="font-heading text-sm font-bold text-foreground">
            {t(item.title as "payBillTitle")}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-cu-muted">
            {t(item.description as "payBillDesc")}
          </p>
        </div>
      </div>
      <button className="mt-3 w-full rounded-full border border-primary bg-white py-1.5 text-xs font-bold text-primary transition-colors hover:bg-cu-pink-tint">
        {t("doNow")}
      </button>
    </div>
  );
}
