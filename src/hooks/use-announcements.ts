"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
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

export function usePublishedAnnouncements(search?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["published-announcements", search],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("announcements")
        .select(`
          *,
          announcement_reads(id)
        `)
        .eq("status", "sent")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      if (search) {
        query = query.or(
          `title_th.ilike.%${search}%,title_en.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform to include is_read boolean
      return (data ?? []).map((a: any) => ({
        ...a,
        is_read: user ? a.announcement_reads?.some((r: any) => r.user_id === user.id) || a.announcement_reads?.length > 0 : false
      }));
    },
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

// ============================================================
// Student-facing hooks (new tables not in generated types yet)
// ============================================================

const REGISTRATIONS_KEY = "announcement-registrations";
const BOOKMARKS_KEY = "announcement-bookmarks";
const DOCUMENTS_KEY = "announcement-documents";

export function useMyRegistration(announcementId: string) {
  const supabase = useSupabase();
  const { profile } = useUser();
  const studentId = profile?.student_id;

  return useQuery({
    queryKey: [REGISTRATIONS_KEY, announcementId, studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data, error } = await (supabase as any)
        .from("announcement_registrations")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("student_id", studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId && !!announcementId,
  });
}

export function useRegisterAnnouncement() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const studentId = profile?.student_id;
      if (!studentId) throw new Error("No student ID");
      const { error } = await (supabase as any)
        .from("announcement_registrations")
        .insert({ announcement_id: announcementId, student_id: studentId });
      if (error) throw error;
    },
    onSuccess: (_, announcementId) => {
      toast.success("ลงทะเบียนสำเร็จแล้ว!");
      queryClient.invalidateQueries({
        queryKey: [REGISTRATIONS_KEY, announcementId],
      });
    },
  });
}

export function useUnregisterAnnouncement() {
  const supabase = useSupabase();
  const { profile } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const studentId = profile?.student_id;
      if (!studentId) throw new Error("No student ID");
      const { error } = await (supabase as any)
        .from("announcement_registrations")
        .delete()
        .eq("announcement_id", announcementId)
        .eq("student_id", studentId);
      if (error) throw error;
    },
    onSuccess: (_, announcementId) => {
      toast.success("ยกเลิกลงทะเบียนแล้ว");
      queryClient.invalidateQueries({
        queryKey: [REGISTRATIONS_KEY, announcementId],
      });
    },
  });
}

export function useMarkAnnouncementRead(announcementId: string) {
  const supabase = useSupabase();

  useEffect(() => {
    if (!announcementId) return;
    const markRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await (supabase as any)
        .from("announcement_reads")
        .upsert(
          { announcement_id: announcementId, user_id: user.id },
          { onConflict: "announcement_id,user_id" }
        );
    };
    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);
}

export function useMarkReadMutation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await (supabase as any)
        .from("announcement_reads")
        .upsert(
          { announcement_id: announcementId, user_id: user.id },
          { onConflict: "announcement_id,user_id" }
        );
      if (error) throw error;
    },
    onSuccess: (_, announcementId) => {
      queryClient.invalidateQueries({ queryKey: ["published-announcements"] });
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
    },
  });
}

export function useIsBookmarked(announcementId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [BOOKMARKS_KEY, announcementId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("announcement_bookmarks")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!announcementId,
  });
}

export function useToggleBookmark() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      announcementId,
      isBookmarked,
    }: {
      announcementId: string;
      isBookmarked: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isBookmarked) {
        const { error } = await (supabase as any)
          .from("announcement_bookmarks")
          .delete()
          .eq("announcement_id", announcementId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("announcement_bookmarks")
          .insert({ announcement_id: announcementId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, { announcementId, isBookmarked }) => {
      toast.success(isBookmarked ? "นำออกจากบันทึกแล้ว" : "บันทึกแล้ว");
      queryClient.invalidateQueries({
        queryKey: [BOOKMARKS_KEY, announcementId],
      });
    },
  });
}

export function useMyBookmarkedAnnouncements() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [BOOKMARKS_KEY, "my-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("announcement_bookmarks")
        .select("announcement_id, created_at, announcements(id, title_th, title_en, cover_image, published_at, category, has_dorm_score)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBotSearchableAnnouncements() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["bot-searchable-announcements"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("announcements")
        .select("id, title_th, sent_at, category, ai_confidence, embedding")
        .eq("status", "sent")
        .eq("is_bot_searchable", true)
        .is("archived_at", null)
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        title_th: string;
        sent_at: string | null;
        category: string | null;
        ai_confidence: number | null;
        embedding: string | null;
      }>;
    },
  });
}

export function useAnnouncementDocuments(announcementId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [DOCUMENTS_KEY, announcementId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("announcement_documents")
        .select("*")
        .eq("announcement_id", announcementId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!announcementId,
  });
}
