import { setRequestLocale } from "next-intl/server";
import { AdminScoresPageContent } from "@/components/admin/scores/scores-page-content";

export default async function AdminScoresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminScoresPageContent />;
}
