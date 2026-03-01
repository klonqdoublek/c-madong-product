"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { AnnouncementInsert, AnnouncementUpdate } from "@/types/announcements";

const ANNOUNCEMENTS_KEY = "admin-announcements";

export function useAnnouncements(filters?: { search?: string; status?: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `title_th.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAnnouncement(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: AnnouncementInsert) => {
      const { data, error } = await supabase
        .from("announcements")
        .insert(announcement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
}

export function useUpdateAnnouncement() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: AnnouncementUpdate & { id: string }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
}

export function useDeleteAnnouncement() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
}
