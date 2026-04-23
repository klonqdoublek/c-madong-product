"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";

export function useBuildings() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name_th")
        .order("name_th");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useRooms(buildingId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["rooms", buildingId],
    queryFn: async () => {
      if (!buildingId) return [];
      const { data, error } = await supabase
        .from("rooms")
        .select("id, building_id, floor, room_number")
        .eq("building_id", buildingId)
        .order("floor")
        .order("room_number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!buildingId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useBeds(roomId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["beds", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("beds")
        .select("id, room_id, bed_label")
        .eq("room_id", roomId)
        .order("bed_label");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!roomId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useResidenceInfo({
  buildingId,
  roomId,
  bedId,
}: {
  buildingId: string | null;
  roomId: string | null;
  bedId: string | null;
}) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["residence-info", buildingId, roomId, bedId],
    queryFn: async () => {
      const [buildingResult, roomResult, bedResult] = await Promise.all([
        buildingId
          ? supabase
              .from("buildings")
              .select("id, name_th")
              .eq("id", buildingId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        roomId
          ? supabase
              .from("rooms")
              .select("id, room_number")
              .eq("id", roomId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        bedId
          ? supabase
              .from("beds")
              .select("id, bed_label")
              .eq("id", bedId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (buildingResult.error) throw buildingResult.error;
      if (roomResult.error) throw roomResult.error;
      if (bedResult.error) throw bedResult.error;

      return {
        building: buildingResult.data,
        room: roomResult.data,
        bed: bedResult.data,
      };
    },
    enabled: !!buildingId || !!roomId || !!bedId,
    staleTime: 30 * 60 * 1000,
  });
}
