import { setRequestLocale } from "next-intl/server";
import { DormCalendarContent } from "@/components/student/dorm-calendar/dorm-calendar-content";

export default async function DormCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DormCalendarContent />;
}
