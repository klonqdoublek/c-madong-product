import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileContent />;
}

function ProfileContent() {
  const t = useTranslations("profile");

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Profile with digital dorm card — Coming in Phase 2
      </div>
    </div>
  );
}
