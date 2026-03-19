"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "./use-user";

export function useMyTickets() {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

export function useCancelTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      reason,
    }: {
      ticketId: string;
      reason?: string;
    }) => {
      const res = await fetch(`/api/student/maintenance/${ticketId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to cancel ticket");
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    },
  });
}

export function useTicketDetail(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["ticket-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
