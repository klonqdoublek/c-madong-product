import { setRequestLocale } from "next-intl/server";
import { TemplatesPageContent } from "@/components/admin/templates/templates-page-content";

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TemplatesPageContent />;
}
