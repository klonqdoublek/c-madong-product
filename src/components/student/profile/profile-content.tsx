"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileInfoCard } from "./profile-info-card";
import { ProfileStatsSection } from "./profile-stats-section";
import { ProfileScoreSection } from "./profile-score-section";
import { ProfileSavedSection } from "./profile-saved-section";
import { SettingsMenuItem } from "./settings-menu-item";
import { Settings, FileText } from "lucide-react";

export function ProfileContent() {
  const t = useTranslations("profile");
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <>
        <PageHeader title={t("title")} />
        <div className="space-y-4 p-4">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("title")} />

      <div className="space-y-4 pb-28">
        {/* User info card */}
        <ProfileInfoCard />

        <div className="space-y-4 px-4">
          {/* Re-application status mockup */}
          <div className="rounded-xl bg-white p-4 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cu-light-pink">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#565655]">
                  {t("reapplyStatus")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("reapplyDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <ProfileStatsSection />

          {/* Score summary */}
          <ProfileScoreSection />

          {/* Saved announcements */}
          <ProfileSavedSection />

          {/* Settings link */}
          <SettingsMenuItem
            icon={Settings}
            label={t("settingsLink")}
            href="/profile/settings"
          />
        </div>
      </div>
    </div>
  );
}
