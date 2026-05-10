import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") ?? new Date().toISOString();

    const adminDb = createAdminClient();

    const [buildingsRes, roomsRes, bedsRes, profilesRes] = await Promise.all([
      adminDb.from("buildings").select("id, name_th, name_en"),
      adminDb.from("rooms").select("id, building_id, capacity, floor"),
      adminDb.from("beds").select("id, room_id, is_occupied"),
      adminDb
        .from("profiles")
        .select("id, move_in_date, building_id")
        .eq("role", "student")
        .not("move_in_date", "is", null)
        .gte("move_in_date", from.slice(0, 10))
        .lte("move_in_date", to.slice(0, 10)),
    ]);

    const buildings = buildingsRes.data ?? [];
    const rooms = roomsRes.data ?? [];
    const beds = bedsRes.data ?? [];
    const profiles = profilesRes.data ?? [];

    // Build lookup maps
    const roomToBuilding = new Map(rooms.map((r) => [r.id, r.building_id]));
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    // KPIs
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.is_occupied).length;
    const vacantBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Per-building occupancy
    const buildingStats: Record<string, { name_th: string; name_en: string; total: number; occupied: number; rooms: number }> = {};
    for (const b of buildings) {
      buildingStats[b.id] = { name_th: b.name_th ?? "", name_en: b.name_en ?? "", total: 0, occupied: 0, rooms: 0 };
    }
    for (const r of rooms) {
      if (r.building_id && buildingStats[r.building_id]) {
        buildingStats[r.building_id].rooms++;
      }
    }
    for (const bed of beds) {
      const buildingId = roomToBuilding.get(bed.room_id ?? "");
      if (buildingId && buildingStats[buildingId]) {
        buildingStats[buildingId].total++;
        if (bed.is_occupied) buildingStats[buildingId].occupied++;
      }
    }
    const perBuilding = Object.values(buildingStats)
      .map((s) => ({
        name: s.name_th || s.name_en,
        totalBeds: s.total,
        occupiedBeds: s.occupied,
        vacantBeds: s.total - s.occupied,
        totalRooms: s.rooms,
        occupancyPct: s.total > 0 ? Math.round((s.occupied / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.occupancyPct - a.occupancyPct);

    // Move-in timeline
    const moveInMap: Record<string, number> = {};
    for (const p of profiles) {
      if (p.move_in_date) {
        const month = p.move_in_date.slice(0, 7); // YYYY-MM
        moveInMap[month] = (moveInMap[month] ?? 0) + 1;
      }
    }
    const moveInTimeline = Object.entries(moveInMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return NextResponse.json({
      kpis: { totalBeds, occupiedBeds, vacantBeds, occupancyRate },
      perBuilding,
      moveInTimeline,
    });
  } catch (err) {
    console.error("[reports/occupancy]", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
