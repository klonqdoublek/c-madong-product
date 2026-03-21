import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { NewRequestForm } from "@/components/maintenance/new-request-form";
import { PageHeader } from "@/components/layout/page-header";

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
    <>
      <PageHeader title={t("newRequest")} backHref="/maintenance" />
      <div className="p-4">
        <NewRequestForm />
      </div>
    </>
  );
}
