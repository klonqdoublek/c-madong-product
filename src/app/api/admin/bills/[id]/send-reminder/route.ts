/**
 * POST /api/admin/bills/[id]/send-reminder
 * Fetch bill data, build Flex Message, push to student via LINE.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBillReminderFlex } from "@/lib/line/flex-builders/bill-reminder";
import { pushFlexMessage } from "@/lib/line/client";
import { THAI_MONTHS } from "@/lib/utils/billing-constants";
import { formatThaiDate } from "@/lib/utils/date";
import type { BillData } from "@/lib/line/types";

export const maxDuration = 30;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    // Fetch bill
    const { data: bill, error: billError } = await adminDb
      .from("bills")
      .select("*")
      .eq("id", id)
      .single();

    if (billError) throw billError;
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Fetch related data in parallel
    const [studentRes, buildingRes, roomRes, bedRes, itemsRes] =
      await Promise.all([
        adminDb
          .from("profiles")
          .select("id, full_name_th, line_uid")
          .eq("id", bill.student_id)
          .single(),
        bill.building_id
          ? adminDb
              .from("buildings")
              .select("id, name_th")
              .eq("id", bill.building_id)
              .single()
          : Promise.resolve({ data: null }),
        bill.room_id
          ? adminDb
              .from("rooms")
              .select("id, room_number")
              .eq("id", bill.room_id)
              .single()
          : Promise.resolve({ data: null }),
        bill.bed_id
          ? adminDb
              .from("beds")
              .select("id, bed_label")
              .eq("id", bill.bed_id)
              .single()
          : Promise.resolve({ data: null }),
        adminDb
          .from("bill_items")
          .select("id, label, category, amount")
          .eq("bill_id", bill.id),
      ]);

    const student = studentRes.data;
    const building = buildingRes.data;
    const room = roomRes.data;
    const bed = bedRes.data;
    const items = itemsRes.data ?? [];

    const lineUid = student?.line_uid;
    if (!lineUid) {
      return NextResponse.json(
        { error: "Student has no LINE UID" },
        { status: 400 }
      );
    }

    // Build BillData for Flex
    const dueDate = new Date(bill.due_date);
    const billData: BillData = {
      billId: bill.id,
      month: THAI_MONTHS[bill.billing_month - 1],
      totalAmount: Number(bill.total_amount),
      dueRound: bill.billing_round,
      dueDate: formatThaiDate(dueDate),
      dueTime: "17.30น.",
      studentName: student?.full_name_th ?? "—",
      buildingName: building?.name_th ?? "—",
      roomNumber: room?.room_number ?? "—",
      bedLabel: bed?.bed_label ?? "—",
      items: items.map((item) => ({
        label: item.label,
        amount: Number(item.amount),
      })),
    };

    const flexPayload = buildBillReminderFlex(billData);

    await pushFlexMessage(lineUid, flexPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending bill reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
