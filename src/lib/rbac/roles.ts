/**
 * RBAC Role Definitions for C-Madong Dormitory System
 *
 * 12 Roles with granular permissions based on actual dormitory structure
 */

import { Permission, PermissionGroup } from "./permissions";

// ============================================================================
// Types
// ============================================================================

export type AppRole =
  | "super_admin"     // ผอ.หอพัก / ผู้ดูแลระบบ
  | "head"            // หัวหน้ากลุ่มภารกิจหอพักนิสิต
  | "registrar"       // เจ้าหน้าที่ทะเบียน
  | "finance"         // เจ้าหน้าที่การเงิน
  | "parcel"          // เจ้าหน้าที่พัสดุ
  | "admin_staff"     // ธุรการหอพัก
  | "service"         // เจ้าหน้าที่บริการทั่วไป
  | "activity"        // เจ้าหน้าที่กิจกรรม
  | "technician_head" // หัวหน้าช่างหอพัก
  | "technician"      // ช่างหอพัก
  | "technician_it"   // ช่างไอที / ดูแลระบบ
  | "committee"       // กรรมการนิสิตหอพัก
  | "student";        // นิสิตหอพัก

export type BuildingScope =
  | "chumpee"    // จำปี (เฉพาะอาคาร)
  | "chumpa"     // จำปา (เฉพาะอาคาร)
  | "pudson"     // พุดซ้อน (เฉพาะอาคาร)
  | "pudtan"     // พุดตาน (เฉพาะอาคาร)
  | "chuanchom"  // ชวนชม (เฉพาะอาคาร)
  | "male"       // หอพักชาย (Chumpee + Chumpa)
  | "female"     // หอพักหญิง (Pudson + Pudtan)
  | "all";       // ทุกอาคาร

// ============================================================================
// Role Metadata
// ============================================================================

export interface RoleInfo {
  code: AppRole;
  nameTh: string;
  nameEn: string;
  description: string;
  level: number; // 1-6, higher = more privileges
  requiresBuildingScope: boolean; // For registrars
}

export const ROLE_INFO: Record<AppRole, RoleInfo> = {
  super_admin: {
    code: "super_admin",
    nameTh: "ผอ.หอพัก / ผู้ดูแลระบบ",
    nameEn: "Super Admin",
    description: "ทำได้ทุกอย่าง รวมจัดการผู้ใช้งานและตั้งค่าระบบ",
    level: 1,
    requiresBuildingScope: false,
  },
  head: {
    code: "head",
    nameTh: "หัวหน้ากลุ่มภารกิจหอพักนิสิต",
    nameEn: "Head of Dormitory Operations",
    description: "จัดการทั้งหมด ยกเว้นตั้งค่าระบบ/จัดการ Role",
    level: 2,
    requiresBuildingScope: false,
  },
  registrar: {
    code: "registrar",
    nameTh: "เจ้าหน้าที่ทะเบียนหอพักนิสิต",
    nameEn: "Registrar",
    description: "จัดการข้อมูลนิสิต ห้อง การเข้าพัก (ตามอาคารที่รับผิดชอบ)",
    level: 3,
    requiresBuildingScope: true,
  },
  finance: {
    code: "finance",
    nameTh: "เจ้าหน้าที่การเงินหอพัก",
    nameEn: "Finance Officer",
    description: "จัดการบิล ค่าน้ำ-ค่าไฟ ค่าเช่า",
    level: 3,
    requiresBuildingScope: false,
  },
  parcel: {
    code: "parcel",
    nameTh: "เจ้าหน้าที่พัสดุหอพัก",
    nameEn: "Parcel Officer",
    description: "รับ-จ่าย พัสดุ บันทึกเข้า-ออก",
    level: 3,
    requiresBuildingScope: false,
  },
  admin_staff: {
    code: "admin_staff",
    nameTh: "ธุรการหอพัก",
    nameEn: "Admin Staff",
    description: "งานเอกสาร รับ-ส่งเรื่อง ประสานงาน (read-only)",
    level: 3,
    requiresBuildingScope: false,
  },
  service: {
    code: "service",
    nameTh: "เจ้าหน้าที่บริการทั่วไป",
    nameEn: "Service Officer",
    description: "รับเรื่องร้องเรียน ตอบ LINE",
    level: 3,
    requiresBuildingScope: false,
  },
  activity: {
    code: "activity",
    nameTh: "เจ้าหน้าที่กิจกรรมหอพัก",
    nameEn: "Activity Officer",
    description: "จัดกิจกรรม บันทึกคะแนนกิจกรรม",
    level: 3,
    requiresBuildingScope: false,
  },
  technician_head: {
    code: "technician_head",
    nameTh: "หัวหน้าช่างหอพักนิสิต",
    nameEn: "Head Technician",
    description: "ดูงานทั้งหมด จัดตารางช่าง มอบหมายงาน",
    level: 4,
    requiresBuildingScope: false,
  },
  technician: {
    code: "technician",
    nameTh: "ช่างหอพักนิสิต",
    nameEn: "Technician",
    description: "เห็นงานที่ได้รับมอบหมาย เบอร์กลาง 24 ชม.",
    level: 4,
    requiresBuildingScope: false,
  },
  technician_it: {
    code: "technician_it",
    nameTh: "ช่างไอที / ดูแลระบบ",
    nameEn: "IT Technician",
    description: "ดูแลระบบ วิเคราะห์ข้อมูล รายงาน",
    level: 4,
    requiresBuildingScope: false,
  },
  committee: {
    code: "committee",
    nameTh: "กรรมการนิสิตหอพัก",
    nameEn: "Student Committee",
    description: "ติดตามปัญหา ดูงานแจ้งซ่อม รายงานปัญหา ดูประกาศ",
    level: 5,
    requiresBuildingScope: false,
  },
  student: {
    code: "student",
    nameTh: "นิสิตหอพัก",
    nameEn: "Student",
    description: "ใช้งานหน้า student จัดการข้อมูลตัวเอง",
    level: 6,
    requiresBuildingScope: false,
  },
};

