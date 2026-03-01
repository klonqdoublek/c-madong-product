"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";

export interface DashboardStats {
  totalStudents: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
}

export function useDashboardStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [studentsRes, openRes, inProgressRes, completedRes] =
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
        ]);

      return {
        totalStudents: studentsRes.count ?? 0,
        openTickets: openRes.count ?? 0,
        inProgressTickets: inProgressRes.count ?? 0,
        completedTickets: completedRes.count ?? 0,
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
