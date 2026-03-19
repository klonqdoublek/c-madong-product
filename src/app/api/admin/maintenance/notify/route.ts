import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pushFlexMessage } from "@/lib/line/client";
import { buildRepairTrackingFlex } from "@/lib/line/flex-builders/repair-tracking";
import type { RepairTimelineStep } from "@/lib/line/flex-builders/repair-tracking";

const SPECIALTY_LABELS: Record<string, string> = {
  electrical: "ช่างไฟฟ้า",
  plumbing: "ช่างประปา",
  air_conditioning: "ช่างแอร์",
  general: "ช่างทั่วไป",
  furniture: "ช่างเฟอร์นิเจอร์",
  internet: "ช่างอินเทอร์เน็ต",
  door_lock: "ช่างกุญแจ",
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

  // Fetch ticket with timestamps
  const { data: ticket, error } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Fetch requester profile (LINE UID + display name)
  const { data: requester } = await supabase
    .from("profiles")
    .select("line_uid, display_name")
    .eq("id", ticket.requester_id)
    .single();

  if (!requester?.line_uid) {
    return NextResponse.json(
      { error: "Requester has no LINE UID" },
      { status: 400 }
    );
  }

  // Fetch technician info if assigned
  let technicianName: string | undefined;
  let technicianRole: string | undefined;
  if (ticket.technician_id) {
    const { data: tech } = await supabase
      .from("technicians")
      .select("display_name, specialty")
      .eq("id", ticket.technician_id)
      .single();
    technicianName = tech?.display_name;
    technicianRole = tech?.specialty
      ? SPECIALTY_LABELS[tech.specialty] ?? tech.specialty
      : undefined;
  }

  // Build tracking timeline
  const now = new Date();
  const todayStr = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const status = ticket.status as string;
  const steps: RepairTimelineStep[] = [];

  // Step 1: Created
  const createdDate = new Date(ticket.created_at);
  const createdDateStr = createdDate.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  steps.push({
    label: "ส่งคำขอไปยังเจ้าหน้าที่แล้ว",
    subLabel: ticketId.slice(0, 11).toUpperCase(),
    date: createdDateStr,
    time: formatTime(createdDate),
    isActive: status === "pending",
    isToday: createdDateStr === todayStr,
  });

  // Step 2: Acknowledged
  if (
    status === "acknowledged" ||
    status === "in_progress" ||
    status === "completed"
  ) {
    const acceptedDate = ticket.accepted_at
      ? new Date(ticket.accepted_at)
      : new Date(ticket.updated_at);
    const acceptedDateStr = acceptedDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    steps.push({
      label: "ช่างได้รับคำขอแล้ว",
      date: acceptedDateStr,
      time: formatTime(acceptedDate),
      isActive: status === "acknowledged",
      isToday: acceptedDateStr === todayStr,
      details: { technicianName, technicianRole },
    });
  }

  // Step 3: In Progress / Completed
  if (status === "in_progress" || status === "completed") {
    const inProgressDate = new Date(ticket.updated_at);
    const inProgressDateStr = inProgressDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    steps.push({
      label:
        status === "completed"
          ? "ซ่อมเสร็จเรียบร้อยแล้ว!"
          : "ช่างกำลังดำเนินการเข้าซ่อม",
      date: inProgressDateStr,
      time: formatTime(inProgressDate),
      isActive: true,
      isToday: inProgressDateStr === todayStr,
    });
  }

  // Cancelled
  if (status === "cancelled") {
    const cancelDate = new Date(ticket.updated_at);
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
    displayName: requester.display_name ?? "คุณ",
    ticketId,
    steps,
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

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")} น.`;
}
