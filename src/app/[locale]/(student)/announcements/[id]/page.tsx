import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader title="Announcement" backHref="/announcements" />
      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Announcement detail — Coming in Phase 4
        </div>
      </div>
    </>
  );
}
