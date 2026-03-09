import { setRequestLocale } from "next-intl/server";
import { CreateBillForm } from "@/components/admin/billing/create-bill-form";

export default async function CreateBillPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CreateBillForm />;
}
