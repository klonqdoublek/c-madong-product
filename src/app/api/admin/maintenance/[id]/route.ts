import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateTicketSchema } from "@/lib/validators/admin-maintenance";
import { notifyMaintenanceUpdate } from "@/lib/notifications/triggers";
import { pushFlexMessage } from "@/lib/line/client";
import { buildRepairTrackingFlex } from "@/lib/line/flex-builders/repair-tracking";
import type { RepairTimelineStep } from "@/lib/line/flex-builders/repair-tracking";

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

  const STAFF_ROLES = [
    "admin", "staff",  // legacy
    "super_admin", "head", "registrar", "finance", "parcel",
    "admin_staff", "service", "activity",
    "technician_head", "technician", "technician_it",
  ];
  if (!profile || !STAFF_ROLES.includes(profile.role!)) {
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

  // Handle AI feedback separately (don't spread into updates)
  const { ai_feedback, correct_category, ...updateFields } = parsed.data;

  const updates: Record<string, unknown> = {
    ...updateFields,
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

  // Use adminClient to bypass RLS (auth already verified above)
  const adminDb = createAdminClient();

  // Fetch current ticket to check if status actually changed
  const { data: currentTicket } = await adminDb
    .from("maintenance_requests")
    .select("status, requester_id, title, category, technician_id, created_at, accepted_at, resolved_at, updated_at")
    .eq("id", id)
    .single();

  const { data, error } = await adminDb
    .from("maintenance_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Handle AI feedback (mark incorrect / decrease template accuracy)
  if (ai_feedback === "incorrect") {
    const notePrefix = `[AI Correction] Category changed to: ${correct_category || "N/A"}`;
    const existingNotes = data.admin_notes || "";
    await adminDb
      .from("maintenance_requests")
      .update({
        admin_notes: existingNotes
          ? `${existingNotes}\n${notePrefix}`
          : notePrefix,
      })
      .eq("id", id);

    // Decrease template accuracy if template was used
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const templateId = (data as any).template_id;
    if (templateId) {
      // RPC may not exist yet if repair_templates migration not applied
      await (adminDb.rpc as any)("decrease_template_accuracy", {
        template_id: templateId,
      });
    }
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
    // Lookup requester LINE UID + display name + technician info
    let lineUid: string | null = null;
    let displayName = "คุณ";
    let technicianName: string | undefined;
    let technicianRole: string | undefined;

    const SPECIALTY_LABELS: Record<string, string> = {
      electrical: "ช่างไฟฟ้า",
      plumbing: "ช่างประปา",
      air_conditioning: "ช่างแอร์",
      general: "ช่างทั่วไป",
      furniture: "ช่างเฟอร์นิเจอร์",
      internet: "ช่างอินเทอร์เน็ต",
      door_lock: "ช่างกุญแจ",
    };

    try {
      const techId = parsed.data.technician_id ?? currentTicket.technician_id;
      const [requesterResult, techResult] = await Promise.all([
        adminDb
          .from("profiles")
          .select("line_uid, display_name")
          .eq("id", currentTicket.requester_id)
          .single(),
        techId
          ? adminDb
              .from("technicians")
              .select("display_name, specialty")
              .eq("id", techId)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      lineUid = requesterResult.data?.line_uid ?? null;
      displayName = requesterResult.data?.display_name ?? "คุณ";
      technicianName = techResult.data?.display_name ?? undefined;
      technicianRole = techResult.data?.specialty
        ? SPECIALTY_LABELS[techResult.data.specialty] ?? techResult.data.specialty
        : undefined;
      console.log("[Auto-notify] Lookup result:", {
        requesterId: currentTicket.requester_id,
        lineUid,
        displayName,
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

    // 2) LINE Flex — tracking timeline design (matches Figma "ติดตามสถานะ")
    if (lineUid) {
      try {
        // Use updated timestamps from the DB response (data = updated ticket)
        const updatedTicket = data;
        const now = new Date();
        const todayStr = now.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const steps: RepairTimelineStep[] = [];

        // Step 1: Created (always exists)
        const createdDate = new Date(currentTicket.created_at);
        const createdDateStr = createdDate.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        steps.push({
          label: "ส่งคำขอไปยังเจ้าหน้าที่แล้ว",
          subLabel: id.slice(0, 11).toUpperCase(),
          date: createdDateStr,
          time: formatTime(createdDate),
          isActive: newStatus === "pending",
          isToday: createdDateStr === todayStr,
        });

        // Step 2: Acknowledged
        if (
          newStatus === "acknowledged" ||
          newStatus === "in_progress" ||
          newStatus === "completed"
        ) {
          const acceptedAt =
            updatedTicket.accepted_at ?? currentTicket.accepted_at;
          const acceptedDate = acceptedAt
            ? new Date(acceptedAt)
            : new Date(updatedTicket.updated_at);
          const acceptedDateStr = acceptedDate.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          steps.push({
            label: "ช่างได้รับคำขอแล้ว",
            date: acceptedDateStr,
            time: formatTime(acceptedDate),
            isActive: newStatus === "acknowledged",
            isToday: acceptedDateStr === todayStr,
            details: {
              technicianName,
              technicianRole,
            },
          });
        }

        // Step 3: In Progress
        if (newStatus === "in_progress" || newStatus === "completed") {
          const inProgressDate = new Date(updatedTicket.updated_at);
          const inProgressDateStr = inProgressDate.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          steps.push({
            label:
              newStatus === "completed"
                ? "ซ่อมเสร็จเรียบร้อยแล้ว!"
                : "ช่างกำลังดำเนินการเข้าซ่อม",
            date: inProgressDateStr,
            time: formatTime(inProgressDate),
            isActive: true,
            isToday: inProgressDateStr === todayStr,
          });
        }

        // Step for cancelled
        if (newStatus === "cancelled") {
          const cancelDate = new Date(updatedTicket.updated_at);
          const cancelDateStr = cancelDate.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          steps.push({
            label: "ยกเลิกคำขอแล้ว",
            date: cancelDateStr,
            time: formatTime(cancelDate),
            isActive: true,
            isToday: cancelDateStr === todayStr,
          });
        }

        const flex = buildRepairTrackingFlex({
          displayName,
          ticketId: id,
          steps,
        });
        await pushFlexMessage(lineUid, flex);
        console.log("[Auto-notify] LINE Tracking Flex sent to:", lineUid);
      } catch (err) {
        console.error("[Auto-notify] LINE Flex push failed:", err);
      }
    } else {
      console.warn("[Auto-notify] No line_uid found — skipping LINE push");
    }
  }

  return NextResponse.json(data);
}

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")} น.`;
}
