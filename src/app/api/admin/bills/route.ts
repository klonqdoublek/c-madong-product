/**
 * API Route for Admin Billing
 *
 * GET /api/admin/bills - List bills with filters
 * POST /api/admin/bills - Create a bill with items
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBillSchema } from "@/lib/validators/billing";
import { z } from "zod/v4";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const buildingId = searchParams.get("buildingId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const adminDb = createAdminClient();

    let query = adminDb
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });

    if (status === "claims") {
      query = query.ilike("admin_notes", "%[LINE]%").eq("status", "pending");
    } else if (status && status !== "all") {
      query = query.eq("status", status as "pending" | "paid" | "overdue" | "cancelled");
    }
    if (buildingId) {
      query = query.eq("building_id", buildingId);
    }
    if (month) {
      query = query.eq("billing_month", parseInt(month));
    }
    if (year) {
      query = query.eq("billing_year", parseInt(year));
    }

    const { data: bills, error } = await query;
    if (error) throw error;

    // Fetch bill items for all bills
    const billIds = (bills ?? []).map((b) => b.id);
    let itemsByBill: Record<string, { id: string; label: string; category: string; amount: number }[]> = {};

    if (billIds.length > 0) {
      const { data: allItems } = await adminDb
        .from("bill_items")
        .select("id, bill_id, label, category, amount")
        .in("bill_id", billIds);

      if (allItems) {
        for (const item of allItems) {
          if (!itemsByBill[item.bill_id]) itemsByBill[item.bill_id] = [];
          itemsByBill[item.bill_id].push(item);
        }
      }
    }

    const enriched = (bills ?? []).map((bill) => ({
      ...bill,
      bill_items: itemsByBill[bill.id] ?? [],
    }));

    return NextResponse.json({ bills: enriched });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

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
    const validated = createBillSchema.parse(body);

    const adminDb = createAdminClient();

    // Create bill
    const { data: bill, error: billError } = await adminDb
      .from("bills")
      .insert({
        student_id: validated.studentId,
        building_id: validated.buildingId ?? null,
        room_id: validated.roomId ?? null,
        bed_id: validated.bedId ?? null,
        billing_month: validated.billingMonth,
        billing_year: validated.billingYear,
        billing_round: validated.billingRound,
        due_date: validated.dueDate,
        admin_notes: validated.adminNotes ?? null,
        created_by: user.id,
        total_amount: validated.items.reduce((sum, item) => sum + item.amount, 0),
      })
      .select()
      .single();

    if (billError) throw billError;

    // Create bill items
    const itemsToInsert = validated.items.map((item) => ({
      bill_id: bill.id,
      label: item.label,
      category: item.category,
      amount: item.amount,
      notes: item.notes ?? null,
    }));

    const { error: itemsError } = await adminDb
      .from("bill_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error("Error creating bill:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
