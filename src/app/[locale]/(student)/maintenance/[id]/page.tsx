import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { TicketDetail } from "@/components/maintenance/ticket-detail";
import { PageHeader } from "@/components/layout/page-header";

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
  const t = useTranslations("maintenance");

  return (
    <>
      <PageHeader title={t("detail.title")} backHref="/maintenance" />
      <div className="p-4">
        <TicketDetail ticketId={id} />
      </div>
    </>
  );
}
