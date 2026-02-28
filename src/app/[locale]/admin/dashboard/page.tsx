import { setRequestLocale } from "next-intl/server";
import { DashboardPageContent } from "@/components/admin/dashboard/dashboard-page-content";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardPageContent />;
}
