import { setRequestLocale } from "next-intl/server";
import { SettingsPageContent } from "@/components/admin/settings/settings-page-content";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SettingsPageContent />;
}
