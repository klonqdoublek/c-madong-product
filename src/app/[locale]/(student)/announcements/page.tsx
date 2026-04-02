import { setRequestLocale } from "next-intl/server";
import { AnnouncementsPageContent } from "@/components/student/announcements/announcements-page-content";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnnouncementsPageContent />;
}
