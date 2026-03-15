"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import type { Database, EventStatus, EventType } from "@/lib/supabase/types";

type DormEvent = Database["public"]["Tables"]["dorm_events"]["Row"];
type EventAttendance = Database["public"]["Tables"]["event_attendance"]["Row"];

const EVENTS_KEY = "events";
const MY_EVENTS_KEY = "my-events";

// ============================================================================
// Student hooks
// ============================================================================

export function useUpcomingEvents() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVENTS_KEY, "upcoming"],
    queryFn: async (): Promise<DormEvent[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("dorm_events")
        .select("*")
        .in("event_status", ["published", "ongoing"])
        .or(`start_datetime.gte.${now},end_datetime.gte.${now},event_date.gte.${now.split("T")[0]}`)
        .order("event_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePastEvents() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVENTS_KEY, "past"],
    queryFn: async (): Promise<DormEvent[]> => {
      const now = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("dorm_events")
        .select("*")
        .in("event_status", ["completed"])
        .lt("event_date", now)
        .order("event_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEventDetail(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVENTS_KEY, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data: event, error } = await supabase
        .from("dorm_events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      // Get attendance count
      const { count } = await supabase
        .from("event_attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id);

      return { ...event, attendance_count: count ?? 0 };
    },
    enabled: !!id,
  });
}

export function useMyAttendance() {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [MY_EVENTS_KEY, "attendance", profile?.student_id],
    queryFn: async (): Promise<EventAttendance[]> => {
      if (!profile?.student_id) return [];
      const { data, error } = await supabase
        .from("event_attendance")
        .select("*")
        .eq("student_id", profile.student_id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.student_id,
  });
}

export function useMyEventAttendance(eventId: string | null) {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [MY_EVENTS_KEY, "attendance", profile?.student_id, eventId],
    queryFn: async (): Promise<EventAttendance | null> => {
      if (!profile?.student_id || !eventId) return null;
      const { data, error } = await supabase
        .from("event_attendance")
        .select("*")
        .eq("event_id", eventId)
        .eq("student_id", profile.student_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.student_id && !!eventId,
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!profile?.student_id) throw new Error("No student ID");
      const { data, error } = await supabase
        .from("event_attendance")
        .insert({
          event_id: eventId,
          student_id: profile.student_id,
          status: "registered" as const,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_EVENTS_KEY] });
    },
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const { profile } = useUser();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!profile?.student_id) throw new Error("No student ID");
      const { error } = await supabase
        .from("event_attendance")
        .delete()
        .eq("event_id", eventId)
        .eq("student_id", profile.student_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_EVENTS_KEY] });
    },
  });
}

// ============================================================================
// Admin hooks
// ============================================================================

interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  search?: string;
}

export function useAdminEvents(filters?: EventFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVENTS_KEY, "admin", filters],
    queryFn: async () => {
      let query = supabase
        .from("dorm_events")
        .select("*")
        .order("event_date", { ascending: false });

      if (filters?.type) {
        query = query.eq("event_type", filters.type);
      }
      if (filters?.status) {
        query = query.eq("event_status", filters.status);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,title_th.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (event: Database["public"]["Tables"]["dorm_events"]["Insert"]) => {
      const { data, error } = await supabase
        .from("dorm_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["dorm_events"]["Update"] & { id: string }) => {
      const { data, error } = await supabase
        .from("dorm_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dorm_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
  });
}

export function useEventAttendees(eventId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVENTS_KEY, "attendees", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from("event_attendance")
        .select("*, profiles!inner(full_name_th, student_id, building_id, room_id)")
        .eq("event_id", eventId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!eventId,
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: Database["public"]["Tables"]["event_attendance"]["Row"]["status"];
      notes?: string;
    }) => {
      const updates: Database["public"]["Tables"]["event_attendance"]["Update"] = { status };
      if (status === "attended") {
        updates.checked_in = true;
        updates.checked_in_at = new Date().toISOString();
      }
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from("event_attendance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_EVENTS_KEY] });
    },
  });
}
