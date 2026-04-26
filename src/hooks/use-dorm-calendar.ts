"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export type DormCalendarCategory =
  | "reapplication"
  | "cr54_upload"
  | "shop_evaluation"
  | "fire_drill_theory"
  | "fire_drill_practical"
  | "dorm_meeting"
  | "dorm_inspection"
  | "important_announcement"
  | "bed_selection";

export type CalendarCtaType =
  | "internal_eval"
  | "internal_quiz"
  | "internal_bed_selection"
  | "external_url"
  | "acknowledge"
  | "read_more"
  | "none";

export type CalendarCompletionMethod = "submission" | "manual_ack" | "admin_mark" | "auto_confirm";

export interface DormCalendarItem {
  id: string;
  sourceType: "item" | "event" | "announcement";
  sourceId: string;
  category: DormCalendarCategory;
  titleTh: string;
  titleEn?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  startAt: string;
  dueAt: string;
  semester: string | null;
  academicYear: number | null;
  audience: string;
  isRequired: boolean;
  ctaType: CalendarCtaType;
  ctaUrl?: string | null;
  ctaEventId?: string | null;
  scorePoints: number;
  penaltyPoints: number;
  completedAt?: string | null;
  completionMethod?: CalendarCompletionMethod | null;
  archivedAt?: string | null;
}

export interface DormCalendarFilters {
  status?: "pending" | "done" | "all";
  semester?: string;
  category?: DormCalendarCategory;
  search?: string;
  limit?: number;
}

export interface AcknowledgePayload {
  sourceType: "item" | "event" | "announcement";
  sourceId: string;
}

const QUERY_KEY = "dorm-calendar";

export function useDormCalendar(filters: DormCalendarFilters = {}) {
  return useQuery<DormCalendarItem[]>({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.semester) params.set("semester", filters.semester);
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.limit) params.set("limit", String(filters.limit));

      const res = await fetch(`/api/student/dorm-calendar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch dorm calendar");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAcknowledgeCalendarItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceType, sourceId }: AcknowledgePayload) => {
      const res = await fetch(
        `/api/student/dorm-calendar/${sourceType}/${sourceId}/acknowledge`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to acknowledge");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/** Calendar dates that have items — for mini calendar dot markers */
export function useDormCalendarDates(year: number, month: number) {
  return useQuery<Set<number>>({
    queryKey: [QUERY_KEY, "dates", year, month],
    queryFn: async () => {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const params = new URLSearchParams({ start, end, status: "all" });
      const res = await fetch(`/api/student/dorm-calendar?${params}`);
      if (!res.ok) return new Set<number>();
      const items: DormCalendarItem[] = await res.json();
      const days = new Set<number>();
      items.forEach((item) => {
        const d = new Date(item.dueAt);
        if (d.getMonth() === month && d.getFullYear() === year) {
          days.add(d.getDate());
        }
      });
      return days;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Distinct semester codes from all items */
export function useDormCalendarSemesters() {
  return useQuery<string[]>({
    queryKey: [QUERY_KEY, "semesters"],
    queryFn: async () => {
      const res = await fetch("/api/student/dorm-calendar?status=all&limit=200");
      if (!res.ok) return [];
      const items: DormCalendarItem[] = await res.json();
      const seen = new Set<string>();
      items.forEach((i) => { if (i.semester) seen.add(i.semester); });
      return [...seen].sort().reverse();
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Admin hooks ────────────────────────────────────────────

const ADMIN_KEY = "admin-dorm-calendar";

export function useAdminDormCalendarItems() {
  return useQuery<DormCalendarItem[]>({
    queryKey: [ADMIN_KEY],
    queryFn: async () => {
      const res = await fetch("/api/admin/dorm-calendar");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

export function useCreateDormCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<DormCalendarItem>) => {
      const res = await fetch("/api/admin/dorm-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_KEY] }),
  });
}

export function useUpdateDormCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DormCalendarItem> & { id: string }) => {
      const res = await fetch(`/api/admin/dorm-calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_KEY] }),
  });
}

export function useDeleteDormCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/dorm-calendar/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_KEY] }),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, userIds }: { itemId: string; userIds: string[] }) => {
      const res = await fetch(`/api/admin/dorm-calendar/${itemId}/mark-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_KEY] }),
  });
}
