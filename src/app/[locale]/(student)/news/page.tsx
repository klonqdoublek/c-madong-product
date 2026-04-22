import { setRequestLocale } from "next-intl/server";
import { NewsPageContent } from "@/components/student/news/news-page-content";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewsPageContent />;
}
