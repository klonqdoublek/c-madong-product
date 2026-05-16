import { setRequestLocale } from "next-intl/server";
import { StudentTicketStatusContent } from "@/components/maintenance/student-ticket-status-content";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <MaintenanceDetailContent id={id} />;
}

function MaintenanceDetailContent({ id }: { id: string }) {
  return <StudentTicketStatusContent ticketId={id} />;
}
