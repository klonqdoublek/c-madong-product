"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { TagInsert, TagUpdate } from "@/types/tags";

const TAGS_KEY = "tags";

export function useTags() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTag() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: TagInsert) => {
      const { data, error } = await supabase
        .from("tags")
        .insert(tag)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useUpdateTag() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TagUpdate & { id: string }) => {
      const { error } = await supabase
        .from("tags")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useDeleteTag() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}
