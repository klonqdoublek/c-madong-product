/**
 * Hook for Role Management
 *
 * Provides functions to assign/revoke roles and fetch user roles
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { z } from "zod/v4";
import type { AppRole, BuildingScope } from "@/lib/supabase/types";

// ============================================================================
// Types
// ============================================================================

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: AppRole;
  building_scope: BuildingScope | null;
  granted_at: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  user: {
    id: string;
    full_name_th: string | null;
    full_name_en: string | null;
    student_id: string | null;
    email: string | null;
  };
  granted_by_user: {
    id: string;
    full_name_th: string | null;
    full_name_en: string | null;
  } | null;
}

// ============================================================================
// Schemas
// ============================================================================

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.custom<AppRole>(),
  buildingScope: z.custom<BuildingScope>().optional(),
});

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all roles (or filter by user_id) via API route (bypasses RLS)
 */
export function useRoles(userId?: string) {
  return useQuery({
    queryKey: ["admin", "roles", userId],
    queryFn: async () => {
      const params = userId ? `?userId=${userId}` : "";
      const res = await fetch(`/api/admin/roles${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch roles");
      }
      const { roles } = await res.json();
      return (roles ?? []) as UserRoleAssignment[];
    },
  });
}

/**
 * Fetch roles for a specific user via API route
 */
export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["admin", "roles", "user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/roles?userId=${userId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch user roles");
      }
      const { roles } = await res.json();
      return (roles ?? []) as UserRoleAssignment[];
    },
    enabled: !!userId,
  });
}

/**
 * Assign role to user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      role: AppRole;
      buildingScope?: BuildingScope;
    }) => {
      const validated = assignRoleSchema.parse(data);

      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "roles", "user"] });
    },
  });
}

/**
 * Revoke role from user
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userRoleId: string) => {
      const response = await fetch("/api/admin/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRoleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "roles", "user"] });
    },
  });
}

/**
 * Search users by name or student ID
 */
export function useUserSearch(query: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["admin", "users", "search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name_th, full_name_en, student_id, email, role")
        .or(
          `full_name_th.ilike.%${query}%,full_name_en.ilike.%${query}%,student_id.ilike.%${query}%,email.ilike.%${query}%`
        )
        .limit(20);

      if (error) throw error;
      return data ?? [];
    },
    enabled: query.length >= 2,
  });
}
