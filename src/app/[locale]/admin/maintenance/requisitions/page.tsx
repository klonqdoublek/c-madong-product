import { createAdminClient } from "@/lib/supabase/admin";
import { setRequestLocale } from "next-intl/server";
import { AllRequisitionsView } from "@/components/admin/maintenance/all-requisitions-view";

export default async function AllRequisitionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = createAdminClient();

  const { data: requisitions } = await (supabase as any)
    .from("repair_requisitions")
    .select(`
      id, version, created_at,
      ticket_code, title, category,
      requester_name, technician_name,
      materials_snapshot,
      ticket_id,
      creator:profiles!created_by(full_name_th, display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AllRequisitionsView
      requisitions={(requisitions ?? []) as any[]}
      locale={locale}
    />
  );
}
