import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { RequisitionDocument } from "@/components/admin/maintenance/requisition-document";

export default async function RequisitionPrintPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Try loading from versioned requisition snapshot first
  const { data: req } = await (supabase as any)
    .from("repair_requisitions")
    .select("*")
    .eq("id", id)
    .single();

  if (req) {
    return (
      <RequisitionDocument
        ticketCode={req.ticket_code ?? id.slice(0, 8).toUpperCase()}
        title={req.title ?? ""}
        category={req.category ?? "other"}
        createdAt={req.created_at}
        appointmentDate={req.appointment_date ?? undefined}
        appointmentTime={req.appointment_time ?? undefined}
        requesterName={req.requester_name ?? "ผู้แจ้ง"}
        buildingName={req.building_name ?? undefined}
        roomNumber={req.room_number ?? undefined}
        technicianName={req.technician_name ?? undefined}
        materials={req.materials_snapshot ?? []}
        version={req.version}
      />
    );
  }

  // Fallback: load directly from ticket (backward compat for old links)
  const { data: ticket } = await supabase
    .from("maintenance_requests")
    .select(`
      id, ticket_code, title, category,
      created_at, appointment_date, appointment_time, materials,
      requester:profiles!requester_id(full_name_th, full_name_en, room_id, building_id),
      technician:technicians!technician_id(display_name)
    `)
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  let buildingName: string | null = null;
  let roomNumber: string | null = null;
  const requester = ticket.requester as any;

  if (requester?.building_id) {
    const { data: b } = await supabase.from("buildings").select("name_th").eq("id", requester.building_id).single();
    buildingName = b?.name_th ?? null;
  }
  if (requester?.room_id) {
    const { data: r } = await supabase.from("rooms").select("room_number").eq("id", requester.room_id).single();
    roomNumber = r?.room_number ?? null;
  }

  const tech = ticket.technician as any;

  return (
    <RequisitionDocument
      ticketCode={ticket.ticket_code ?? ticket.id.slice(0, 8).toUpperCase()}
      title={ticket.title}
      category={ticket.category}
      createdAt={ticket.created_at}
      appointmentDate={ticket.appointment_date ?? undefined}
      appointmentTime={ticket.appointment_time ?? undefined}
      requesterName={requester?.full_name_th ?? requester?.full_name_en ?? "ผู้แจ้ง"}
      buildingName={buildingName ?? undefined}
      roomNumber={roomNumber ?? undefined}
      technicianName={tech?.display_name ?? undefined}
      materials={(ticket.materials as any[]) ?? []}
    />
  );
}
