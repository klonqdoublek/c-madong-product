import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { MyRequestsList } from "@/components/maintenance/my-requests-list";
import { PageHeader } from "@/components/layout/page-header";

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
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-end">
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
    </>
  );
}
