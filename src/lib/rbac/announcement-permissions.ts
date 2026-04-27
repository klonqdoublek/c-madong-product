import { Permission } from "./permissions";
import { AppRole, ROLE_PERMISSIONS } from "./roles";

const LEGACY_ANNOUNCEMENT_MANAGER_ROLES = new Set([
  "admin",
  "staff",
  "head",
  "super_admin",
]);

function isAppRole(role: string): role is AppRole {
  return role in ROLE_PERMISSIONS;
}

export function hasAnnouncementPermission(
  role: string | null | undefined,
  permission: (typeof Permission)[keyof typeof Permission]
): boolean {
  if (!role) return false;
  if (LEGACY_ANNOUNCEMENT_MANAGER_ROLES.has(role)) return true;
  if (!isAppRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
