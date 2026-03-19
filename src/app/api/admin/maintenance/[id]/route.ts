import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateTicketSchema } from "@/lib/validators/admin-maintenance";
import { notifyMaintenanceUpdate } from "@/lib/notifications/triggers";
import { pushFlexMessage } from "@/lib/line/client";
import { buildRepairNotificationFlex } from "@/lib/line/flex-builders/repair-notification";
import type { MaintenanceStatus } from "@/lib/supabase/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "head"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  // Set timestamps based on status transitions
  if (parsed.data.status === "acknowledged") {
    updates.accepted_at = new Date().toISOString();
  }
  if (
    parsed.data.status === "completed" ||
    parsed.data.status === "cancelled"
  ) {
    updates.resolved_at = new Date().toISOString();
  }

  // Fetch current ticket to check if status actually changed
  const { data: currentTicket } = await supabase
    .from("maintenance_requests")
    .select("status, requester_id, title, category, technician_id")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("maintenance_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send notifications if status changed
  const newStatus = parsed.data.status;
  if (newStatus && currentTicket && newStatus !== currentTicket.status) {
    const STATUS_LABELS: Record<string, string> = {
      acknowledged: "รับเรื่องแล้ว",
      in_progress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
    };

    // Use admin client for lookups — the server client's cookie context
    // becomes invalid after the response is sent
    const adminDb = createAdminClient();

    try {
      // Lookup requester LINE UID + technician name in parallel
      const [requesterResult, techResult] = await Promise.all([
        adminDb
          .from("profiles")
          .select("line_uid")
          .eq("id", currentTicket.requester_id)
          .single(),
        currentTicket.technician_id
          ? adminDb
              .from("technicians")
              .select("display_name")
              .eq("id", currentTicket.technician_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      const lineUid = requesterResult.data?.line_uid ?? null;
      const technicianName = techResult.data?.display_name ?? undefined;

      // 1) In-app notification
      await notifyMaintenanceUpdate({
        requesterId: currentTicket.requester_id,
        lineUid: null, // Skip LINE text push — we send Flex below instead
        ticketId: id,
        ticketTitle: currentTicket.title,
        newStatus,
      });

      // 2) LINE Flex message (richer than plain text)
      if (lineUid) {
        const flex = buildRepairNotificationFlex({
          ticketTitle: currentTicket.title,
          category: currentTicket.category,
          status: newStatus as MaintenanceStatus,
          statusLabel: STATUS_LABELS[newStatus] ?? newStatus,
          technicianName,
          adminNotes: parsed.data.admin_notes ?? undefined,
          failureReason: parsed.data.failure_reason ?? undefined,
        });
        await pushFlexMessage(lineUid, flex);
      }
    } catch (err) {
      console.error("[Auto-notify] Failed to send maintenance notification:", err);
    }
  }

  return NextResponse.json(data);
}
