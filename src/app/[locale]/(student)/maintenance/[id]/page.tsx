import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { TicketDetail } from "@/components/maintenance/ticket-detail";

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
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Link
          href="/maintenance"
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-heading font-bold">{t("detail.title")}</h1>
      </div>
      <TicketDetail ticketId={id} />
    </div>
  );
}
