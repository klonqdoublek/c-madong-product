import { setRequestLocale } from "next-intl/server";
import { SettingsContent } from "@/components/student/profile/settings-content";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SettingsContent />;
}
