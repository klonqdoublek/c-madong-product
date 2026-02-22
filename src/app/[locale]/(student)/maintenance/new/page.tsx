import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function NewMaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewMaintenanceContent />;
}

function NewMaintenanceContent() {
  const t = useTranslations("maintenance");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{t("newRequest")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Maintenance request form — Coming in Phase 3
      </div>
    </div>
  );
}
