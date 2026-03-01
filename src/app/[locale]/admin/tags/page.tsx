import { setRequestLocale } from "next-intl/server";
import { TagsPageContent } from "@/components/admin/tags/tags-page-content";

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TagsPageContent />;
}
