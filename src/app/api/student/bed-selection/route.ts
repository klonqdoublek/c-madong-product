import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMockOccupied, getCurrentSemester } from "@/lib/utils/bed-mock";

// GET /api/student/bed-selection?floor=N
// Returns rooms + beds for the user's building on the requested floor
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("building_id, room_id, bed_id")
    .eq("id", user.id)
    .single();

  if (!profile?.building_id) {
    return NextResponse.json({ error: "No building assigned" }, { status: 400 });
  }

  const floorParam = req.nextUrl.searchParams.get("floor");
  const floor = floorParam ? parseInt(floorParam) : null;

  const db = createAdminClient() as any;

  let roomsQuery = db
    .from("rooms")
    .select("id, room_number, floor")
    .eq("building_id", profile.building_id)
    .order("room_number");

  if (floor !== null && !isNaN(floor)) {
    roomsQuery = roomsQuery.eq("floor", floor);
  }

  const { data: rooms, error: roomsErr } = await roomsQuery;
  if (roomsErr) return NextResponse.json({ error: roomsErr.message }, { status: 500 });

  const roomIds = (rooms ?? []).map((r: any) => r.id);

  const { data: beds, error: bedsErr } = await db
    .from("beds")
    .select("id, room_id, bed_label, is_occupied")
    .in("room_id", roomIds.length ? roomIds : ["__none__"])
    .order("bed_label");

  if (bedsErr) return NextResponse.json({ error: bedsErr.message }, { status: 500 });

  const semester = getCurrentSemester();

  const bedsByRoom = new Map<string, any[]>();
  (beds ?? []).forEach((b: any) => {
    if (!bedsByRoom.has(b.room_id)) bedsByRoom.set(b.room_id, []);
    bedsByRoom.get(b.room_id)!.push({
      id: b.id,
      label: b.bed_label,
      isOccupied: isMockOccupied(b.id, semester, profile.bed_id),
      isCurrent: b.id === profile.bed_id,
    });
  });

  const roomsWithBeds = (rooms ?? []).map((r: any) => {
    const roomBeds = bedsByRoom.get(r.id) ?? [];
    const availableCount = roomBeds.filter((b) => !b.isOccupied).length;
    return {
      id: r.id,
      roomNumber: r.room_number,
      floor: r.floor,
      beds: roomBeds,
      availableCount,
      isFull: availableCount === 0,
    };
  });

  const totalAvailable = roomsWithBeds.reduce((s: number, r: any) => s + r.availableCount, 0);

  return NextResponse.json({
    rooms: roomsWithBeds,
    availableCount: totalAvailable,
    buildingId: profile.building_id,
    currentBedId: profile.bed_id,
    currentRoomId: profile.room_id,
  });
}

// POST /api/student/bed-selection/confirm
// Body: { bedId: string, roomId: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bedId, roomId } = body as { bedId: string; roomId: string };

  if (!bedId || !roomId) {
    return NextResponse.json({ error: "bedId and roomId required" }, { status: 400 });
  }

  const db = createAdminClient() as any;

  // Fetch current profile
  const { data: profile } = await db
    .from("profiles")
    .select("bed_id, room_id, building_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Verify bed belongs to same building
  const { data: targetRoom } = await db
    .from("rooms")
    .select("building_id")
    .eq("id", roomId)
    .single();

  if (!targetRoom || targetRoom.building_id !== profile.building_id) {
    return NextResponse.json({ error: "Cannot switch buildings" }, { status: 403 });
  }

  // Race check: re-check mock occupancy (client-side timer only — no real DB lock)
  const semester = getCurrentSemester();
  const isOccupied = isMockOccupied(bedId, semester, profile.bed_id);
  if (isOccupied) {
    return NextResponse.json({ error: "เตียงนี้ถูกจองไปแล้ว ลองเลือกเตียงอื่น" }, { status: 409 });
  }

  // Update profile
  const { error: profileErr } = await db
    .from("profiles")
    .update({ bed_id: bedId, room_id: roomId })
    .eq("id", user.id);

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

  // Flip is_occupied (old bed → false, new bed → true)
  if (profile.bed_id && profile.bed_id !== bedId) {
    await db.from("beds").update({ is_occupied: false }).eq("id", profile.bed_id);
  }
  await db.from("beds").update({ is_occupied: true }).eq("id", bedId);

  // Find active bed_selection calendar item
  const { data: calItem } = await db
    .from("dorm_calendar_items")
    .select("id")
    .eq("category", "bed_selection")
    .is("archived_at", null)
    .order("due_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Insert completion (idempotent due to UNIQUE constraint)
  if (calItem) {
    await db.from("dorm_calendar_completions").upsert(
      {
        user_id: user.id,
        source_type: "item",
        source_id: calItem.id,
        completion_method: "submission",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,source_type,source_id", ignoreDuplicates: false }
    );
  }

  return NextResponse.json({ success: true, bedId, roomId });
}
