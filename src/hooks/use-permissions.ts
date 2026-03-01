/**
 * React Hook for RBAC Permissions
 *
 * Usage:
 * ```tsx
 * const { can, is, isSuperAdmin } = usePermissions();
 *
 * if (can("students:edit")) {
 *   // Show edit button
 * }
 *
 * if (is("registrar")) {
 *   // Show registrar-specific UI
 * }
 * ```
 *
 * NOTE: Currently uses profile.role. After RBAC migration deployment,
 * this will fetch from user_roles table for multi-role support.
 */

"use client";

import { useMemo } from "react";
import { useUser } from "./use-user";
import { createPermissionChecker, UsePermissionsReturn } from "@/lib/rbac";
import type { AppRole } from "@/lib/supabase/types";

export function usePermissions(): UsePermissionsReturn {
  const { profile } = useUser();

  // Get user roles from profile
  // TODO: After RBAC migration, fetch from user_roles table via API
  const userRoles = useMemo(() => {
    if (!profile) return [];
    // Use the single role from profile for now
    // After migration: fetch({ query: getUserRoles, variables: { userId } })
    return [profile.role as AppRole];
  }, [profile]);

  // Create permission checker
  return useMemo(() => {
    return createPermissionChecker(userRoles);
  }, [userRoles]);
}

/**
 * Hook to get user's roles list
 *
 * Returns array of AppRole (for multi-role support after migration)
 */
export function useRoles(): AppRole[] {
  const { profile } = useUser();

  return useMemo(() => {
    if (!profile) return [];
    // TODO: After RBAC migration, fetch from user_roles table
    return [profile.role as AppRole];
  }, [profile]);
}

/**
 * Hook to get user's building scope (for registrars)
 *
 * Returns the building scope if user is a registrar, null otherwise
 */
export function useBuildingScope() {
  const { profile } = useUser();

  return useMemo(() => {
    if (!profile) return null;
    // TODO: After RBAC migration, fetch building_scope from user_roles table
    return null; // Will be: "chumpee" | "chumpa" | "pudson" | "pudtan" | "chuanchom" | "male" | "female" | "all"
  }, [profile]);
}
