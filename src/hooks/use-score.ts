"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import type { Database } from "@/lib/supabase/types";

type ScoreEntry = Database["public"]["Tables"]["score_entries"]["Row"];
type ScoreCategory = Database["public"]["Tables"]["score_categories"]["Row"];
type CompositeScoreResult = Database["public"]["Functions"]["get_composite_score"]["Returns"];

const SCORE_KEY = "scores";
const MY_SCORE_KEY = "my-score";

// ============================================================================
// Student hooks
// ============================================================================

export function useMyScore() {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [MY_SCORE_KEY, "composite", profile?.student_id],
    queryFn: async (): Promise<CompositeScoreResult | null> => {
      if (!profile?.student_id) return null;
      const { data, error } = await supabase.rpc("get_composite_score", {
        p_student_id: profile.student_id,
      });
      if (error) throw error;
      return data as unknown as CompositeScoreResult;
    },
    enabled: !!profile?.student_id,
  });
}

export function useMyScoreHistory(categoryId?: string) {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [MY_SCORE_KEY, "history", profile?.student_id, categoryId],
    queryFn: async () => {
      if (!profile?.student_id) return [];
      let query = supabase
        .from("score_entries")
        .select("*, score_categories!inner(name, name_th, slug, icon, color)")
        .eq("student_id", profile.student_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.student_id,
  });
}

// ============================================================================
// Admin hooks
// ============================================================================

export function useScoreCategories() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [SCORE_KEY, "categories"],
    queryFn: async (): Promise<ScoreCategory[]> => {
      const { data, error } = await supabase
        .from("score_categories")
        .select("*")
        .eq("is_active", true)
        .order("slug");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStudentScores(filters?: { buildingId?: string; search?: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [SCORE_KEY, "students", filters],
    queryFn: async () => {
      // Get all students with their profiles
      let query = supabase
        .from("profiles")
        .select("id, student_id, full_name_th, full_name_en, building_id, room_id, buildings(name_th)")
        .eq("role", "student")
        .not("student_id", "is", null)
        .order("full_name_th");

      if (filters?.buildingId) {
        query = query.eq("building_id", filters.buildingId);
      }
      if (filters?.search) {
        query = query.or(`full_name_th.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`);
      }

      const { data: students, error } = await query;
      if (error) throw error;

      // Get composite scores for all returned students
      const scores = await Promise.all(
        (students ?? []).map(async (s) => {
          if (!s.student_id) return { ...s, composite_score: null, categories: [] };
          const { data } = await supabase.rpc("get_composite_score", {
            p_student_id: s.student_id,
          });
          const result = data as unknown as CompositeScoreResult | null;
          return {
            ...s,
            composite_score: result?.composite_score ?? null,
            categories: result?.categories ?? [],
          };
        })
      );

      return scores;
    },
  });
}

export function useAddScoreEntry() {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (entry: Database["public"]["Tables"]["score_entries"]["Insert"]) => {
      const { data, error } = await supabase
        .from("score_entries")
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCORE_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_SCORE_KEY] });
    },
  });
}
