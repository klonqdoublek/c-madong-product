import { setRequestLocale } from "next-intl/server";
import { ConfirmContent } from "@/components/student/bed-selection/confirm-content";

export default async function BedSelectionConfirmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ConfirmContent />;
}
