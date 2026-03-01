import { setRequestLocale } from "next-intl/server";
import { RolesPageContent } from "./roles-page-content";

export default async function AdminRolesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RolesPageContent />;
}
