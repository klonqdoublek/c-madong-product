import { setRequestLocale } from "next-intl/server";
import { NewAnnouncementPageContent } from "@/components/admin/announcements/new-announcement-page-content";

export default async function AdminNewAnnouncementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewAnnouncementPageContent />;
}
