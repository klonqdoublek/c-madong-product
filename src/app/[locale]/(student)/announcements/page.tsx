import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";

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
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Announcements list — Coming in Phase 4
        </div>
      </div>
    </>
  );
}
