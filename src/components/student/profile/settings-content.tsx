"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsMenuItem } from "./settings-menu-item";
import { useUser } from "@/hooks/use-user";
import {
  User,
  CreditCard,
  Shield,
  Languages,
  MessageCircleQuestion,
  Phone,
  Bell,
  Sparkles,
} from "lucide-react";

export function SettingsContent() {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const queryClient = useQueryClient();

  const [dataAccess, setDataAccess] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [personalization, setPersonalization] = useState(false);

  // Sync pushNotif with DB value once profile loads
  useEffect(() => {
    if (profile && typeof (profile as Record<string, unknown>).push_enabled === "boolean") {
      setPushNotif((profile as Record<string, unknown>).push_enabled as boolean);
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePushNotifToggle(value: boolean) {
    setPushNotif(value);
    try {
      await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ push_enabled: value }),
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      // Revert on failure
      setPushNotif(!value);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("settingsTitle")} backHref="/profile" />

      <div className="space-y-6 px-4 pb-28 pt-2">
        {/* General */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("settingsGeneral")}
          </h3>
          <div className="space-y-2">
            <SettingsMenuItem
              icon={User}
              label={t("settingsAccount")}
              href="/profile"
            />
            <SettingsMenuItem
              icon={CreditCard}
              label={t("settingsPayment")}
              href="/billing"
            />
            <SettingsMenuItem
              icon={Shield}
              label={t("settingsSecurity")}
            />
            <SettingsMenuItem
              icon={Languages}
              label={t("settingsLanguage")}
            />
          </div>
        </section>

        {/* Support */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("settingsSupport")}
          </h3>
          <div className="space-y-2">
            <SettingsMenuItem
              icon={MessageCircleQuestion}
              label={t("settingsFAQ")}
            />
            <SettingsMenuItem
              icon={Phone}
              label={t("settingsContact")}
            />
          </div>
        </section>

        {/* Permissions */}
        <section className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("settingsPermissions")}
          </h3>
          <div className="space-y-2">
            <SettingsMenuItem
              icon={User}
              label={t("permDataAccess")}
              trailing="toggle"
              toggled={dataAccess}
              onToggle={setDataAccess}
            />
            <SettingsMenuItem
              icon={Bell}
              label={t("permPushNotif")}
              trailing="toggle"
              toggled={pushNotif}
              onToggle={handlePushNotifToggle}
            />
            <SettingsMenuItem
              icon={Sparkles}
              label={t("permPersonalization")}
              trailing="toggle"
              toggled={personalization}
              onToggle={setPersonalization}
            />
          </div>
        </section>

        <p className="text-center text-[10px] text-muted-foreground">
          C-Madong v1.0.0
        </p>
      </div>
    </div>
  );
}
