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

// Map legacy profiles.role values to RBAC AppRole
const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  admin: "super_admin",
  staff: "admin_staff",
};

function mapLegacyRole(role: string): AppRole {
  return LEGACY_ROLE_MAP[role] ?? (role as AppRole);
}

export function usePermissions(): UsePermissionsReturn {
  const { profile } = useUser();

  const userRoles = useMemo(() => {
    if (!profile) return [];
    return [mapLegacyRole(profile.role)];
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
    return [mapLegacyRole(profile.role)];
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
