import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pushFlexMessage } from "@/lib/line/client";
import { buildRepairNotificationFlex } from "@/lib/line/flex-builders/repair-notification";
import type { MaintenanceStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: "รอดำเนินการ",
  acknowledged: "รับเรื่องแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId } = await request.json();

  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId is required" },
      { status: 400 }
    );
  }

  // Fetch ticket
  const { data: ticket, error } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Fetch requester LINE UID
  const { data: requester } = await supabase
    .from("profiles")
    .select("line_uid")
    .eq("id", ticket.requester_id)
    .single();

  if (!requester?.line_uid) {
    return NextResponse.json(
      { error: "Requester has no LINE UID" },
      { status: 400 }
    );
  }

  // Fetch technician name if assigned
  let technicianName: string | undefined;
  if (ticket.technician_id) {
    const { data: tech } = await supabase
      .from("technicians")
      .select("display_name")
      .eq("id", ticket.technician_id)
      .single();
    technicianName = tech?.display_name;
  }

  const flex = buildRepairNotificationFlex({
    ticketTitle: ticket.title,
    category: ticket.category,
    status: ticket.status as MaintenanceStatus,
    statusLabel: STATUS_LABELS[ticket.status as MaintenanceStatus] ?? ticket.status,
    technicianName,
    adminNotes: ticket.admin_notes ?? undefined,
    failureReason: ticket.failure_reason ?? undefined,
  });

  try {
    await pushFlexMessage(requester.line_uid, flex);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json(
      { error: "Failed to send LINE notification" },
      { status: 500 }
    );
  }
}
