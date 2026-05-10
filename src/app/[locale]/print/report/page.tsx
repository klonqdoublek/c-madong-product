import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ReportPrintContent } from "@/components/admin/reports/report-print-content";

export default async function ReportPrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">กำลังโหลด...</div>}>
      <ReportPrintContent />
    </Suspense>
  );
}
