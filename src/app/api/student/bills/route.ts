/**
 * GET /api/student/bills - Get current student's bills
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bills, error } = await supabase
      .from("bills")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch bill items
    const billIds = (bills ?? []).map((b) => b.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemsByBill: Record<string, any[]> = {};

    if (billIds.length > 0) {
      const { data: allItems } = await supabase
        .from("bill_items")
        .select("id, bill_id, label, category, amount, notes")
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
    console.error("Error fetching student bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}
