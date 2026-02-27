"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { CreateTechnicianInput } from "@/lib/validators/admin-maintenance";

const TECHNICIANS_KEY = "technicians";

export function useTechnicians(activeOnly = false) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [TECHNICIANS_KEY, { activeOnly }],
    queryFn: async () => {
      let query = supabase
        .from("technicians")
        .select("*")
        .order("display_name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTechnician() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTechnicianInput) => {
      const { data, error } = await supabase
        .from("technicians")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TECHNICIANS_KEY] });
    },
  });
}

export function useUpdateTechnician() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CreateTechnicianInput> & { id: string }) => {
      const { error } = await supabase
        .from("technicians")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TECHNICIANS_KEY] });
    },
  });
}

export function useDeleteTechnician() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TECHNICIANS_KEY] });
    },
  });
}
