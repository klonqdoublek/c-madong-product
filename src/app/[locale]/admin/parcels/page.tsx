import { setRequestLocale } from "next-intl/server";
import { ParcelsPageContent } from "@/components/admin/parcels/parcels-page-content";

export default async function AdminParcelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ParcelsPageContent />;
}
