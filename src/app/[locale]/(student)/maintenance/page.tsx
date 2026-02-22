import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MaintenanceContent />;
}

function MaintenanceContent() {
  const t = useTranslations("maintenance");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/maintenance/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          + {t("newRequest")}
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {t("myRequests")} — Coming in Phase 3
      </div>
    </div>
  );
}
