import { setRequestLocale } from "next-intl/server";
import { AnnouncementsPageContent } from "@/components/admin/announcements/announcements-page-content";

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnnouncementsPageContent />;
}
