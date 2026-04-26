import { setRequestLocale } from "next-intl/server";
import { BedSelectionContent } from "@/components/student/bed-selection/bed-selection-content";

export default async function BedSelectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BedSelectionContent />;
}
