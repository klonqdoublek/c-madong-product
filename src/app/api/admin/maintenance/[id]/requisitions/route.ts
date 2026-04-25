import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from("repair_requisitions")
    .select("id, version, created_at, materials_snapshot, requester_name, technician_name, created_by")
    .eq("ticket_id", id)
    .order("version", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Fetch ticket with full requester info
  const { data: ticket } = await admin
    .from("maintenance_requests")
    .select(`
      id, ticket_code, title, category,
      created_at, appointment_date, appointment_time,
      materials,
      requester:profiles!requester_id(full_name_th, full_name_en, room_id, building_id),
      technician:technicians!technician_id(display_name)
    `)
    .eq("id", id)
    .single();

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const req2 = ticket.requester as any;
  const tech = ticket.technician as any;

  // Resolve building + room
  let buildingName: string | null = null;
  let roomNumber: string | null = null;

  if (req2?.building_id) {
    const { data: b } = await admin.from("buildings").select("name_th").eq("id", req2.building_id).single();
    buildingName = b?.name_th ?? null;
  }
  if (req2?.room_id) {
    const { data: r } = await admin.from("rooms").select("room_number").eq("id", req2.room_id).single();
    roomNumber = r?.room_number ?? null;
  }

  // Get next version number
  const { data: existing } = await (admin as any)
    .from("repair_requisitions")
    .select("version")
    .eq("ticket_id", id)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version ?? 0) + 1;

  const { data: requisition, error } = await (admin as any)
    .from("repair_requisitions")
    .insert({
      ticket_id: id,
      version: nextVersion,
      ticket_code: ticket.ticket_code,
      title: ticket.title,
      category: ticket.category,
      requester_name: req2?.full_name_th ?? req2?.full_name_en ?? "ผู้แจ้ง",
      building_name: buildingName,
      room_number: roomNumber,
      technician_name: tech?.display_name ?? null,
      appointment_date: ticket.appointment_date,
      appointment_time: ticket.appointment_time,
      materials_snapshot: ticket.materials ?? [],
      created_by: user.id,
    })
    .select("id, version")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(requisition);
}
