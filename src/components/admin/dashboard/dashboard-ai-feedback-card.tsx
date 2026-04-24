"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  BrainCircuit,
  MessageSquareMore,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIFeedbackStats } from "@/hooks/use-knowledge";
import { cn } from "@/lib/utils/cn";

const FIELD_LABELS: Record<string, string> = {
  filename: "ชื่อไฟล์",
  folder: "โฟลเดอร์",
  tags: "แท็ก",
};

export function DashboardAIFeedbackCard() {
  const t = useTranslations("admin.dashboardPage");
  const { data, isLoading } = useAIFeedbackStats();

  const fieldEntries = data
    ? Object.entries(data.fieldCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            {t("aiFeedback.title")}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {t("aiFeedback.windowLabel", { days: data?.windowDays ?? 30 })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : !data || data.total === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("aiFeedback.empty")}
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label={t("aiFeedback.totalLabel")}
                value={data.total.toLocaleString()}
              />
              <Stat
                label={t("aiFeedback.upLabel")}
                value={`${data.upPct}%`}
                icon={
                  <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                }
              />
              <Stat
                label={t("aiFeedback.downLabel")}
                value={data.downs.toString()}
                icon={
                  <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                }
              />
            </div>

            {/* Satisfaction bar */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t("aiFeedback.satisfactionLabel")}
                </span>
                <span className="font-medium">
                  {data.ups} / {data.total}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${data.upPct}%` }}
                />
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: `${100 - data.upPct}%` }}
                />
              </div>
            </div>

            {/* Top accepted fields */}
            {fieldEntries.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {t("aiFeedback.acceptedFieldsTitle")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fieldEntries.map(([field, count]) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {FIELD_LABELS[field] ?? field}
                      <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-medium">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent comments */}
            {data.recentComments.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <MessageSquareMore className="h-3.5 w-3.5" />
                  {t("aiFeedback.recentCommentsTitle")}
                </p>
                <ul className="space-y-2">
                  {data.recentComments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border bg-card p-2.5"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        {c.rating === "up" ? (
                          <ThumbsUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className="truncate text-[11px] font-medium">
                          {c.documentTitle || t("aiFeedback.unknownDoc")}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {c.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/admin/knowledge-base"
              className="block text-center text-xs text-primary hover:underline"
            >
              {t("aiFeedback.viewAll")}
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg bg-muted/40 p-2.5")}>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-0.5 font-heading text-lg font-bold">{value}</p>
    </div>
  );
}
