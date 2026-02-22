import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Content />;
}

function Content() {
  const t = useTranslations("nav");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Admin settings — Coming in Phase 7+
      </div>
    </div>
  );
}
