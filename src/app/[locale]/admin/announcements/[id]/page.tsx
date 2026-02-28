import { setRequestLocale } from "next-intl/server";
import { NewAnnouncementPageContent } from "@/components/admin/announcements/new-announcement-page-content";

export default async function AdminAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <NewAnnouncementPageContent announcementId={id} />;
}
