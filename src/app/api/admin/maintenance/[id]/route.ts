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
  console.log("[Maintenance PATCH] Called for ticket:", id);

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
  console.log("[Maintenance PATCH] Notification check:", {
    id,
    newStatus,
    hasCurrentTicket: !!currentTicket,
    oldStatus: currentTicket?.status,
    statusChanged: newStatus !== currentTicket?.status,
    body: JSON.stringify(parsed.data),
  });
  if (newStatus && currentTicket && newStatus !== currentTicket.status) {
    const STATUS_LABELS: Record<string, string> = {
      acknowledged: "รับเรื่องแล้ว",
      in_progress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
    };

    const adminDb = createAdminClient();

    // Lookup requester LINE UID + technician name
    let lineUid: string | null = null;
    let technicianName: string | undefined;

    try {
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

      lineUid = requesterResult.data?.line_uid ?? null;
      technicianName = techResult.data?.display_name ?? undefined;
      console.log("[Auto-notify] Lookup result:", {
        requesterId: currentTicket.requester_id,
        lineUid,
        technicianName,
        requesterError: requesterResult.error?.message,
      });
    } catch (err) {
      console.error("[Auto-notify] Lookup failed:", err);
    }

    // 1) In-app notification (independent — don't let it block LINE push)
    try {
      await notifyMaintenanceUpdate({
        requesterId: currentTicket.requester_id,
        lineUid: null,
        ticketId: id,
        ticketTitle: currentTicket.title,
        newStatus,
      });
    } catch (err) {
      console.error("[Auto-notify] In-app notification failed:", err);
    }

    // 2) LINE Flex message
    if (lineUid) {
      try {
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
        console.log("[Auto-notify] LINE Flex sent to:", lineUid);
      } catch (err) {
        console.error("[Auto-notify] LINE Flex push failed:", err);
      }
    } else {
      console.warn("[Auto-notify] No line_uid found — skipping LINE push");
    }
  }

  return NextResponse.json(data);
}
