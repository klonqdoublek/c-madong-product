"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { MaintenanceStatus, MaterialItem } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations, TicketFilters } from "@/types/maintenance";
import type { MaterialAnalysisResult } from "@/lib/ai/agents/material-agent";

const TICKETS_KEY = "maintenance-tickets";

export function useMaintenanceTickets(filters?: Partial<TicketFilters>) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [TICKETS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          requester:profiles!requester_id(id, full_name_th, full_name_en, avatar_url, room_id, building_id),
          technician:technicians!technician_id(id, display_name, specialty)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as MaintenanceTicketWithRelations[];
    },
  });
}

export function useMaintenanceTicket(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [TICKETS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          requester:profiles!requester_id(id, full_name_th, full_name_en, avatar_url, room_id, building_id),
          technician:technicians!technician_id(id, display_name, specialty)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as MaintenanceTicketWithRelations;
    },
    enabled: !!id,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      failure_reason,
    }: {
      id: string;
      status: MaintenanceStatus;
      failure_reason?: string;
    }) => {
      const body: Record<string, unknown> = { status };
      if (failure_reason) body.failure_reason = failure_reason;

      const res = await fetch(`/api/admin/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update ticket");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      technicianId,
    }: {
      ticketId: string;
      technicianId: string | null;
    }) => {
      const res = await fetch(`/api/admin/maintenance/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technician_id: technicianId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to assign technician");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useReanalyzeTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await fetch(`/api/admin/maintenance/${ticketId}/reanalyze`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to re-analyze");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useUpdateTicketNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      admin_notes,
    }: {
      id: string;
      admin_notes: string;
    }) => {
      const res = await fetch(`/api/admin/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update notes");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useSuggestMaterials() {
  return useMutation({
    mutationFn: async (ticketId: string): Promise<MaterialAnalysisResult> => {
      const res = await fetch(`/api/admin/maintenance/${ticketId}/suggest-materials`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to suggest materials");
      }
      return res.json();
    },
  });
}

export function useUpdateTicketMaterials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      materials,
    }: {
      id: string;
      materials: MaterialItem[];
    }) => {
      const res = await fetch(`/api/admin/maintenance/${id}/materials`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save materials");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}
