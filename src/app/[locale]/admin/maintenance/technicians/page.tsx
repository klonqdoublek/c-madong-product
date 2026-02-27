import { setRequestLocale } from "next-intl/server";
import { TechniciansPageContent } from "@/components/admin/maintenance/technicians-page-content";

export default async function TechniciansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TechniciansPageContent />;
}
