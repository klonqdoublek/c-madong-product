import { setRequestLocale } from "next-intl/server";
import { KnowledgePageContent } from "@/components/admin/knowledge/knowledge-page-content";

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <KnowledgePageContent />;
}
