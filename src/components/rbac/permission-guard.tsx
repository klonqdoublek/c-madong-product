/**
 * PermissionGuard Component
 *
 * Conditionally render children based on user permissions
 *
 * @example
 * ```tsx
 * <PermissionGuard permission={Permission.STUDENTS_EDIT}>
 *   <EditStudentButton />
 * </PermissionGuard>
 *
 * <PermissionGuard
 *   permission={Permission.STUDENTS_EDIT}
 *   fallback={<AccessDeniedMessage />}
 * >
 *   <EditStudentButton />
 * </PermissionGuard>
 *
 * <PermissionGuard role="registrar">
 *   <RegistrarOnlyContent />
 * </PermissionGuard>
 * ```
 */

"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  role?: string;
  roles?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // For multiple permissions, require all (default: any)
}

export function PermissionGuard({
  children,
  permission,
  role,
  roles,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const perms = usePermissions();

  // Check role-based access
  if (role && !perms.is(role as any)) {
    return <>{fallback}</>;
  }

  // Check roles-based access
  if (roles && !perms.isAny(roles as any[])) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission) {
    const hasPermission = perms.can(permission);

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Show children only if user has at least one of the specified roles
 */
export function RoleGuard({
  children,
  roles,
  fallback = null,
}: {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}) {
  const perms = usePermissions();

  if (!perms.isAny(roles as any[])) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show children only if user is super admin
 */
export function SuperAdminGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const perms = usePermissions();

  if (!perms.isSuperAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show children only if user is head or higher
 */
export function HeadGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const perms = usePermissions();

  if (!perms.isHeadOrHigher()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show children only if user is admin staff
 */
export function AdminStaffGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const perms = usePermissions();

  if (!perms.isAdminStaff()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show children only if user is technician
 */
export function TechnicianGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const perms = usePermissions();

  if (!perms.isTechnician()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
