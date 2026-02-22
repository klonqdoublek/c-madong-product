import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardContent />;
}

function DashboardContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">{t("greeting")} 👋</h1>
        <p className="text-muted-foreground">{t("title")}</p>
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("quickActions")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "แจ้งซ่อม", color: "bg-blue-50 text-blue-700" },
            { label: "ประกาศ", color: "bg-green-50 text-green-700" },
            { label: "ค่าน้ำค่าไฟ", color: "bg-orange-50 text-orange-700" },
            { label: "พัสดุ", color: "bg-purple-50 text-purple-700" },
          ].map((action) => (
            <div
              key={action.label}
              className={`rounded-lg border p-4 text-center font-medium ${action.color}`}
            >
              {action.label}
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder widget cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("residenceCounter")}</h2>
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-4xl font-bold text-primary">--</p>
          <p className="text-sm text-muted-foreground">{t("residenceCounter")}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("recentActivity")}</h2>
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          Coming in Phase 2
        </div>
      </section>
    </div>
  );
}
