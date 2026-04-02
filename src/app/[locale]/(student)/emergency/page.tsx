import { setRequestLocale } from "next-intl/server";
import { EmergencyContent } from "@/components/student/emergency/emergency-content";

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EmergencyContent />;
}
