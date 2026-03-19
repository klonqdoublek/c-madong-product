# Project Context

## About the User
- **Name**: Khaoklong
- **Role**: UX/UI and Product Designer
- **Goal**: Building a digital product

## Recent Changes (2026-03-19)

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
