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
        .select("*")
        .order("name_th");
      if (error) throw error;
      return data ?? [];
    },
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
        .select("*")
        .eq("building_id", buildingId)
        .order("floor")
        .order("room_number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!buildingId,
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
        .select("*")
        .eq("room_id", roomId)
        .order("bed_label");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!roomId,
  });
}
