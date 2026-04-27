"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { StudentWithRelations, StudentFilters } from "@/types/students";
import type { Database } from "@/lib/supabase/types";

const STUDENTS_KEY = "admin-students";

export function useStudents(filters?: Partial<StudentFilters>) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [STUDENTS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          `
          *,
          building:buildings!building_id(id, name_th, name_en),
          room:rooms!room_id(id, room_number, floor),
          bed:beds!bed_id(id, bed_label)
        `
        )
        .eq("role", "student")
        .order("full_name_th");

      if (filters?.search) {
        query = query.or(
          `full_name_th.ilike.%${filters.search}%,full_name_en.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`
        );
      }
      if (filters?.tag && filters.tag !== "all") {
        query = query.contains("tags", [filters.tag]);
      }
      if (filters?.building && filters.building !== "all") {
        query = query.eq("building_id", filters.building);
      }
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as StudentWithRelations[];
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Database["public"]["Tables"]["profiles"]["Update"] & { id: string }) => {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update student");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}
