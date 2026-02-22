import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegisterContent />;
}

function RegisterContent() {
  const t = useTranslations("auth");

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t("register")}</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-center text-muted-foreground">
          Registration form coming in Phase 1
        </p>
      </div>
    </div>
  );
}
