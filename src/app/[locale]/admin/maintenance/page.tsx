import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { MaintenancePageContent } from "@/components/admin/maintenance/maintenance-page-content";

export default async function AdminMaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <MaintenancePageContent />
    </Suspense>
  );
}
