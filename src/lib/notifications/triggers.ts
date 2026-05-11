import { createNotification, createNotificationBatch } from "./create";
import { calculatePriority } from "./priority";
import { maybePushToLine } from "./line-push";
import { createAdminClient } from "@/lib/supabase/admin";

/** Notify student when a score is added/deducted */
export async function notifyScoreAdded(opts: {
  studentUserId: string;
  lineUid?: string | null;
  points: number;
  categoryName: string;
  reason?: string;
}): Promise<void> {
  const type = "score" as const;
  const priority = calculatePriority(type);
  const sign = opts.points >= 0 ? "+" : "";
  const titleTh = `คะแนนหอพัก ${sign}${opts.points}`;
  const bodyTh = opts.reason
    ? `${opts.categoryName}: ${opts.reason}`
    : opts.categoryName;

  await createNotification({
    user_id: opts.studentUserId,
    type,
    title_th: titleTh,
    title_en: `Dorm Score ${sign}${opts.points}`,
    body_th: bodyTh,
    body_en: bodyTh,
    action_url: "/score",
    priority,
    metadata: { points: opts.points, category: opts.categoryName },
  });

  await maybePushToLine({
    lineUid: opts.lineUid,
    priority,
    text: `🏠 ${titleTh}\n${bodyTh}`,
  });
}

/** Notify student when maintenance request status changes */
export async function notifyMaintenanceUpdate(opts: {
  requesterId: string;
  lineUid?: string | null;
  ticketId: string;
  ticketTitle: string;
  newStatus: string;
}): Promise<void> {
  const type = "repair" as const;
  const priority = calculatePriority(type);

  const STATUS_LABELS: Record<string, string> = {
    acknowledged: "รับเรื่องแล้ว",
    in_progress: "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };

  const statusLabel = STATUS_LABELS[opts.newStatus] ?? opts.newStatus;

  await createNotification({
    user_id: opts.requesterId,
    type,
    title_th: `แจ้งซ่อม: ${statusLabel}`,
    title_en: `Repair: ${opts.newStatus}`,
    body_th: opts.ticketTitle,
    body_en: opts.ticketTitle,
    action_url: `/maintenance/${opts.ticketId}`,
    priority,
    metadata: { ticket_id: opts.ticketId, status: opts.newStatus },
  });

  await maybePushToLine({
    lineUid: opts.lineUid,
    priority,
    text: `🔧 แจ้งซ่อม: ${statusLabel}\n${opts.ticketTitle}`,
  });
}

/** Notify student when a new bill is created */
export async function notifyBillDue(opts: {
  studentUserId: string;
  lineUid?: string | null;
  billId: string;
  amount: number;
  dueDate: string;
}): Promise<void> {
  const type = "bill" as const;
  const priority = calculatePriority(type);

  await createNotification({
    user_id: opts.studentUserId,
    type,
    title_th: "มีบิลค่าหอพักใหม่",
    title_en: "New Dorm Bill",
    body_th: `฿${opts.amount.toLocaleString()} ครบกำหนด ${opts.dueDate}`,
    body_en: `฿${opts.amount.toLocaleString()} due ${opts.dueDate}`,
    action_url: `/billing/${opts.billId}`,
    priority,
    metadata: { bill_id: opts.billId, amount: opts.amount },
  });

  await maybePushToLine({
    lineUid: opts.lineUid,
    priority,
    text: `💰 มีบิลค่าหอพักใหม่\n฿${opts.amount.toLocaleString()} ครบกำหนด ${opts.dueDate}`,
  });
}

/** Notify student when a parcel arrives */
export async function notifyParcelArrived(opts: {
  studentUserId: string;
  lineUid?: string | null;
  parcelId: string;
  parcelCount?: number;
  parcelType?: string;
  trackingNumber?: string | null;
}): Promise<void> {
  const type = "parcel" as const;
  const priority = calculatePriority(type);

  const titleTh = `มีพัสดุมาส่ง!`;
  const bodyTh = opts.trackingNumber
    ? `พัสดุ${opts.parcelType ? ` (${opts.parcelType})` : ""} หมายเลข ${opts.trackingNumber}`
    : `มีพัสดุ${opts.parcelType ? ` (${opts.parcelType})` : ""} รอรับที่หอพัก`;

  await createNotification({
    user_id: opts.studentUserId,
    type,
    title_th: titleTh,
    title_en: "Parcel Arrived!",
    body_th: bodyTh,
    body_en: opts.trackingNumber
      ? `Parcel ${opts.trackingNumber} is ready for pickup`
      : "You have a parcel ready for pickup",
    action_url: "/parcels",
    priority,
    metadata: {
      parcel_id: opts.parcelId,
      tracking_number: opts.trackingNumber ?? null,
    },
  });

  // LINE push handled separately via Flex message in the API route
}

/** Notify admins when a student requests live chat help */
export async function notifyChatEscalation(opts: {
  escalationId: string;
  studentName: string;
  studentId: string;
  issueSummary: string;
  sessionId: string;
}): Promise<void> {
  const type = "alert" as const;
  const priority = 90; // High priority — needs immediate attention

  const adminDb = createAdminClient();

  // Get all admin profiles with line_uid
  const { data: admins } = await adminDb
    .from("profiles")
    .select("id, line_uid")
    .in("role", ["admin", "head"])
    .not("line_uid", "is", null);

  if (!admins || admins.length === 0) return;

  // Create in-app notifications for all admins
  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    type,
    title_th: "มีนิสิตต้องการความช่วยเหลือ",
    title_en: "Student needs help",
    body_th: `${opts.studentName} — ${opts.issueSummary}`,
    body_en: `${opts.studentName} — ${opts.issueSummary}`,
    action_url: `/admin/live-chat?session=${opts.escalationId}`,
    priority,
    metadata: {
      escalation_id: opts.escalationId,
      student_id: opts.studentId,
    },
  }));

  await createNotificationBatch(notifications);

  // LINE push to all admins
  for (const admin of admins) {
    if (admin.line_uid) {
      await maybePushToLine({
        lineUid: admin.line_uid,
        priority,
        text: `🔔 นิสิต ${opts.studentName} ต้องการความช่วยเหลือ: ${opts.issueSummary}`,
      });
    }
  }
}

/** Notify all students in a building (or all) about a new event */
export async function notifyNewEvent(opts: {
  eventId: string;
  titleTh: string;
  titleEn: string;
  buildingId?: string | null;
  isMandatory: boolean;
}): Promise<void> {
  const type = "event" as const;
  const priority = opts.isMandatory ? 85 : calculatePriority(type);

  const adminDb = createAdminClient();

  // Get all student profiles (optionally filtered by building)
  let query = adminDb
    .from("profiles")
    .select("id")
    .eq("role", "student")
    .eq("status", "active");

  if (opts.buildingId) {
    query = query.eq("building_id", opts.buildingId);
  }

  const { data: students } = await query.limit(500);
  if (!students || students.length === 0) return;

  const bodyTh = opts.isMandatory
    ? "กิจกรรมบังคับ ห้ามขาดน้า!"
    : "มีกิจกรรมใหม่ ดูรายละเอียดเลย";

  const notifications = students.map((s) => ({
    user_id: s.id,
    type,
    title_th: opts.titleTh,
    title_en: opts.titleEn,
    body_th: bodyTh,
    body_en: opts.isMandatory ? "Mandatory event — don't miss!" : "New event, check it out",
    action_url: `/events/${opts.eventId}`,
    priority,
    metadata: { event_id: opts.eventId, mandatory: opts.isMandatory },
  }));

  await createNotificationBatch(notifications);
}
