/**
 * API Route for Single Bill
 *
 * GET /api/admin/bills/[id] - Get bill detail with items
 * PATCH /api/admin/bills/[id] - Update bill status
 * DELETE /api/admin/bills/[id] - Delete bill
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateBillStatusSchema } from "@/lib/validators/billing";
import { z } from "zod/v4";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Fetch bill and items separately
    const [billRes, itemsRes] = await Promise.all([
      adminDb.from("bills").select("*").eq("id", id).single(),
      adminDb.from("bill_items").select("*").eq("bill_id", id),
    ]);

    if (billRes.error) throw billRes.error;

    const bill = billRes.data;

    // Fetch related profile/building/room/bed
    const [studentRes, buildingRes, roomRes, bedRes] = await Promise.all([
      adminDb
        .from("profiles")
        .select("id, full_name_th, full_name_en, student_id, line_uid")
        .eq("id", bill.student_id)
        .single(),
      bill.building_id
        ? adminDb.from("buildings").select("id, name_th, name_en").eq("id", bill.building_id).single()
        : Promise.resolve({ data: null }),
      bill.room_id
        ? adminDb.from("rooms").select("id, room_number, floor").eq("id", bill.room_id).single()
        : Promise.resolve({ data: null }),
      bill.bed_id
        ? adminDb.from("beds").select("id, bed_label").eq("id", bill.bed_id).single()
        : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json({
      bill: {
        ...bill,
        bill_items: itemsRes.data ?? [],
        student: studentRes.data,
        building: buildingRes.data,
        room: roomRes.data,
        bed: bedRes.data,
      },
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateBillStatusSchema.parse(body);

    const adminDb = createAdminClient();

    const updateData: Record<string, unknown> = {
      status: validated.status,
      updated_at: new Date().toISOString(),
    };

    if (validated.adminNotes !== undefined) {
      updateData.admin_notes = validated.adminNotes;
    }

    if (validated.status === "paid") {
      updateData.paid_at = new Date().toISOString();
      updateData.paid_by = user.id;
    }

    const { data, error } = await adminDb
      .from("bills")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ bill: data });
  } catch (error) {
    console.error("Error updating bill:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { error } = await adminDb.from("bills").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
