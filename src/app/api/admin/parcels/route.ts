/**
 * GET /api/admin/parcels — List parcels with filters
 * POST /api/admin/parcels — Register a new parcel (no notification)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ParcelStatus } from "@/lib/supabase/types";

export const maxDuration = 30;

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
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    const adminDb = createAdminClient();
    let query = adminDb
      .from("parcels")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status as ParcelStatus);
    }

    if (search) {
      query = query.or(
        `tracking_number.ilike.%${search}%,courier.ilike.%${search}%`
      );
    }

    const { data: parcels, error, count } = await query;
    if (error) throw error;

    // Fetch profiles for each parcel's student_id
    const studentIds = [...new Set((parcels ?? []).map((p) => p.student_id))];
    const { data: profiles } = studentIds.length > 0
      ? await adminDb
          .from("profiles")
          .select("id, full_name_th, student_id, line_uid, room_id, building_id")
          .in("id", studentIds)
      : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const enriched = (parcels ?? []).map((p) => ({
      ...p,
      profiles: profileMap.get(p.student_id) ?? null,
    }));

    return NextResponse.json({ data: enriched, total: count ?? 0 });
  } catch (error) {
    console.error("Error fetching parcels:", error);
    return NextResponse.json(
      { error: "Failed to fetch parcels" },
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
    const { student_id, parcel_type, tracking_number, courier, description, pickup_location } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: "Missing student_id" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Insert parcel (no notification — staff will notify later)
    const { data: parcel, error: insertError } = await adminDb
      .from("parcels")
      .insert({
        student_id,
        parcel_type: parcel_type || "box",
        tracking_number: tracking_number || null,
        courier: courier || null,
        description: description || null,
        pickup_location: pickup_location || "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกพุดซ้อน",
        registered_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: parcel });
  } catch (error) {
    console.error("Error registering parcel:", error);
    return NextResponse.json(
      { error: "Failed to register parcel" },
      { status: 500 }
    );
  }
}
