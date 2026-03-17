import { setRequestLocale } from "next-intl/server";
import { ParcelsPageContent } from "@/components/student/parcels-page-content";

export default async function ParcelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ParcelsPageContent />;
}
