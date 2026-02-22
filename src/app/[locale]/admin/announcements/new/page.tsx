import { setRequestLocale } from "next-intl/server";

export default async function AdminNewAnnouncementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Announcement</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Announcement editor — Coming in Phase 4
      </div>
    </div>
  );
}
