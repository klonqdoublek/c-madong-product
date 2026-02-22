import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NotificationsContent />;
}

function NotificationsContent() {
  const t = useTranslations("nav");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{t("notifications")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Notification center — Coming in Phase 4
      </div>
    </div>
  );
}
