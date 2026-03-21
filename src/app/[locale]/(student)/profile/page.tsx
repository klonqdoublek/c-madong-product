import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LogoutButton } from "@/components/student/logout-button";

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
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Profile with digital dorm card — Coming in Phase 2
        </div>

        <LogoutButton />
      </div>
    </>
  );
}
