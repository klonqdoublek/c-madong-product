import { setRequestLocale } from "next-intl/server";
import { EventDetailContent } from "@/components/student/events/event-detail-content";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <EventDetailContent eventId={id} />;
}
