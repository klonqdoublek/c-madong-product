import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { RequisitionsHistory } from "@/components/admin/maintenance/requisitions-history";

export default async function RequisitionsHistoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const supabase = createAdminClient();

  const { data: ticket } = await supabase
    .from("maintenance_requests")
    .select("id, ticket_code, title")
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const { data: requisitions } = await (supabase as any)
    .from("repair_requisitions")
    .select(`
      id, version, created_at,
      requester_name, technician_name,
      materials_snapshot,
      creator:profiles!created_by(full_name_th, display_name)
    `)
    .eq("ticket_id", id)
    .order("version", { ascending: false });

  return (
    <RequisitionsHistory
      ticketId={id}
      ticketCode={ticket.ticket_code}
      ticketTitle={ticket.title}
      requisitions={(requisitions ?? []) as any[]}
      locale={locale}
    />
  );
}
