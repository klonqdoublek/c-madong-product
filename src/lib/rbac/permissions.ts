/**
 * RBAC Permissions for C-Madong Dormitory System
 *
 * Permission format: resource:action
 * Example: "students:view", "tickets:create"
 */

export const Permission = {
  // ============================================================================
  // Dashboard
  // ============================================================================
  DASHBOARD_VIEW: "dashboard:view",

  // ============================================================================
  // Students
  // ============================================================================
  STUDENTS_VIEW: "students:view",
  STUDENTS_EDIT: "students:edit",
  STUDENTS_ROOM: "students:room",
  STUDENTS_MOVE_IN_OUT: "students:move_in_out",
  STUDENTS_TAGS: "students:tags",
  STUDENTS_DELETE: "students:delete",

  // ============================================================================
  // Service Desk / Maintenance Tickets
  // ============================================================================
  TICKETS_VIEW_ALL: "tickets:view_all",
  TICKETS_VIEW_OWN: "tickets:view_own",
  TICKETS_VIEW_ASSIGNED: "tickets:view_assigned",
  TICKETS_CREATE: "tickets:create",
  TICKETS_UPDATE: "tickets:update",
  TICKETS_ASSIGN: "tickets:assign",
  TICKETS_ACCEPT: "tickets:accept",
  TICKETS_COMPLETE: "tickets:complete",
  TICKETS_CANCEL: "tickets:cancel",
  TICKETS_REPORT: "tickets:report",
  TICKETS_DELETE: "tickets:delete",

  // ============================================================================
  // Technicians
  // ============================================================================
  TECHNICIANS_VIEW: "technicians:view",
  TECHNICIANS_MANAGE: "technicians:manage",
  TECHNICIANS_MANAGE_SCHEDULE: "technicians:manage_schedule",

  // ============================================================================
  // Bills & Finance
  // ============================================================================
  BILLS_VIEW: "bills:view",
  BILLS_VIEW_OWN: "bills:view_own",
  BILLS_CREATE: "bills:create",
  BILLS_EDIT: "bills:edit",
  BILLS_DELETE: "bills:delete",
  BILLS_APPROVE: "bills:approve",
  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_RECORD: "payments:record",

  // ============================================================================
  // Parcels
  // ============================================================================
  PARCELS_VIEW: "parcels:view",
  PARCELS_VIEW_OWN: "parcels:view_own",
  PARCELS_REGISTER: "parcels:register",
  PARCELS_PICKUP: "parcels:pickup",
  PARCELS_NOTIFY: "parcels:notify",
  PARCELS_DELETE: "parcels:delete",

  // ============================================================================
  // Announcements & Broadcasts
  // ============================================================================
  ANNOUNCEMENTS_VIEW: "announcements:view",
  ANNOUNCEMENTS_CREATE: "announcements:create",
  ANNOUNCEMENTS_EDIT: "announcements:edit",
  ANNOUNCEMENTS_DELETE: "announcements:delete",
  ANNOUNCEMENTS_SCHEDULE: "announcements:schedule",
  ANNOUNCEMENTS_SEND: "announcements:send",
  ANNOUNCEMENTS_BROADCAST: "announcements:broadcast",

  // ============================================================================
  // Templates
  // ============================================================================
  TEMPLATES_VIEW: "templates:view",
  TEMPLATES_CREATE: "templates:create",
  TEMPLATES_EDIT: "templates:edit",
  TEMPLATES_DELETE: "templates:delete",
  TEMPLATES_USE: "templates:use",

  // ============================================================================
  // Events & Activities
  // ============================================================================
  EVENTS_VIEW: "events:view",
  EVENTS_CREATE: "events:create",
  EVENTS_EDIT: "events:edit",
  EVENTS_DELETE: "events:delete",
  EVENTS_ATTENDANCE: "events:attendance",

  // ============================================================================
  // Scores (Dorm Score / Activity Points)
  // ============================================================================
  SCORES_VIEW: "scores:view",
  SCORES_EDIT: "scores:edit",
  SCORES_DELETE: "scores:delete",

  // ============================================================================
  // Knowledge Base
  // ============================================================================
  KNOWLEDGE_VIEW: "knowledge:view",
  KNOWLEDGE_UPLOAD: "knowledge:upload",
  KNOWLEDGE_EDIT: "knowledge:edit",
  KNOWLEDGE_DELETE: "knowledge:delete",
  KNOWLEDGE_QUERY: "knowledge:query",

  // ============================================================================
  // Reports & Analytics
  // ============================================================================
  REPORTS_VIEW: "reports:view",
  REPORTS_VIEW_ALL: "reports:view_all",
  REPORTS_EXPORT: "reports:export",
  ANALYTICS_ADVANCED: "analytics:advanced",
  DATA_VIEW: "data:view",

  // ============================================================================
  // System & Settings
  // ============================================================================
  SYSTEM_SETTINGS: "system:settings",
  SYSTEM_ROLES: "system:roles",
  SYSTEM_HEALTH: "system:health",
  LOGS_VIEW: "logs:view",

  // ============================================================================
  // Profile (Self)
  // ============================================================================
  PROFILE_EDIT: "profile:edit",

  // ============================================================================
  // Chatbot
  // ============================================================================
  CHATBOT_REPLY: "chatbot:reply",
  CHATBOT_VIEW_HISTORY: "chatbot:view_history",

} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Permission groups for easier checking
export const PermissionGroup = {
  // Students management (full)
  STUDENTS_FULL: [
    Permission.STUDENTS_VIEW,
    Permission.STUDENTS_EDIT,
    Permission.STUDENTS_ROOM,
    Permission.STUDENTS_MOVE_IN_OUT,
    Permission.STUDENTS_TAGS,
  ] as const,

  // Students read-only
  STUDENTS_READ: [
    Permission.STUDENTS_VIEW,
  ] as const,

  // Tickets full management
  TICKETS_FULL: [
    Permission.TICKETS_VIEW_ALL,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_ASSIGN,
    Permission.TICKETS_CANCEL,
    Permission.TICKETS_DELETE,
  ] as const,

  // Tickets basic (view and update)
  TICKETS_BASIC: [
    Permission.TICKETS_VIEW_ALL,
    Permission.TICKETS_UPDATE,
  ] as const,

  // Tickets assigned only (for technicians)
  TICKETS_ASSIGNED: [
    Permission.TICKETS_VIEW_ASSIGNED,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_ACCEPT,
    Permission.TICKETS_COMPLETE,
  ] as const,

  // Finance full
  FINANCE_FULL: [
    Permission.BILLS_VIEW,
    Permission.BILLS_CREATE,
    Permission.BILLS_EDIT,
    Permission.BILLS_DELETE,
    Permission.BILLS_APPROVE,
    Permission.PAYMENTS_VIEW,
    Permission.PAYMENTS_RECORD,
  ] as const,

  // Parcels full
  PARCELS_FULL: [
    Permission.PARCELS_VIEW,
    Permission.PARCELS_REGISTER,
    Permission.PARCELS_PICKUP,
    Permission.PARCELS_NOTIFY,
    Permission.PARCELS_DELETE,
  ] as const,

  // Announcements full
  ANNOUNCEMENTS_FULL: [
    Permission.ANNOUNCEMENTS_VIEW,
    Permission.ANNOUNCEMENTS_CREATE,
    Permission.ANNOUNCEMENTS_EDIT,
    Permission.ANNOUNCEMENTS_DELETE,
    Permission.ANNOUNCEMENTS_SCHEDULE,
    Permission.ANNOUNCEMENTS_SEND,
    Permission.ANNOUNCEMENTS_BROADCAST,
  ] as const,

  // Announcements read-only
  ANNOUNCEMENTS_READ: [
    Permission.ANNOUNCEMENTS_VIEW,
  ] as const,

  // Events & Scores full
  ACTIVITY_FULL: [
    Permission.EVENTS_VIEW,
    Permission.EVENTS_CREATE,
    Permission.EVENTS_EDIT,
    Permission.EVENTS_DELETE,
    Permission.EVENTS_ATTENDANCE,
    Permission.SCORES_VIEW,
    Permission.SCORES_EDIT,
    Permission.SCORES_DELETE,
  ] as const,

  // System admin
  SYSTEM_ADMIN: [
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_ROLES,
    Permission.SYSTEM_HEALTH,
    Permission.LOGS_VIEW,
  ] as const,

  // Reports & Analytics
  REPORTS_FULL: [
    Permission.REPORTS_VIEW_ALL,
    Permission.REPORTS_EXPORT,
    Permission.ANALYTICS_ADVANCED,
    Permission.DATA_VIEW,
  ] as const,
} as const;
