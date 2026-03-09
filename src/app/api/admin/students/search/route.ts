/**
 * GET /api/admin/students/search?q=<query>
 * Search students by name or student ID. Returns building/room info.
 * Uses admin client to bypass RLS.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ students: [] });
    }

    const adminDb = createAdminClient();

    const { data: students, error } = await adminDb
      .from("profiles")
      .select("id, full_name_th, student_id, building_id, room_id, bed_id")
      .eq("role", "student")
      .or(
        `full_name_th.ilike.%${q}%,student_id.ilike.%${q}%`
      )
      .limit(10);

    if (error) throw error;

    // Enrich with building/room names
    const buildingIds = [
      ...new Set((students ?? []).map((s) => s.building_id).filter(Boolean)),
    ];
    const roomIds = [
      ...new Set((students ?? []).map((s) => s.room_id).filter(Boolean)),
    ];

    const [buildingsRes, roomsRes] = await Promise.all([
      buildingIds.length > 0
        ? adminDb
            .from("buildings")
            .select("id, name_th")
            .in("id", buildingIds as string[])
        : Promise.resolve({ data: [] }),
      roomIds.length > 0
        ? adminDb
            .from("rooms")
            .select("id, room_number")
            .in("id", roomIds as string[])
        : Promise.resolve({ data: [] }),
    ]);

    const buildingsMap = Object.fromEntries(
      (buildingsRes.data ?? []).map((b) => [b.id, b.name_th])
    );
    const roomsMap = Object.fromEntries(
      (roomsRes.data ?? []).map((r) => [r.id, r.room_number])
    );

    const enriched = (students ?? []).map((s) => ({
      ...s,
      building_name: s.building_id ? buildingsMap[s.building_id] ?? null : null,
      room_number: s.room_id ? roomsMap[s.room_id] ?? null : null,
    }));

    return NextResponse.json({ students: enriched });
  } catch (error) {
    console.error("Error searching students:", error);
    return NextResponse.json(
      { error: "Failed to search students" },
      { status: 500 }
    );
  }
}