// ============================================================================
// Role to Permissions Mapping
// ============================================================================

export const ROLE_PERMISSIONS: Record<AppRole, readonly string[]> = {
  // Level 1: Super Admin (ALL permissions)
  super_admin: Object.values(Permission),

  // Level 2: Head (everything except system settings/role management)
  head: [
    Permission.DASHBOARD_VIEW,
    // Students (full)
    ...PermissionGroup.STUDENTS_FULL,
    // Tickets (full)
    ...PermissionGroup.TICKETS_FULL,
    // Technicians
    Permission.TECHNICIANS_VIEW,
    Permission.TECHNICIANS_MANAGE,
    Permission.TECHNICIANS_MANAGE_SCHEDULE,
    // Bills (view only)
    Permission.BILLS_VIEW,
    Permission.PAYMENTS_VIEW,
    // Parcels (full)
    ...PermissionGroup.PARCELS_FULL,
    // Announcements (full)
    ...PermissionGroup.ANNOUNCEMENTS_FULL,
    // Templates
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_CREATE,
    Permission.TEMPLATES_EDIT,
    Permission.TEMPLATES_DELETE,
    // Events & Scores (full)
    ...PermissionGroup.ACTIVITY_FULL,
    // Knowledge (full)
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_UPLOAD,
    Permission.KNOWLEDGE_EDIT,
    Permission.KNOWLEDGE_DELETE,
    Permission.KNOWLEDGE_QUERY,
    // Reports
    Permission.REPORTS_VIEW_ALL,
    Permission.REPORTS_EXPORT,
    Permission.ANALYTICS_ADVANCED,
    // Chatbot
    Permission.CHATBOT_REPLY,
    Permission.CHATBOT_VIEW_HISTORY,
  ],

  // Level 3: Registrar (student management, scoped by building)
  registrar: [
    Permission.DASHBOARD_VIEW,
    // Students (full, but scoped by building)
    ...PermissionGroup.STUDENTS_FULL,
    // Tickets (read-only for context)
    Permission.TICKETS_VIEW_ALL,
    // Bills (view for context)
    Permission.BILLS_VIEW,
    // Announcements (create for building announcements)
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    Permission.ANNOUNCEMENTS_EDIT,
    Permission.ANNOUNCEMENTS_DELETE,
    // Templates (use for announcements)
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_USE,
    // Events (view)
    Permission.EVENTS_VIEW,
    // Scores (view)
    Permission.SCORES_VIEW,
    // Reports (student reports)
    Permission.REPORTS_VIEW,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_QUERY,
  ],

  // Level 3: Finance (bills & payments)
  finance: [
    Permission.DASHBOARD_VIEW,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Tickets (view for context)
    Permission.TICKETS_VIEW_ALL,
    // Bills (full)
    ...PermissionGroup.FINANCE_FULL,
    // Parcels (view for context)
    Permission.PARCELS_VIEW,
    // Announcements
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    // Templates
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_USE,
    // Reports (finance reports)
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
  ],

  // Level 3: Parcel (parcels management)
  parcel: [
    Permission.DASHBOARD_VIEW,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Tickets (view for context)
    Permission.TICKETS_VIEW_ALL,
    // Bills (view for context)
    Permission.BILLS_VIEW,
    // Parcels (full)
    ...PermissionGroup.PARCELS_FULL,
    // Announcements
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    // Templates
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_USE,
    // Reports (parcel reports)
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
  ],

  // Level 3: Admin Staff (read-only mostly)
  admin_staff: [
    Permission.DASHBOARD_VIEW,
    // Students (view only)
    ...PermissionGroup.STUDENTS_READ,
    // Tickets (view only)
    Permission.TICKETS_VIEW_ALL,
    // Bills (view only)
    Permission.BILLS_VIEW,
    // Parcels (view only)
    Permission.PARCELS_VIEW,
    // Announcements (view only)
    ...PermissionGroup.ANNOUNCEMENTS_READ,
    // Events (view only)
    Permission.EVENTS_VIEW,
    // Reports (view)
    Permission.REPORTS_VIEW,
    // Knowledge (view)
    Permission.KNOWLEDGE_VIEW,
  ],

  // Level 3: Service (tickets + chatbot)
  service: [
    Permission.DASHBOARD_VIEW,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Tickets (full management)
    ...PermissionGroup.TICKETS_FULL,
    // Technicians (view & assign)
    Permission.TECHNICIANS_VIEW,
    // Bills (view for context)
    Permission.BILLS_VIEW,
    // Parcels (view for context)
    Permission.PARCELS_VIEW,
    // Announcements (can create service announcements)
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    Permission.ANNOUNCEMENTS_SEND,
    // Templates
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_USE,
    // Chatbot (reply)
    Permission.CHATBOT_REPLY,
    Permission.CHATBOT_VIEW_HISTORY,
    // Reports
    Permission.REPORTS_VIEW_ALL,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_QUERY,
  ],

  // Level 3: Activity (events & scores)
  activity: [
    Permission.DASHBOARD_VIEW,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Tickets (view for context)
    Permission.TICKETS_VIEW_ALL,
    // Events & Scores (full)
    ...PermissionGroup.ACTIVITY_FULL,
    // Announcements (event announcements)
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    // Templates
    Permission.TEMPLATES_VIEW,
    Permission.TEMPLATES_USE,
    // Reports
    Permission.REPORTS_VIEW,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
  ],

  // Level 4: Technician Head (manage technicians + tickets)
  technician_head: [
    Permission.DASHBOARD_VIEW,
    // Tickets (full view & update)
    Permission.TICKETS_VIEW_ALL,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_ASSIGN,
    Permission.TICKETS_COMPLETE,
    // Technicians (full management)
    Permission.TECHNICIANS_VIEW,
    Permission.TECHNICIANS_MANAGE,
    Permission.TECHNICIANS_MANAGE_SCHEDULE,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Announcements (view)
    Permission.ANNOUNCEMENTS_VIEW,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_QUERY,
  ],

  // Level 4: Technician (assigned tickets only)
  technician: [
    Permission.DASHBOARD_VIEW,
    // Tickets (assigned only)
    ...PermissionGroup.TICKETS_ASSIGNED,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
    // Announcements (view)
    Permission.ANNOUNCEMENTS_VIEW,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_QUERY,
  ],

  // Level 4: IT Technician (system + analytics)
  technician_it: [
    Permission.DASHBOARD_VIEW,
    // Tickets (full view & update)
    Permission.TICKETS_VIEW_ALL,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_ASSIGN,
    // Technicians (manage)
    Permission.TECHNICIANS_VIEW,
    Permission.TECHNICIANS_MANAGE,
    // System
    Permission.SYSTEM_HEALTH,
    Permission.LOGS_VIEW,
    // Analytics & Reports
    ...PermissionGroup.REPORTS_FULL,
    Permission.DATA_VIEW,
    // Students (view)
    Permission.STUDENTS_VIEW,
    // Bills (view)
    Permission.BILLS_VIEW,
    Permission.PAYMENTS_VIEW,
    // Parcels (view)
    Permission.PARCELS_VIEW,
    // Announcements
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    // Knowledge
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_UPLOAD,
    Permission.KNOWLEDGE_EDIT,
    Permission.KNOWLEDGE_QUERY,
  ],

  // Level 5: Committee (view + report)
  committee: [
    Permission.DASHBOARD_VIEW,
    // Tickets (view all + report)
    Permission.TICKETS_VIEW_ALL,
    Permission.TICKETS_REPORT,
    // Announcements (view)
    Permission.ANNOUNCEMENTS_VIEW,
    // Events (view)
    Permission.EVENTS_VIEW,
    // Reports (view)
    Permission.REPORTS_VIEW,
    // Students (view for context)
    Permission.STUDENTS_VIEW,
  ],

  // Level 6: Student (own data only)
  student: [
    // Tickets (own only)
    Permission.TICKETS_VIEW_OWN,
    Permission.TICKETS_CREATE,
    // Bills (own only)
    Permission.BILLS_VIEW_OWN,
    // Parcels (own only)
    Permission.PARCELS_VIEW_OWN,
    // Profile
    Permission.PROFILE_EDIT,
    // Announcements (view)
    Permission.ANNOUNCEMENTS_VIEW,
    // Events (view)
    Permission.EVENTS_VIEW,
    // Scores (view own)
    Permission.SCORES_VIEW,
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: AppRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AppRole): readonly string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Get role info
 */
export function getRoleInfo(role: AppRole): RoleInfo {
  return ROLE_INFO[role];
}

/**
 * Sort roles by level (highest privileges first)
 */
export function sortRolesByLevel(roles: AppRole[]): AppRole[] {
  return roles.sort((a, b) => ROLE_INFO[a].level - ROLE_INFO[b].level);
}

/**
 * Get the highest level role from a list
 */
export function getHighestRole(roles: AppRole[]): AppRole | null {
  if (roles.length === 0) return null;
  return sortRolesByLevel(roles)[0];
}
