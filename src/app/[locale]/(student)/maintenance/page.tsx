import { setRequestLocale } from "next-intl/server";
import { StudentMaintenancePageContent } from "@/components/maintenance/student-maintenance-page-content";

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
  return <StudentMaintenancePageContent />;
}
