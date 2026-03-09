"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { MaintenanceStatus } from "@/lib/supabase/types";

export interface DashboardStats {
  totalStudents: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  sentThisMonth: number;
  pendingScheduled: number;
  pendingBills: number;
  overdueBills: number;
}

export function useDashboardStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [studentsRes, openRes, inProgressRes, completedRes, sentRes, scheduledRes, pendingBillsRes, overdueBillsRes] =
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
          supabase
            .from("bills")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("bills")
            .select("id", { count: "exact", head: true })
            .eq("status", "overdue"),
        ]);

      return {
        totalStudents: studentsRes.count ?? 0,
        openTickets: openRes.count ?? 0,
        inProgressTickets: inProgressRes.count ?? 0,
        completedTickets: completedRes.count ?? 0,
        sentThisMonth: sentRes.count ?? 0,
        pendingScheduled: scheduledRes.count ?? 0,
        pendingBills: pendingBillsRes.count ?? 0,
        overdueBills: overdueBillsRes.count ?? 0,
      };
    },
  });
}

interface RecentTicket {
  id: string;
  title: string;
  status: MaintenanceStatus;
  category: string;
  created_at: string;
  requester: { full_name_th?: string; full_name_en?: string };
}

export function useRecentTickets(limit = 5) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["recent-tickets", limit],
    queryFn: async (): Promise<RecentTicket[]> => {
      const { data, error } = await supabase
        .from("maintenance_requests_with_requester" as "maintenance_requests")
        .select(
          "id, title, status, category, created_at, requester_name_th, requester_name_en"
        )
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data as any[]) ?? []).map((t) => ({
        id: t.id as string,
        title: t.title as string,
        status: t.status as MaintenanceStatus,
        category: t.category as string,
        created_at: t.created_at as string,
        requester: {
          full_name_th: t.requester_name_th as string | undefined,
          full_name_en: t.requester_name_en as string | undefined,
        },
      }));
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
