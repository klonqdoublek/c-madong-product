import { setRequestLocale } from "next-intl/server";

export default async function BroadcastPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Broadcast</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Broadcast management — Coming in Phase 8
      </div>
    </div>
  );
}
