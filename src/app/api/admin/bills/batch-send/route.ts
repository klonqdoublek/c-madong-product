/**
 * POST /api/admin/bills/batch-send
 * Send LINE bill reminders for multiple bills at once.
 * Body: { billIds: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBillReminderFlex } from "@/lib/line/flex-builders/bill-reminder";
import { pushFlexMessage } from "@/lib/line/client";
import { THAI_MONTHS } from "@/lib/utils/billing-constants";
import { formatThaiDate } from "@/lib/utils/date";
import type { BillData } from "@/lib/line/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const billIds: string[] = body.billIds;

    if (!Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json(
        { error: "billIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (billIds.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 bills per batch" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Fetch all bills
    const { data: bills, error: billsError } = await adminDb
      .from("bills")
      .select("*")
      .in("id", billIds);

    if (billsError) throw billsError;
    if (!bills || bills.length === 0) {
      return NextResponse.json({ error: "No bills found" }, { status: 404 });
    }

    // Gather all related IDs
    const studentIds = [...new Set(bills.map((b) => b.student_id))];
    const buildingIds = [...new Set(bills.map((b) => b.building_id).filter(Boolean))] as string[];
    const roomIds = [...new Set(bills.map((b) => b.room_id).filter(Boolean))] as string[];
    const bedIds = [...new Set(bills.map((b) => b.bed_id).filter(Boolean))] as string[];

    // Fetch all related data in parallel
    const [studentsRes, buildingsRes, roomsRes, bedsRes, itemsRes] =
      await Promise.all([
        adminDb
          .from("profiles")
          .select("id, full_name_th, line_uid")
          .in("id", studentIds),
        buildingIds.length > 0
          ? adminDb.from("buildings").select("id, name_th").in("id", buildingIds)
          : Promise.resolve({ data: [] }),
        roomIds.length > 0
          ? adminDb.from("rooms").select("id, room_number").in("id", roomIds)
          : Promise.resolve({ data: [] }),
        bedIds.length > 0
          ? adminDb.from("beds").select("id, bed_label").in("id", bedIds)
          : Promise.resolve({ data: [] }),
        adminDb
          .from("bill_items")
          .select("id, bill_id, label, category, amount")
          .in("bill_id", billIds),
      ]);

    // Build lookup maps
    const studentsMap = Object.fromEntries(
      (studentsRes.data ?? []).map((s) => [s.id, s])
    );
    const buildingsMap = Object.fromEntries(
      (buildingsRes.data ?? []).map((b) => [b.id, b.name_th])
    );
    const roomsMap = Object.fromEntries(
      (roomsRes.data ?? []).map((r) => [r.id, r.room_number])
    );
    const bedsMap = Object.fromEntries(
      (bedsRes.data ?? []).map((b) => [b.id, b.bed_label])
    );
    const itemsByBill: Record<string, { label: string; amount: number }[]> = {};
    for (const item of itemsRes.data ?? []) {
      if (!itemsByBill[item.bill_id]) itemsByBill[item.bill_id] = [];
      itemsByBill[item.bill_id].push({
        label: item.label,
        amount: Number(item.amount),
      });
    }

    // Send reminders one by one
    const results: { billId: string; success: boolean; error?: string }[] = [];

    for (const bill of bills) {
      const student = studentsMap[bill.student_id];
      const lineUid = student?.line_uid;

      if (!lineUid) {
        results.push({
          billId: bill.id,
          success: false,
          error: "No LINE UID",
        });
        continue;
      }

      try {
        const dueDate = new Date(bill.due_date);
        const billData: BillData = {
          billId: bill.id,
          month: THAI_MONTHS[bill.billing_month - 1],
          totalAmount: Number(bill.total_amount),
          dueRound: bill.billing_round,
          dueDate: formatThaiDate(dueDate),
          dueTime: "17.30น.",
          studentName: student?.full_name_th ?? "—",
          buildingName: bill.building_id
            ? buildingsMap[bill.building_id] ?? "—"
            : "—",
          roomNumber: bill.room_id ? roomsMap[bill.room_id] ?? "—" : "—",
          bedLabel: bill.bed_id ? bedsMap[bill.bed_id] ?? "—" : "—",
          items: itemsByBill[bill.id] ?? [],
        };

        const flexPayload = buildBillReminderFlex(billData);
        await pushFlexMessage(lineUid, flexPayload);

        results.push({ billId: bill.id, success: true });
      } catch (err) {
        results.push({
          billId: bill.id,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({ sent, failed, results });
  } catch (error) {
    console.error("Error batch sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
