# Project Context

## About the User
- **Name**: Khaoklong
- **Role**: UX/UI and Product Designer
- **Goal**: Building a digital product

## Recent Changes (2026-03-24)

### Student Profile Page — 3 Figma Designs

- **Profile Main** (`/profile`): Avatar + name + room/building + faculty badge + stats (days in dorm, events attended) + score summary (stacked bar) + settings link
- **Settings** (`/profile/settings`): 3 grouped sections (General, Support, Permissions) + 3 toggle switches (local state) + logout
- **Digital ID Card** (`/profile/dorm-card`): Rotated card image + pink blur shadow + fullscreen lightbox modal + report lost/history menus
- **Components**: 7 files in `src/components/student/profile/` — profile-content, profile-info-card, profile-stats-section, profile-score-section, settings-content, settings-menu-item, dorm-card-content
- **Routes**: Updated `(student)/profile/page.tsx`, NEW `profile/settings/page.tsx`, NEW `profile/dorm-card/page.tsx`
- **i18n**: 30+ new keys in `profile` namespace (th.json + en.json)
- **Data**: Real data from `useUser()`, `useBuildings()`, `useRooms()`, `useBeds()`, `useMyScore()`, `useMyAttendance()`; mockup for faculty, stats denominators, toggle persistence
- **Design tokens**: Gradient bg `from-white to-[#f5f2ea]`, card shadow, CU Pink palette, score bar colors (mandatory=#DD598B, external=#FFF3D2, internal=#CFFFCD)

---

## Changes (2026-03-22)

### Knowledge Base v3 — Full Rewrite

- **2-panel layout**: Collapsible nested sidebar (280px ↔ 52px icon strip) + main content area
- **Admin sidebar auto-collapse**: pathname `/admin/knowledge-base` triggers collapsed 60px icon-only mode via `ui-store.adminSidebarCollapsed`
- **Folder CRUD**: Hierarchical `knowledge_folders` table, tree view with context menu, 6 seed folders
- **Document tags**: Many-to-many via `document_tag_assignments`, 10 color presets, tag management dialog
- **File table**: Checkbox selection, type badges, version, status, sort by date/name, filter by status/tag
- **Bulk actions**: Move, delete, tag, reprocess via `/api/admin/knowledge/documents/bulk`
- **File detail**: Document preview + metadata + per-document Q&A (RAG scoped to single doc)
- **Migration**: `20260324_knowledge_folders_tags.sql` — `knowledge_folders`, `document_tags`, `document_tag_assignments` + `folder_id`/`version` on `documents`
- **API routes**: 8 new routes for folders, tags, documents (list/detail/bulk), enhanced upload + query
- **State**: `knowledge-store.ts` (Zustand) + `use-knowledge.ts` (14 TanStack Query hooks)
- **Components**: 14 files in `src/components/admin/knowledge/` — sidebar, folder-tree, file-list, file-table, folder-view, file-detail-view, document-preview, 5 dialogs
- **Files removed**: `knowledge-file-manager.tsx` (v1), `knowledge-file-manager-v2.tsx` (v2)

---

## Changes (2026-03-21)

### In-App Chat Modal with น้องซีมะโด่ง

- Chat modal (bottom sheet 85vh) opens from mascot button in bottom nav
- Reuses all chatbot handlers (chitchat, knowledge, score, events, parcel)
- Repair intent redirects to LINE (requires photo/postback flow)
- Drag-to-dismiss with visual handle bar + backdrop fade
- `visualViewport` tracking for mobile keyboard avoidance
- Chat history view with date grouping from DB (`GET /api/chat/history`)
- Clear session button to start fresh conversation
- Suggestion chips on empty state
- i18n strings for th/en
- **Files**: `chat-modal.tsx`, `use-chat.ts`, `chat-store.ts`, `api/chat/route.ts`, `api/chat/history/route.ts`

### Chatbot UX Improvements + Student Page Refactor

- Flex banner images: parcel notification (`Inbox.jpg`), repair confirm (`New_Request.jpg`)
- Booking flow after repair confirm: `buildTicketCreatingFlex()` green header + booking CTA
- Status check keywords ("ติดตามสถานะ", "เช็คสถานะ", "track") route to `repair_history` BEFORE session state
- Short repair triggers ("แจ้งซ่อม", "ซ่อม") → guide message instead of creating ticket
- Ticket number in push notification Flex
- New `page-header.tsx` component replaces old `header.tsx` across all student pages
- `logout-button.tsx` component
- `useUpdateTicketStatus` routes through API (not direct Supabase) for LINE notification trigger

### RBAC Wired Up + Admin Fixes

**Admin Sidebar — Permission-based Filtering**
- `admin-shell.tsx`: Each nav item/group gated by permission (e.g. `announcements:view`, `bills:view`, `tickets:view_all`)
- Maintenance group uses `canAny([tickets:view_all, tickets:view_assigned])` for technicians
- Settings sub-items: `students:view`, `technicians:view`, `students:tags`, `system:roles`, `system:settings`
- Empty groups auto-hidden; standalone items (events, scores, billing, parcels, knowledge) filtered

**Legacy Role Mapping in usePermissions**
- `use-permissions.ts`: Maps `profiles.role` legacy values → RBAC: `"admin"` → `"super_admin"`, `"staff"` → `"admin_staff"`
- Applied in both `usePermissions()` and `useRoles()` hooks

**Middleware & User Store — All Staff Roles Allowed**
- `middleware.ts`: Expanded admin route check from `["admin", "head"]` → 13 staff roles (legacy + RBAC)
- `user-store.ts`: `isAdmin()` recognizes all staff-level roles

**Admin Logout Button Fixed**
- `admin-shell.tsx`: Logout button now calls `POST /api/auth/logout` → redirect `/th/login`

**Admin API Routes — RLS Bypass Pattern**
- `api/admin/maintenance/[id]/route.ts`: Changed from `supabase` (user client) → `createAdminClient()` for read+update (RLS was silently blocking)
- `api/admin/roles/route.ts`: All 3 handlers (GET/POST/DELETE) use `createAdminClient()`, expanded role check to `["admin", "super_admin", "head"]`
- Removed broken PostgREST joins on `user_roles` (FK→`auth.users` not `profiles`) → query separately + enrich in JS
- Fixed `building_scope` null vs "all" mismatch in existing-role check (`.is(null)` not `.eq("all")`)

**Role Assignment — Auth Verification**
- POST `/api/admin/roles`: Verifies target user exists in `auth.users` before insert (seeded profiles without auth records get clear error message)
- Also updates `profiles.role` on assignment for legacy compatibility
- UI: Error message shown in dialog (red alert) instead of silent failure

**Hooks Migrated to API Routes**
- `useAssignTechnician()` + `useUpdateTicketNotes()`: Changed from direct Supabase → `PATCH /api/admin/maintenance/[id]`
- `useRoles()` + `useUserRoles()`: Changed from direct Supabase → `GET /api/admin/roles`

---

## Changes (2026-03-20)

### Chatbot UX Improvements

**Banner Images on Flex Messages**
- Parcel notification: hero banner with `Inbox.jpg` (hosted on postimg.cc)
- Repair confirm (ยืนยันการแจ้งซ่อม): hero banner with `New_Request.jpg`
- Pattern: hero section with 16:9 cover image + absolute overlay text (from bill-reminder)

**Booking Flow After Repair Confirm**
- `repair-status.ts` rewritten with 2 Figma designs:
  - `buildTicketCreatingFlex()` (28:370) — shown after confirm, green header + booking CTA → `https://c-madong-product.vercel.app/th/booking/{ticketId}`
  - `buildRepairStatusFlex()` (53:336) — shown after booking, with optional `AppointmentInfo`
- `postback.ts`: `repair_book` handler sends web booking URL
- Uses `WEB_BASE` constant (not LIFF) for all URLs

**"แจ้งซ่อม" Guide Message**
- Short trigger phrases ("แจ้งซ่อม", "ซ่อม", etc.) → guide message instead of creating ticket
- `isRepairTriggerOnly()` exact-match check in `webhook-handler.ts`

**Status Check Keywords (Bug Fix)**
- "ติดตามสถานะ", "สถานะแจ้งซ่อม", etc. now route to `repair_history` instead of creating ticket
- `isRepairStatusCheck()` runs BEFORE session state routing (fixes mid-flow bypass bug)
- Added keywords: "เช็คสถานะ", "ดูสถานะ", "track", "status"

**Ticket Number in Push Notification**
- `buildStatusUpdateFlex()` in `repair-notification.ts` now shows `#shortId` as first detail row

**Middleware Fix**
- Removed `/booking` from `PUBLIC_ROUTES` — was causing redirect-to-dashboard for logged-in users

---

## Changes (2026-03-19)

### LINE Flex Messages — Repair Feature (3 Figma Designs)

**Design 1: แจ้งซ่อมแล้ว (Ticket Created)** — `src/lib/chatbot/flex-builders/repair-status.ts`
- Green header "✅ แจ้งซ่อมแล้ว" + `@displayName`
- Pink highlight ticket number box (`#RRGGBBAA` hex, NOT `rgba()`)
- Detail rows: category, description, urgency (color-coded), room, reporter
- 3 postback actions: ติดตามสถานะ, ยกเลิก, ดูประวัติ

**Design 2: ติดตามสถานะ (Status Tracking)** — `src/lib/line/flex-builders/repair-tracking.ts` *(new)*
- Green header + ticket number, vertical timeline with dots + connecting lines
- Steps built from `created_at`, `accepted_at`, `resolved_at` timestamps + technician info
- Helper `buildTrackingSteps()` for converting DB rows → timeline
- Postback handler: `action=repair_track` in `postback.ts`

**Design 3: ซ่อมสำเร็จ (Repair Done)** — `src/lib/line/flex-builders/repair-notification.ts`
- Branches on status: `completed` → Figma design (green header, badge, review CTA); others → standard notification
- Added `ticketId` to `RepairNotificationData` interface

**New Postback Handlers** in `src/lib/chatbot/handlers/postback.ts`:
- `repair_track` — Fetches ticket from DB, builds timeline flex, replies
- `repair_cancel_ticket` — Cancels ticket (pending/acknowledged only)
- `repair_history` — Shows 5 most recent tickets as text list
- `getReporterContext` exported from `repair.ts` for reuse

**Gotchas Found**:
- LINE Flex `backgroundColor` only accepts hex (`#RRGGBB`/`#RRGGBBAA`), NOT `rgba()` — silently rejects entire message
- `ilike` on UUID columns fails in Postgres — fetch rows then `startsWith()` in JS
- Postback buttons in chatbot replies should always use postback action, not URI (LIFF env var causes URI redirect)
- Session state bypass: when user is mid-repair-flow (session state = `repair_confirming`/`repair_editing`/`repair_collecting_photos`), all text routes to `handleRepair()` — must check status keywords BEFORE session state routing in `webhook-handler.ts`

### Bug Fixes & Infrastructure

**Fix: Student Cancel Ticket (500 error)**
- Root cause: Missing RLS UPDATE policy on `maintenance_requests` for students
- Added `20260323_student_update_policy.sql` migration
- Cancel API uses `createAdminClient()` for update (ownership verified in app code)

**Fix: LINE Flex Notification Not Sending on Status Change**
- Root cause: `useUpdateTicketStatus` hook was updating directly via Supabase client, bypassing API route where notification logic lives
- Changed hook to use `fetch PATCH /api/admin/maintenance/[id]` instead
- Separated in-app notification and LINE push into independent try-catch blocks
- Uses `createAdminClient()` for profile lookups (avoids stale cookie context)

**Fix: Chatbot Repair Ticket Not Appearing in Student Web Client**
- Root cause: Insert included vision metadata columns (`ai_confidence`, `ai_provider`, `template_id`, `damage_details`) that didn't exist before migration
- Made insert type-safe with optional fields using `|| undefined`
- Applied `20260322_repair_templates.sql` migration (pgvector + repair_templates table)

**Vercel Deploy Fix**
- Git author email must match GitHub account: `200895668+klonqdoublek@users.noreply.github.com`
- Disabled "Deployment Protection" in Vercel project settings
- Global git config set to GitHub noreply email

### Maintenance Feature Completion (3 tasks)

**Task 1: Auto LINE Notification on Status Change**
- `src/app/api/admin/maintenance/[id]/route.ts` — When admin changes ticket status, awaits in-app notification (`notifyMaintenanceUpdate`) + LINE Flex message (`buildRepairNotificationFlex` + `pushFlexMessage`). Uses `createAdminClient()` for profile/technician lookups. Skips if status unchanged.
- `src/hooks/use-maintenance-tickets.ts` — `useUpdateTicketStatus` routes through API (not direct Supabase)

**Task 2: Student Cancel Request**
- API: `POST /api/student/maintenance/[id]/cancel` — Auth + ownership check, only pending/acknowledged can cancel, optional failure_reason
- Hook: `useCancelTicket()` in `src/hooks/use-my-tickets.ts` — mutation with query invalidation
- UI: Cancel button + Dialog in `src/components/maintenance/ticket-detail.tsx`

**Task 3: Appointment Booking UI**
- `src/components/maintenance/new-request-form.tsx` — Toggle "ต้องการนัดวันซ่อม?" in details step, Calendar date picker (Popover), time select dropdown (08:00-17:00, 30min slots), shown in review step
- i18n strings added to `th.json` and `en.json` for both cancel and appointment features
