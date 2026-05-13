import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canPushNow, recordDispatch, hashPayload } from "@/lib/notifications/push-gate";
import { createNotification } from "@/lib/notifications/create";
import { buildBillReminderFlex } from "@/lib/line/flex-builders/bill-reminder";
import { pushFlexMessage } from "@/lib/line/client";
import type { BillData } from "@/lib/line/types";

export const maxDuration = 60;

const TARGET_DAYS = [0, 1, 3]; // days-until-due windows

function formatThaiDate(isoDate: string): string {
  const d = new Date(isoDate);
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = createAdminClient();
  const now = new Date();

  // Build date windows: today through 3 days ahead
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 3);

  const { data: bills, error } = await adminDb
    .from("bills")
    .select(`
      id, total_amount, due_date, status, student_id, billing_month, billing_year, billing_round,
      student:profiles!bills_student_id_fkey(id, line_uid, full_name_th, push_enabled)
    `)
    .in("status", ["pending", "overdue"])
    .lte("due_date", maxDate.toISOString().split("T")[0])
    .order("due_date", { ascending: true });

  if (error) {
    console.error("[BillCron] Query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let pushed = 0;
  let skipped = 0;

  for (const bill of bills ?? []) {
    const student = Array.isArray(bill.student) ? bill.student[0] : bill.student;
    if (!student) continue;

    const dueMs = new Date(bill.due_date).getTime();
    const daysUntilDue = Math.ceil((dueMs - now.getTime()) / (1000 * 60 * 60 * 24));

    // Skip if not in target windows
    if (!TARGET_DAYS.includes(daysUntilDue) && bill.status !== "overdue") {
      skipped++;
      continue;
    }

    const payloadKey = `bill_due:${bill.id}:${daysUntilDue}`;
    const payloadHash = hashPayload(payloadKey);
    const isOverdue = bill.status === "overdue" || daysUntilDue < 0;

    const gate = await canPushNow({
      userId: student.id,
      lineUid: student.line_uid,
      type: "bill",
      payloadHash,
      bypassQuietHours: isOverdue,
    });

    if (!gate.ok) {
      console.log(`[BillCron] Skip ${bill.id}: ${gate.reason}`);
      skipped++;
      continue;
    }

    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ];

    const billData: BillData = {
      billId: bill.id,
      month: thaiMonths[(bill.billing_month ?? 1) - 1],
      totalAmount: bill.total_amount,
      dueRound: bill.billing_round ?? 1,
      dueDate: formatThaiDate(bill.due_date),
      dueTime: "17.30น.",
      studentName: student.full_name_th ?? "นิสิต",
      buildingName: "",
      roomNumber: "",
      bedLabel: "",
      items: [{ label: "ค่าหอพัก", amount: bill.total_amount }],
    };

    try {
      await pushFlexMessage(student.line_uid!, buildBillReminderFlex(billData));
      await recordDispatch({ userId: student.id, type: "bill", payloadHash });
      await createNotification({
        user_id: student.id,
        type: "bill",
        title_th: isOverdue ? "บิลเลยกำหนดชำระ!" : `บิลครบกำหนด${daysUntilDue === 0 ? "วันนี้" : `ใน ${daysUntilDue} วัน`}`,
        title_en: "Bill due reminder",
        body_th: `฿${bill.total_amount.toLocaleString()} — ${formatThaiDate(bill.due_date)}`,
        action_url: `/billing`,
        priority: isOverdue ? 95 : 80,
        metadata: { bill_id: bill.id, days_until_due: daysUntilDue },
      });
      pushed++;
    } catch (err) {
      console.error(`[BillCron] Push failed for bill ${bill.id}:`, err);
    }
  }

  console.log(`[BillCron] Done — pushed: ${pushed}, skipped: ${skipped}`);
  return NextResponse.json({ pushed, skipped });
}
