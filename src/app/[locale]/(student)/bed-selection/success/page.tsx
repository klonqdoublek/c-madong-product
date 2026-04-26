import { setRequestLocale } from "next-intl/server";
import { SuccessContent } from "@/components/student/bed-selection/success-content";

export default async function BedSelectionSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SuccessContent />;
}
