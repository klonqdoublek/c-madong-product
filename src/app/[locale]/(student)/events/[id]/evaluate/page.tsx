import { setRequestLocale } from "next-intl/server";
import { EvaluationPageContent } from "@/components/student/evaluation/evaluation-page-content";

export default async function EvaluatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <EvaluationPageContent eventId={id} />;
}
