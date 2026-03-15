import { setRequestLocale } from "next-intl/server";
import { AdminEventsPageContent } from "@/components/admin/events/events-page-content";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminEventsPageContent />;
}
