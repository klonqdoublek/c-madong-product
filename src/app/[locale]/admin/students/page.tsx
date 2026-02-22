import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AdminStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Content />;
}

function Content() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("students")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Student management table — Coming in Phase 5
      </div>
    </div>
  );
}
