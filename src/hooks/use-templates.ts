"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { MessageTemplateInsert, MessageTemplateUpdate } from "@/types/announcements";

const TEMPLATES_KEY = "message-templates";

export function useTemplates(filters?: { search?: string; category?: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [TEMPLATES_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("message_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: MessageTemplateInsert) => {
      const { data, error } = await supabase
        .from("message_templates")
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
  });
}

export function useUpdateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: MessageTemplateUpdate & { id: string }) => {
      const { error } = await supabase
        .from("message_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
  });
}

export function useDeleteTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] });
    },
  });
}
