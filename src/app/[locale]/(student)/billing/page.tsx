import { setRequestLocale } from "next-intl/server";
import { BillingPageContent } from "@/components/student/billing/billing-page-content";

export default async function StudentBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BillingPageContent />;
}
