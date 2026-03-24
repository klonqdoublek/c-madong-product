import { setRequestLocale } from "next-intl/server";
import { AnnouncementOrganizer } from "./components/announcement-organizer";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AnnouncementOrganizePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnnouncementOrganizer />;
}
