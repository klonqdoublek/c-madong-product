"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { MaintenanceTicketWithRelations, TicketFilters } from "@/types/maintenance";

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
  const supabase = useSupabase();
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
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "acknowledged") {
        updates.accepted_at = new Date().toISOString();
      }
      if (status === "completed" || status === "cancelled") {
        updates.resolved_at = new Date().toISOString();
      }
      if (failure_reason) {
        updates.failure_reason = failure_reason;
      }

      const { error } = await supabase
        .from("maintenance_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useAssignTechnician() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      technicianId,
    }: {
      ticketId: string;
      technicianId: string | null;
    }) => {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          technician_id: technicianId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}

export function useUpdateTicketNotes() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      admin_notes,
    }: {
      id: string;
      admin_notes: string;
    }) => {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });
}
