import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">{t("dashboard")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("totalStudents"), value: "--" },
          { label: t("openTickets"), value: "--" },
          { label: t("pendingBills"), value: "--" },
          { label: t("parcels"), value: "--" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-l-4 border-l-primary bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Admin overview charts — Coming in Phase 5
      </div>
    </div>
  );
}
