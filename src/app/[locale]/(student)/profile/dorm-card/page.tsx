import { setRequestLocale } from "next-intl/server";
import { DormCardContent } from "@/components/student/profile/dorm-card-content";

export default async function DormCardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DormCardContent />;
}
