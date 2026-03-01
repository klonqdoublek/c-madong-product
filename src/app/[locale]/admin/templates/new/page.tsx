import { setRequestLocale } from "next-intl/server";
import { NewTemplatePageContent } from "@/components/admin/templates/new-template-page-content";

export default async function NewTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewTemplatePageContent />;
}
