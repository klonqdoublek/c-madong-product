"use client";

import { useLocale, useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("auth");
  const locale = useLocale();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      window.location.replace(`/${locale}/login`);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg border border-destructive/20 bg-destructive/5 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
    >
      {t("logout")}
    </button>
  );
}
