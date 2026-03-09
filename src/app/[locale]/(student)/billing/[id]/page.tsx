import { setRequestLocale } from "next-intl/server";
import { BillDetailContent } from "@/components/student/billing/bill-detail-content";

export default async function StudentBillDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <BillDetailContent billId={id} />;
}
