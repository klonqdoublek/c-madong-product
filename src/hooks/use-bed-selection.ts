"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useResidenceInfo } from "@/hooks/use-buildings";

export interface BedData {
  id: string;
  label: string;
  isOccupied: boolean;
  isCurrent: boolean;
}

export interface RoomData {
  id: string;
  roomNumber: string;
  floor: number;
  beds: BedData[];
  availableCount: number;
  isFull: boolean;
}

export interface BedSelectionLayout {
  rooms: RoomData[];
  availableCount: number;
  buildingId: string;
  currentBedId: string | null;
  currentRoomId: string | null;
}

export function useBedSelectionLayout(floor: number | null) {
  return useQuery<BedSelectionLayout>({
    queryKey: ["bed-selection-layout", floor],
    queryFn: async () => {
      const url = floor !== null
        ? `/api/student/bed-selection?floor=${floor}`
        : `/api/student/bed-selection`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to load beds");
      }
      return res.json();
    },
    enabled: floor !== null,
    staleTime: 30 * 1000,
  });
}

export function useConfirmBedSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bedId, roomId }: { bedId: string; roomId: string }) => {
      const res = await fetch("/api/student/bed-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId, roomId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Confirm failed");
      return body as { success: boolean; bedId: string; roomId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["residence-info"] });
      queryClient.invalidateQueries({ queryKey: ["dorm-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["bed-selection-layout"] });
    },
  });
}

export function useCurrentBedInfo() {
  const { profile } = useUser();
  return useResidenceInfo({
    buildingId: profile?.building_id ?? null,
    roomId: profile?.room_id ?? null,
    bedId: profile?.bed_id ?? null,
  });
}
