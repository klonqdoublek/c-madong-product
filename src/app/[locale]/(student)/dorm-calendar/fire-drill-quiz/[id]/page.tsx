import { setRequestLocale } from "next-intl/server";
import { FireDrillQuizContent } from "@/components/student/dorm-calendar/fire-drill-quiz-mock";

export default async function FireDrillQuizPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <FireDrillQuizContent itemId={id} />;
}
