import { setRequestLocale } from "next-intl/server";
import { AttendancePageContent } from "@/components/admin/events/attendance-page-content";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <AttendancePageContent eventId={id} />;
}
