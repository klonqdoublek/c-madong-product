import { setRequestLocale } from "next-intl/server";
import { EventsPageContent } from "@/components/student/events/events-page-content";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EventsPageContent />;
}
