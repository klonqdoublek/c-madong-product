import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { NewRequestForm } from "@/components/maintenance/new-request-form";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function NewMaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewMaintenanceContent />;
}

function NewMaintenanceContent() {
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
        <h1 className="text-xl font-heading font-bold">{t("newRequest")}</h1>
      </div>
      <NewRequestForm />
    </div>
  );
}
