import { setRequestLocale } from "next-intl/server";
import { ScorePageContent } from "@/components/student/score/score-page-content";

export default async function ScorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ScorePageContent />;
}
