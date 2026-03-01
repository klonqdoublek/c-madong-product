# RBAC Implementation Summary

## 📋 Overview

RBAC (Role-Based Access Control) system implemented for C-Madong dormitory management system with 12 roles and granular permissions.

## 🗄️ Database Migration

**File:** `supabase/migrations/20260303_rbac_system.sql`

### Tables Created
- `user_roles` - Many-to-many relationship between users and roles
  - Supports multiple roles per user
  - Building scope for registrars (8 options)
  - Audit trail (granted_by, granted_at)

### Types Created
- `app_role` - 12 role types
- `building_code` - 5 buildings (chumpee, chumpa, pudson, pudtan, chuanchom)
- `building_scope` - 8 scope options for registrars

### Functions Created
- `get_user_roles(user_id)` - Get all active roles for a user
- `has_role(user_id, role, scope?)` - Check if user has specific role
- `has_building_access(user_id, building)` - Check registrar access
- `get_registrar_students(registrar_id)` - Get filtered students by scope

## 📁 Files Created

### Core RBAC (`src/lib/rbac/`)
- `permissions.ts` - 80+ permission constants
- `roles.ts` - Role definitions, metadata, and permission mappings
- `checks.ts` - Permission checking functions
- `index.ts` - Barrel exports

### Components (`src/components/rbac/`)
- `permission-guard.tsx` - PermissionGuard, RoleGuard, and specialized guards
- `role-badge.tsx` - RoleBadge, RoleBadgeList, RoleSelector, BuildingScopeSelector
- `index.ts` - Barrel exports

### Hooks (`src/hooks/`)
- `use-permissions.ts` - usePermissions(), useRoles(), useBuildingScope()

### Types Updated (`src/lib/supabase/types.ts`)
- Added `AppRole` type (12 roles)
- Added `BuildingCode` type (5 buildings)
- Added `BuildingScope` type (8 scopes)
- Kept `UserRole` as alias for backwards compatibility

### Messages Updated
- `src/messages/th.json` - Thai RBAC translations
- `src/messages/en.json` - English RBAC translations

## 🎯 12 Roles Defined

| # | Code | ชื่อไทย | Level | Building Scope |
|---|------|----------|-------|----------------|
| 1 | `super_admin` | ผอ.หอพัก / ผู้ดูแลระบบ | 1 | No |
| 2 | `head` | หัวหน้ากลุ่มภารกิจหอพักนิสิต | 2 | No |
| 3 | `registrar` | เจ้าหน้าที่ทะเบียน | 3 | Yes (8 scopes) |
| 3 | `finance` | เจ้าหน้าที่การเงิน | 3 | No |
| 3 | `parcel` | เจ้าหน้าที่พัสดุ | 3 | No |
| 3 | `admin_staff` | ธุรการหอพัก | 3 | No |
| 3 | `service` | เจ้าหน้าที่บริการทั่วไป (2 คน) | 3 | No |
| 3 | `activity` | เจ้าหน้าที่กิจกรรม | 3 | No |
| 4 | `technician_head` | หัวหน้าช่างหอพัก | 4 | No |
| 4 | `technician` | ช่างหอพัก (6 คน + เบอร์ 24 ชม.) | 4 | No |
| 4 | `technician_it` | ช่างไอที / ดูแลระบบ | 4 | No |
| 5 | `committee` | กรรมการนิสิตหอพัก | 5 | No |
| 6 | `student` | นิสิตหอพัก | 6 | No |

## 🏢 Building Scopes (for Registrars)

| Scope | Description | Buildings |
|-------|-------------|-----------|
| `chumpee` | จำปี (เฉพาะอาคาร) | Chumpee |
| `chumpa` | จำปา (เฉพาะอาคาร) | Chumpa |
| `pudson` | พุดซ้อน (เฉพาะอาคาร) | Pudson |
| `pudtan` | พุดตาน (เฉพาะอาคาร) | Pudtan |
| `chuanchom` | ชวนชม (เฉพาะอาคาร) | Chuanchom |
| `male` | หอพักชาย | Chumpee + Chumpa |
| `female` | หอพักหญิง | Pudson + Pudtan |
| `all` | ทุกอาคาร | All 5 buildings |

## 🔐 Permissions (80+)

Organized by feature:
- **Dashboard** - 1 permission
- **Students** - 6 permissions
- **Service Desk/Tickets** - 11 permissions
- **Technicians** - 3 permissions
- **Bills & Finance** - 7 permissions
- **Parcels** - 5 permissions
- **Announcements** - 6 permissions
- **Templates** - 4 permissions
- **Events & Activities** - 7 permissions
- **Knowledge Base** - 5 permissions
- **Reports & Analytics** - 4 permissions
- **System & Settings** - 4 permissions
- **Profile** - 1 permission
- **Chatbot** - 2 permissions

## 💻 Usage Examples

### PermissionGuard Component
```tsx
import { PermissionGuard } from "@/components/rbac";
import { Permission } from "@/lib/rbac";

// Single permission check
<PermissionGuard permission={Permission.STUDENTS_EDIT}>
  <EditStudentButton />
</PermissionGuard>

// With fallback
<PermissionGuard
  permission={Permission.TICKETS_ASSIGN}
  fallback={<p>You don't have permission</p>}
>
  <AssignTechnicianDropdown />
</PermissionGuard>

// Role-based
<RoleGuard roles={["registrar", "head"]}>
  <RegistrarPanel />
</RoleGuard>
```

### usePermissions Hook
```tsx
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac";

function MyComponent() {
  const { can, is, isSuperAdmin } = usePermissions();

  if (isSuperAdmin()) {
    // Show admin-only features
  }

  if (can("students:edit")) {
    return <EditButton />;
  }

  if (is("registrar")) {
    return <RegistrarDashboard />;
  }

  return <AccessDenied />;
}
```

### RoleBadge Display
```tsx
import { RoleBadge, RoleBadgeList } from "@/components/rbac";

// Single role badge
<RoleBadge role="registrar" showDescription />

// Multiple roles
<RoleBadgeList roles={["registrar", "activity"]} />
```

### Role Selector (for admin)
```tsx
import { RoleSelector, BuildingScopeSelector } from "@/components/rbac";

<RoleSelector
  value={selectedRole}
  onChange={setSelectedRole}
  exclude={["student", "committee"]}
/>

<BuildingScopeSelector
  value={scope}
  onChange={setScope}
/>
```

## 🚀 Next Steps

1. **Deploy Migration**
   ```bash
   supabase db push
   ```

2. **Update usePermissions Hook**
   - Fetch from `user_roles` table instead of `profile.role`
   - Handle multiple roles per user
   - Add building scope for registrars

3. **Create Role Management UI**
   - Admin page to assign/revoke roles
   - Audit log for role changes
   - Building scope selector for registrars

4. **Update Middleware**
   - Add permission checks for route protection
   - Handle building-scoped access

5. **Update Existing Pages**
   - Add PermissionGuard to sensitive operations
   - Hide/show nav items based on permissions
   - Filter data based on building scope

6. **Testing**
   - Test each role's access
   - Test building scope filtering
   - Test multi-role scenarios

## 📝 Notes

- Backwards compatible: existing `profile.role` still works
- After migration: fetch from `user_roles` table for multi-role support
- Committee role can view announcements (as requested)
- Building names corrected: Chumpee, Chumpa, Pudson, Pudtan, Chuanchom
