/**
 * GET /api/admin/parcels/[id] — Get parcel detail
 * PATCH /api/admin/parcels/[id] — Update parcel status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 15;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminDb = createAdminClient();

    const { data: parcel, error } = await adminDb
      .from("parcels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Fetch profile separately
    const { data: profile } = await adminDb
      .from("profiles")
      .select("full_name_th, student_id, line_uid, room_id, building_id")
      .eq("id", parcel.student_id)
      .single();

    return NextResponse.json({ data: { ...parcel, profiles: profile } });
  } catch (error) {
    console.error("Error fetching parcel:", error);
    return NextResponse.json(
      { error: "Failed to fetch parcel" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, description, pickup_code } = body;

    const adminDb = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (pickup_code !== undefined) updateData.pickup_code = pickup_code;
    if (status === "picked_up") updateData.picked_up_at = new Date().toISOString();

    const { data, error } = await adminDb
      .from("parcels")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating parcel:", error);
    return NextResponse.json(
      { error: "Failed to update parcel" },
      { status: 500 }
    );
  }
}
