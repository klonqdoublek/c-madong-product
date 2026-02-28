import { setRequestLocale } from "next-intl/server";
import { BroadcastPageContent } from "@/components/admin/broadcast/broadcast-page-content";

export default async function BroadcastPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BroadcastPageContent />;
}
