/**
 * RoleBadge Component
 *
 * Display user role with appropriate styling
 */

import { RoleInfo, ROLE_INFO, AppRole } from "@/lib/rbac";

interface RoleBadgeProps {
  role: AppRole;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

const ROLE_COLORS: Record<AppRole, string> = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-200",
  head: "bg-red-100 text-red-800 border-red-200",
  registrar: "bg-blue-100 text-blue-800 border-blue-200",
  finance: "bg-green-100 text-green-800 border-green-200",
  parcel: "bg-yellow-100 text-yellow-800 border-yellow-200",
  admin_staff: "bg-gray-100 text-gray-800 border-gray-200",
  service: "bg-orange-100 text-orange-800 border-orange-200",
  activity: "bg-pink-100 text-pink-800 border-pink-200",
  technician_head: "bg-cyan-100 text-cyan-800 border-cyan-200",
  technician: "bg-teal-100 text-teal-800 border-teal-200",
  technician_it: "bg-indigo-100 text-indigo-800 border-indigo-200",
  committee: "bg-lime-100 text-lime-800 border-lime-200",
  student: "bg-slate-100 text-slate-800 border-slate-200",
};

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function RoleBadge({
  role,
  showDescription = false,
  size = "md",
}: RoleBadgeProps) {
  const info: RoleInfo = ROLE_INFO[role];

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full border font-medium ${ROLE_COLORS[role]} ${SIZE_CLASSES[size]}`}
      >
        {info.nameTh}
      </span>
      {showDescription && (
        <p className="text-xs text-muted-foreground">{info.description}</p>
      )}
    </div>
  );
}

interface RoleBadgeListProps {
  roles: AppRole[];
  size?: "sm" | "md" | "lg";
}

export function RoleBadgeList({ roles, size = "sm" }: RoleBadgeListProps) {
  if (!roles || roles.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">ไม่มีตำแหน่ง</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} size={size} />
      ))}
    </div>
  );
}

/**
 * Role selector for admin use
 */
interface RoleSelectorProps {
  value?: AppRole;
  onChange: (role: AppRole) => void;
  exclude?: AppRole[];
  label?: string;
}

export function RoleSelector({
  value,
  onChange,
  exclude = [],
  label = "เลือกตำแหน่ง",
}: RoleSelectorProps) {
  const allRoles: AppRole[] = [
    "super_admin",
    "head",
    "registrar",
    "finance",
    "parcel",
    "admin_staff",
    "service",
    "activity",
    "technician_head",
    "technician",
    "technician_it",
    "committee",
    "student",
  ];

  const availableRoles = allRoles.filter((r) => !exclude.includes(r));

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AppRole)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">-- เลือก --</option>
        {availableRoles.map((role) => {
          const info = ROLE_INFO[role];
          return (
            <option key={role} value={role}>
              {info.nameTh} ({info.nameEn})
            </option>
          );
        })}
      </select>
    </div>
  );
}

/**
 * Building scope selector for registrars
 */
interface BuildingScopeSelectorProps {
  value?: string;
  onChange: (scope: string) => void;
  label?: string;
}

export function BuildingScopeSelector({
  value,
  onChange,
  label = "ขอบเขตอาคาร",
}: BuildingScopeSelectorProps) {
  const scopes = [
    { value: "chumpee", label: "จำปี (Chumpee)" },
    { value: "chumpa", label: "จำปา (Chumpa)" },
    { value: "pudson", label: "พุดซ้อน (Pudson)" },
    { value: "pudtan", label: "พุดตาน (Pudtan)" },
    { value: "chuanchom", label: "ชวนชม (Chuanchom)" },
    { value: "male", label: "หอพักชาย (จำปี-จำปา)" },
    { value: "female", label: "หอพักหญิง (พุดซ้อน-พุดตาน)" },
    { value: "all", label: "ทุกอาคาร" },
  ];

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">-- เลือก --</option>
        {scopes.map((scope) => (
          <option key={scope.value} value={scope.value}>
            {scope.label}
          </option>
        ))}
      </select>
    </div>
  );
}
