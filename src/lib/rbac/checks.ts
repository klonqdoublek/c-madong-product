/**
 * RBAC Permission Checks for C-Madong
 *
 * Helper functions to check user permissions
 */

import { Permission } from "./permissions";
import { AppRole, ROLE_PERMISSIONS } from "./roles";

// ============================================================================
// Permission Check Result
// ============================================================================

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  role?: AppRole;
}

// ============================================================================
// Permission Checking Functions
// ============================================================================

/**
 * Check if a list of roles includes a specific permission
 */
export function hasPermission(
  roles: AppRole[],
  permission: string
): PermissionCheckResult {
  if (!roles || roles.length === 0) {
    return { allowed: false, reason: "No roles assigned" };
  }

  // Check each role for the permission
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions?.includes(permission)) {
      return { allowed: true, role };
    }
  }

  return {
    allowed: false,
    reason: `Permission '${permission}' not granted to any of roles: ${roles.join(", ")}`,
  };
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(
  roles: AppRole[],
  permissions: string[]
): PermissionCheckResult {
  for (const permission of permissions) {
    const result = hasPermission(roles, permission);
    if (!result.allowed) {
      return result;
    }
  }
  return { allowed: true };
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
  roles: AppRole[],
  permissions: string[]
): PermissionCheckResult {
  for (const permission of permissions) {
    const result = hasPermission(roles, permission);
    if (result.allowed) {
      return { allowed: true, role: result.role };
    }
  }
  return {
    allowed: false,
    reason: `None of the permissions granted: ${permissions.join(", ")}`,
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(roles: AppRole[], targetRole: AppRole): boolean {
  return roles.includes(targetRole);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: AppRole[], targetRoles: AppRole[]): boolean {
  return targetRoles.some((r) => roles.includes(r));
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(roles: AppRole[]): boolean {
  return hasRole(roles, "super_admin");
}

/**
 * Check if user is head or higher
 */
export function isHeadOrHigher(roles: AppRole[]): boolean {
  return hasAnyRole(roles, ["super_admin", "head"]);
}

/**
 * Check if user is admin staff (super_admin, head, or any specialist)
 */
export function isAdminStaff(roles: AppRole[]): boolean {
  return hasAnyRole(roles, [
    "super_admin",
    "head",
    "registrar",
    "finance",
    "parcel",
    "admin_staff",
    "service",
    "activity",
  ]);
}

/**
 * Check if user is technician (any type)
 */
export function isTechnician(roles: AppRole[]): boolean {
  return hasAnyRole(roles, ["technician_head", "technician", "technician_it"]);
}

// ============================================================================
// Permission Guard Helpers
// ============================================================================

/**
 * Create a permission checker function for client-side use
 */
export function createPermissionChecker(roles: AppRole[]) {
  return {
    /**
     * Check if has permission
     */
    can: (permission: string): boolean => {
      return hasPermission(roles, permission).allowed;
    },

    /**
     * Check if has all permissions
     */
    canAll: (permissions: string[]): boolean => {
      return hasAllPermissions(roles, permissions).allowed;
    },

    /**
     * Check if has any permission
     */
    canAny: (permissions: string[]): boolean => {
      return hasAnyPermission(roles, permissions).allowed;
    },

    /**
     * Check if has role
     */
    is: (role: AppRole): boolean => {
      return hasRole(roles, role);
    },

    /**
     * Check if has any role
     */
    isAny: (targetRoles: AppRole[]): boolean => {
      return hasAnyRole(roles, targetRoles);
    },

    /**
     * Is super admin?
     */
    isSuperAdmin: () => isSuperAdmin(roles),

    /**
     * Is head or higher?
     */
    isHeadOrHigher: () => isHeadOrHigher(roles),

    /**
     * Is admin staff?
     */
    isAdminStaff: () => isAdminStaff(roles),

    /**
     * Is technician?
     */
    isTechnician: () => isTechnician(roles),
  };
}

// ============================================================================
// React Hook Helper Types
// ============================================================================

export type UsePermissionsReturn = ReturnType<typeof createPermissionChecker>;
