"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import type { Database, ParcelStatus } from "@/lib/supabase/types";

type Parcel = Database["public"]["Tables"]["parcels"]["Row"];

const PARCELS_KEY = "parcels";
const MY_PARCELS_KEY = "my-parcels";

// ============================================================================
// Student hooks
// ============================================================================

export function useMyParcels() {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: [MY_PARCELS_KEY, user?.id],
    queryFn: async (): Promise<Parcel[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useMarkParcelPickedUp() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parcelId: string) => {
      const { data, error } = await supabase
        .from("parcels")
        .update({
          status: "picked_up" as ParcelStatus,
          picked_up_at: new Date().toISOString(),
        })
        .eq("id", parcelId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_PARCELS_KEY] });
    },
  });
}

// ============================================================================
// Admin hooks
// ============================================================================

export function useParcels(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: [PARCELS_KEY, "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);

      const res = await fetch(`/api/admin/parcels?${params}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to fetch parcels");
      const json = await res.json();
      return json as { data: Parcel[]; total: number };
    },
  });
}

export function useRegisterParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      parcel_type?: string;
      tracking_number?: string;
      courier?: string;
      description?: string;
      pickup_location?: string;
    }) => {
      const res = await fetch("/api/admin/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register parcel");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARCELS_KEY] });
    },
  });
}

export function useUpdateParcelStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ParcelStatus;
    }) => {
      const res = await fetch(`/api/admin/parcels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update parcel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARCELS_KEY] });
    },
  });
}

export function useResendParcelNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parcelId: string) => {
      const res = await fetch(`/api/admin/parcels/${parcelId}/notify`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send notification");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARCELS_KEY] });
    },
  });
}

export function useBulkNotifyParcels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parcelIds: string[]) => {
      const res = await fetch("/api/admin/parcels/notify-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parcelIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send bulk notifications");
      }
      return res.json() as Promise<{
        success: boolean;
        notified: number;
        errors: { id: string; error: string }[];
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARCELS_KEY] });
    },
  });
}
