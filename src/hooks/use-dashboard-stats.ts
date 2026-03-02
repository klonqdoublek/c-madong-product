"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";

export interface DashboardStats {
  totalStudents: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  sentThisMonth: number;
  pendingScheduled: number;
}

export function useDashboardStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [studentsRes, openRes, inProgressRes, completedRes, sentRes, scheduledRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "student"),
          supabase
            .from("maintenance_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("maintenance_requests")
            .select("id", { count: "exact", head: true })
            .in("status", ["acknowledged", "in_progress"]),
          supabase
            .from("maintenance_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "completed"),
          supabase
            .from("announcements")
            .select("id", { count: "exact", head: true })
            .eq("status", "sent")
            .gte("sent_at", startOfMonth),
          supabase
            .from("announcements")
            .select("id", { count: "exact", head: true })
            .eq("status", "scheduled"),
        ]);

      return {
        totalStudents: studentsRes.count ?? 0,
        openTickets: openRes.count ?? 0,
        inProgressTickets: inProgressRes.count ?? 0,
        completedTickets: completedRes.count ?? 0,
        sentThisMonth: sentRes.count ?? 0,
        pendingScheduled: scheduledRes.count ?? 0,
      };
    },
  });
}

export function useRecentTickets(limit = 5) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["recent-tickets", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(
          `
          id, title, status, category, created_at,
          requester:profiles!requester_id(full_name_th, full_name_en)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecentAnnouncements(limit = 5) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["recent-announcements", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title_th, title_en, status, created_at, sent_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}
