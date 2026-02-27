import { setRequestLocale } from "next-intl/server";
import { BookingPageContent } from "@/components/booking/booking-page-content";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; ticketId: string }>;
}) {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);

  return <BookingPageContent ticketId={ticketId} />;
}
