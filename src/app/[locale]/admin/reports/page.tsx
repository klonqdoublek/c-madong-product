import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ReportsPageContent } from "@/components/admin/reports/reports-page-content";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ReportsPageContent />
    </Suspense>
  );
}
