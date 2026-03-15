"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/hooks/use-user";
import { useMyScore } from "@/hooks/use-score";
import { getScoreTier } from "@/lib/utils/score-constants";
import { User } from "lucide-react";

export function DashboardStatusCard() {
  const t = useTranslations("dashboard");
  const { profile, isLoading: profileLoading } = useUser();
  const { data: scoreData, isLoading: scoreLoading } = useMyScore();

  const compositeScore =
    (scoreData as { composite_score?: number } | null)?.composite_score ?? 0;
  const categories =
    (scoreData as { categories?: { slug: string; name_th: string; weighted_score: number; color: string }[] } | null)?.categories ?? [];

  const tier = getScoreTier(compositeScore);
  const maxScore = 200;
  const scorePercent = Math.min((compositeScore / maxScore) * 100, 100);

  // Build room display string
  const roomNumber = profile?.room_id ? String(profile.room_id).slice(-4) : "----";
  const bedLabel = profile?.bed_id ? `B` : "-";
  const buildingName = profile?.building_id ? getBuildingShortName(profile.building_id) : "---";
  const displayName = profile?.display_name || profile?.full_name_th || "---";

  return (
    <section className="px-4">
      <h2 className="mb-2.5 font-heading text-base font-bold text-foreground">
        {t("myStatus")}
      </h2>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[2px_4px_10px_0px_rgba(0,0,0,0.05)]">
        {/* Pink header bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary to-cu-pink-dark px-4 py-3">
          <div>
            <p className="text-[11px] font-medium text-white/80">
              {t("currentResident")}
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-white">
                {profileLoading ? "..." : roomNumber}
              </span>
              <span className="text-xs text-white/80">
                | {t("bed")} {bedLabel} | {buildingName}
              </span>
            </div>
          </div>
          <Link
            href="/profile"
            className="rounded-full border border-white/40 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/10"
          >
            {t("viewDormCard")}
          </Link>
        </div>

        {/* Body */}
        <div className="space-y-3 p-4">
          {/* User info row */}
          <div className="flex items-center gap-2 text-sm text-cu-grey">
            <User className="size-4 shrink-0 text-cu-muted" />
            <span className="truncate">{profileLoading ? "..." : displayName}</span>
          </div>

          {/* Score section */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-cu-muted">
                {t("dormScore")}
              </span>
              <span className={`font-heading text-lg font-bold ${tier.color}`}>
                {scoreLoading ? "..." : compositeScore}{" "}
                <span className="text-xs font-normal text-cu-muted">
                  {t("points")}
                </span>
              </span>
            </div>

            {/* Segmented progress bar */}
            <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-gray-100">
              {categories.length > 0 ? (
                categories.map((cat) => {
                  const catPercent = Math.max((cat.weighted_score / maxScore) * 100, 1);
                  return (
                    <div
                      key={cat.slug}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor: cat.color || "#DD598B",
                      }}
                    />
                  );
                })
              ) : (
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${scorePercent}%` }}
                />
              )}
            </div>

            {/* Legend */}
            {categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {categories.map((cat) => (
                  <div key={cat.slug} className="flex items-center gap-1">
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: cat.color || "#DD598B" }}
                    />
                    <span className="text-[11px] text-cu-muted">{cat.name_th}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getBuildingShortName(buildingId: string): string {
  const map: Record<string, string> = {
    chuanchom: "ชวนชม",
    pudtan: "พุดตาน",
    pudson: "พุดซ้อน",
    champa: "จำปา",
    champee: "จำปี",
  };
  return map[buildingId] || buildingId;
}
