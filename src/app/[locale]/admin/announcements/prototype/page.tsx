import { setRequestLocale } from "next-intl/server";
import { AnnouncementPrototype } from "./components/announcement-prototype";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AnnouncementPrototypePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnnouncementPrototype />;
}
