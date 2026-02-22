import { setRequestLocale } from "next-intl/server";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Request #{id}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Maintenance request detail — Coming in Phase 3
      </div>
    </div>
  );
}
