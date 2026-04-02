import { setRequestLocale } from "next-intl/server";
import { AnnouncementDetailContent } from "@/components/student/announcements/announcement-detail-content";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <AnnouncementDetailContent announcementId={id} />;
}
