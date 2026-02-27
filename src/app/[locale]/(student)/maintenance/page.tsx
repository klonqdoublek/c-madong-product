import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { MyRequestsList } from "@/components/maintenance/my-requests-list";

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
        <h1 className="text-xl font-heading font-bold">{t("title")}</h1>
        <Link
          href="/maintenance/new"
          className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} />
          {t("newRequest")}
        </Link>
      </div>
      <MyRequestsList />
    </div>
  );
}
