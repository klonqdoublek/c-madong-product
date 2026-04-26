import { setRequestLocale } from "next-intl/server";
import { AdminDormCalendarContent } from "@/components/admin/dorm-calendar/dorm-calendar-page-content";

export default async function AdminDormCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminDormCalendarContent />;
}
