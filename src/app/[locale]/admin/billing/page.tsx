import { setRequestLocale } from "next-intl/server";
import { BillingPageContent } from "@/components/admin/billing/billing-page-content";

export default async function AdminBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BillingPageContent />;
}
