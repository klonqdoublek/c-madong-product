"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import type { EvaluationFormType, EvaluationStatus, CriteriaType } from "@/lib/supabase/types";

const EVALUATION_KEY = "evaluation";

// Type interfaces (tables not yet in generated types - using any cast)
interface EvaluationForm {
  id: string;
  event_id: string;
  form_type: EvaluationFormType;
  title_th: string;
  title_en: string | null;
  description_th: string | null;
  description_en: string | null;
  total_steps: number;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EvaluationCriteria {
  id: string;
  form_id: string;
  sort_order: number;
  title_th: string;
  title_en: string | null;
  description_th: string | null;
  description_en: string | null;
  criteria_type: CriteriaType;
  is_skippable: boolean;
  created_at: string;
}

interface EvaluationResponse {
  id: string;
  form_id: string;
  student_id: string;
  step_index: number;
  criterion_id: string | null;
  rating: number | null;
  text_response: string | null;
  skipped: boolean;
  created_at: string;
  updated_at: string;
}

interface EvaluationSubmission {
  id: string;
  form_id: string;
  student_id: string;
  status: EvaluationStatus;
  current_step: number;
  uploaded_files: string[];
  personal_info: Record<string, any> | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Student hooks
// ============================================================================

/**
 * Fetch evaluation form by event_id
 */
export function useEvaluationForm(eventId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVALUATION_KEY, "form", eventId],
    queryFn: async (): Promise<EvaluationForm | null> => {
      if (!eventId) return null;
      const { data, error } = await (supabase as any)
        .from("evaluation_forms")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

/**
 * Fetch criteria for a form
 */
export function useEvaluationCriteria(formId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVALUATION_KEY, "criteria", formId],
    queryFn: async (): Promise<EvaluationCriteria[]> => {
      if (!formId) return [];
      const { data, error } = await (supabase as any)
        .from("evaluation_criteria")
        .select("*")
        .eq("form_id", formId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!formId,
  });
}

/**
 * Fetch current student's submission status
 */
export function useMySubmission(formId: string | null) {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [EVALUATION_KEY, "my-submission", formId, profile?.student_id],
    queryFn: async (): Promise<EvaluationSubmission | null> => {
      if (!formId || !profile?.student_id) return null;
      const { data, error } = await (supabase as any)
        .from("evaluation_submissions")
        .select("*")
        .eq("form_id", formId)
        .eq("student_id", profile.student_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!formId && !!profile?.student_id,
  });
}

/**
 * Fetch current student's responses
 */
export function useMyResponses(formId: string | null) {
  const supabase = useSupabase();
  const { profile } = useUser();

  return useQuery({
    queryKey: [EVALUATION_KEY, "my-responses", formId, profile?.student_id],
    queryFn: async (): Promise<EvaluationResponse[]> => {
      if (!formId || !profile?.student_id) return [];
      const { data, error } = await (supabase as any)
        .from("evaluation_responses")
        .select("*")
        .eq("form_id", formId)
        .eq("student_id", profile.student_id)
        .order("step_index", { ascending: true })
        .order("criterion_id", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!formId && !!profile?.student_id,
  });
}

/**
 * Save/update responses for a step
 */
export function useSaveStepResponses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formId,
      stepIndex,
      responses,
    }: {
      formId: string;
      stepIndex: number;
      responses: Array<{
        criterion_id: string | null;
        rating?: number | null;
        text_response?: string | null;
        skipped?: boolean;
      }>;
    }) => {
      const res = await fetch(`/api/student/evaluation/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex, responses }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVALUATION_KEY] });
    },
  });
}

/**
 * Mark evaluation as completed
 */
export function useCompleteEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formId: string) => {
      const res = await fetch(`/api/student/evaluation/${formId}/submit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVALUATION_KEY] });
    },
  });
}

/**
 * Upload file for document_upload type
 */
export function useUploadEvaluationFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formId,
      file,
    }: {
      formId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/student/evaluation/${formId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVALUATION_KEY] });
    },
  });
}

// ============================================================================
// Admin hooks (minimal for MVP)
// ============================================================================

/**
 * List all evaluation forms
 */
export function useAdminEvaluationForms() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVALUATION_KEY, "admin", "forms"],
    queryFn: async (): Promise<EvaluationForm[]> => {
      const { data, error } = await (supabase as any)
        .from("evaluation_forms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Fetch all responses for a form (admin view)
 */
export function useEvaluationFormResponses(formId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [EVALUATION_KEY, "admin", "responses", formId],
    queryFn: async () => {
      if (!formId) return [];
      const { data, error } = await (supabase as any)
        .from("evaluation_responses")
        .select("*")
        .eq("form_id", formId)
        .order("student_id", { ascending: true })
        .order("step_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!formId,
  });
}
