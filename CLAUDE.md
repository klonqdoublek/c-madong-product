# Project Context

## About the User
- **Name**: Khaoklong
- **Role**: UX/UI and Product Designer
- **Goal**: Building a digital product

## Recent Changes (2026-03-19)

### Maintenance Feature Completion (3 tasks)

**Task 1: Auto LINE Notification on Status Change**
- `src/app/api/admin/maintenance/[id]/route.ts` — When admin changes ticket status, auto-sends in-app notification (`notifyMaintenanceUpdate`) + LINE Flex message (`buildRepairNotificationFlex` + `pushFlexMessage`). Fire-and-forget pattern, skips if status unchanged.

**Task 2: Student Cancel Request**
- NEW API: `POST /api/student/maintenance/[id]/cancel` — Auth + ownership check, only pending/acknowledged can cancel, optional failure_reason
- Hook: `useCancelTicket()` in `src/hooks/use-my-tickets.ts` — mutation with query invalidation
- UI: Cancel button + Dialog in `src/components/maintenance/ticket-detail.tsx` — red button visible when status is pending/acknowledged, dialog with optional reason textarea

**Task 3: Appointment Booking UI**
- `src/components/maintenance/new-request-form.tsx` — Toggle "ต้องการนัดวันซ่อม?" in details step, Calendar date picker (Popover), time select dropdown (08:00-17:00, 30min slots), shown in review step. Sends `appointmentDate` + `appointmentTime` with form submit.
- i18n strings added to `th.json` and `en.json` for both cancel and appointment features
