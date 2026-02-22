import { setRequestLocale } from "next-intl/server";

export default async function AdminMaintenanceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ticket #{id}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Admin ticket management — Coming in Phase 3
      </div>
    </div>
  );
}
