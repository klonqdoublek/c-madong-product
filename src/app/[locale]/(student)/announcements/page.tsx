import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnnouncementsContent />;
}

function AnnouncementsContent() {
  const t = useTranslations("announcements");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Announcements list — Coming in Phase 4
      </div>
    </div>
  );
}
