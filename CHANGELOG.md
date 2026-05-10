# Changelog

All notable changes to C-Madong are documented here.
Format: `## [vX.Y.Z] — YYYY-MM-DD` with subsections Added / Changed / Fixed / Removed / Infrastructure.

---

## [v3.1.0] — 2026-05-11

### Added
- `src/messages/th.json` — `common.time` namespace: justNow, minutesAgo, hoursAgo, daysAgo, today, yesterday (relative time strings for notification-item)
- `src/messages/th.json` — `admin.rbac`: revokeConfirmDesc, revokeConfirmGenericDesc, revokeError, assignError
- `src/messages/th.json` — `chat.teamDefault` key (extracted "ทีมงาน" hardcoded string)
- `src/messages/th.json` — `admin.eventsPage.deleteTitle` key
- `src/messages/th.json` — `dashboard.noUpcomingEvents` key (student namespace empty state)
- `src/messages/en.json` — same keys as above (all namespaces mirrored in English)

### Changed
- `src/components/layout/bottom-nav.tsx` — bell button aria-label with dynamic unread count (WP8 accessibility)
- `src/components/student/chat-fab.tsx` — aria-label="ถามน้องซีมะโด่ง" (WP8 accessibility)
- `src/components/student/chat-modal.tsx` — `formatDateLabel()` refactored to accept todayLabel/yesterdayLabel/locale as params (enables i18n without hook in pure fn); "ทีมงาน" → `t("teamDefault")`
- `src/components/student/notification-item.tsx` — new `getRelativeTimeParts()` function using `useTranslations("common.time")`; eliminates hardcoded Thai time strings
- `src/components/student/dashboard/dashboard-events-list.tsx` — CalendarDays icon + `dashboard.noUpcomingEvents` i18n message replaces silent `return null` (WP6 empty state)
- `src/components/student/profile/profile-info-card.tsx` — `truncate text-center` on name and student ID lines (WP7 text truncation)
- `src/components/admin/roles/roles-list.tsx` — `window.confirm` → shadcn `AlertDialog` with dynamic user name in description; errors → `toast.error()` (WP4); trash button aria-label (WP8)
- `src/components/admin/roles/user-roles-dialog.tsx` — `window.confirm` → shadcn `AlertDialog`; assign/revoke errors → `toast.error()` (WP4); trash button aria-label (WP8)
- `src/components/admin/events/events-page-content.tsx` — `window.confirm` → reused `DeleteConfirmDialog` from knowledge base (WP4)
- `src/components/admin/billing/bill-detail-content.tsx` — `window.confirm` → reused `DeleteConfirmDialog` (WP4)

### Infrastructure
- No new DB migrations
- No new API routes
- No type regeneration required
- Commit: `6a0c0a4` — feat: Phase 9 UX/UI Polish (WP4/WP5/WP6/WP7/WP8)
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

---

## [v3.0.0] — 2026-05-10

### Added
- `src/app/[locale]/admin/reports/page.tsx` — Reports & Analytics hub page with 4 tabs and `?tab=X` URL sync
- `src/app/api/admin/reports/maintenance/route.ts` — maintenance KPIs and chart data (tickets, completion rate, response time, cancellation rate)
- `src/app/api/admin/reports/billing/route.ts` — billing KPIs and chart data (revenue, collection rate, outstanding, overdue)
- `src/app/api/admin/reports/occupancy/route.ts` — occupancy KPIs and chart data (bed utilization, per-building, move-in timeline)
- `src/app/api/admin/reports/engagement/route.ts` — engagement KPIs and chart data (read rate, event attendance, chatbot intents, parcel pickup)
- `src/app/api/admin/reports/export/route.ts` — CSV export with UTF-8 BOM prefix for Thai character Excel compatibility
- `src/hooks/use-reports.ts` — 4 TanStack Query hooks with `staleTime: 5 * 60 * 1000`
- `src/lib/utils/thai-month.ts` — Thai month label array + `formatBaht()` currency formatter
- `src/components/admin/reports/` — 14 new report components (KPI cards, PieChart, BarChart, LineChart wrappers, data tables, date range picker, export button, tab layout)
- `recharts` — installed as first chart library; all chart components use `"use client"` directive + `ResponsiveContainer`

### Changed
- `src/components/layout/admin-shell.tsx` — added Reports nav item with `BarChart3` icon gated by `Permission.REPORTS_VIEW`
- `src/messages/th.json` — added `navReports` i18n key
- `src/messages/en.json` — added `navReports` i18n key

### Infrastructure
- No new DB migrations — all report queries use existing tables with JS-side aggregation
- No new RBAC permissions — `REPORTS_VIEW`, `REPORTS_VIEW_ALL`, `REPORTS_EXPORT` pre-existed in `src/lib/rbac/permissions.ts`
- Commit: `836ceef` — feat: Phase 8 reports & analytics dashboard
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

---

## [v2.9.1] — 2026-05-07

### Fixed
- LIFF / LINE in-app webview zoom is now blocked reliably across localized routes, including auth entry screens that render before student shell mounts
- `generateViewport()` on `src/app/[locale]/layout.tsx` now tolerates prerender calls without `searchParams`, fixing the `/th/login` production build failure

### Changed
- `src/app/[locale]/layout.tsx` — LIFF-aware viewport generation kept at locale layout for localized LIFF entry routes
- `src/app/layout.tsx` — root layout now mounts a global LINE webview zoom guard so zoom prevention applies to login, register, onboarding, and student pages
- `src/lib/liff/zoom-guard.tsx` — new client guard that rewrites `meta[name="viewport"]` in LINE/LIFF context and blocks pinch, double-tap, and iOS gesture zoom

### Infrastructure
- Commits: `809112a` (initial LIFF viewport split), `e7ec229` (locale-route viewport), `8418e55` (prerender guard), `5e7379b` (global LINE webview zoom guard)
- Verification: `npx eslint src/app/layout.tsx src/lib/liff/provider.tsx src/lib/liff/zoom-guard.tsx 'src/app/[locale]/layout.tsx'`
- Verification: `npm run build`
- Deploy status: DEPLOYED to `main`

---

## [v2.9.0] — 2026-05-06

### Added
- `globals.css` — 5 new semantic tokens: `cu-warm-cream` (#FFFBF1), `cu-task-green` (#52AD7E), `cu-task-green-dark` (#4DA376), `cu-neutral-warm` (#D7D4CC), `cu-neutral-warm-dark` (#B9B6B0)
- `globals.css` — `prefers-reduced-motion` media query guard on all CSS animation keyframes (WCAG 2.1 AA)

### Changed
- `src/components/layout/page-header.tsx` — `<h1>` font changed from `font-sans` to `font-heading` (Chulalongkorn); affects all 14 student pages
- `src/components/student/dashboard/dashboard-info-card.tsx` — fixed layout overflow (negative-margin instead of fixed-height), action card `bg-white shadow-card` (was `bg-cu-warm-cream`), Thai text `leading-normal pb-0.5` (was `leading-tight`)
- `src/app/[locale]/(student)/dashboard/content.tsx` — migrated `bg-[#FBF6E9]` → `bg-cu-cream`, `bg-[#FFFBF1]` → `bg-cu-warm-cream`; quick menu top margin `mt-4` → `mt-6`
- 43 student components — 277 raw hex values migrated to semantic tokens: `text-[#565655]` → `text-cu-grey`, `bg-[#FBF6E9]` → `bg-cu-cream`, `bg/text-[#DD598B]` → `bg/text-primary`, `bg/text-[#52AD7E]` → `cu-task-green`, bed button states → `cu-neutral-warm`
- All heading elements in student client — `font-heading font-semibold` corrected to `font-heading font-bold` (Chulalongkorn has no semibold weight)

### Fixed
- `dashboard-info-card.tsx` — absolute-positioned child with `min-h` escaping fixed-height parent and overflowing into quick menu
- `dashboard-info-card.tsx` — `bg-cu-warm-cream` was visually invisible over pink gradient background; replaced with `bg-white`
- `dashboard-info-card.tsx` — Thai สระบน / วรรณยุกต์ clipping caused by `leading-tight`; fixed to `leading-normal` with `pb-0.5`

### Infrastructure
- Commits: `28c4cc7` (token migration), `8a35227` (dashboard info card fixes)
- Deploy status: DEPLOYED to Vercel prod
- Scope: 43 components + 2 page files modified; no new migrations, no type regen

---

## [v2.8.0] — 2026-05-04

### Changed
- `src/lib/chatbot/flex-builders/greeting-carousel.ts` — renamed banner image URLs to v2 variants to bust LINE CDN cache
- `public/line-banners/` — updated flex carousel banner images and guide page images
- `docs/CHANGELOG.md` — added v2.8.0 notes

### Infrastructure
- Commits: `ce4afb0` (docs), `9e69acb` (cache bust), `1245de0` (assets), `443e9dd` (login logo)
- Deploy status: DEPLOYED

---

## [v2.7.1] — 2026-05-03

### Fixed
- LINE login route restored
- LIFF entry flow hardened
- Guest rich menu restored on logout

### Infrastructure
- Commits: `b3cfad3` (docs), `ab1e0af` (logout rich menu), `7f7e148` (auth routes), `8cf683f` (login UI)
- Deploy status: DEPLOYED

---

## [v2.8.0-pre] — 2026-04-27

### Added — Bed Selection v2.3.0
- `src/stores/bed-selection-store.ts` — Zustand persist store: `selectedBedId`, `expiresAt` (+600000ms)
- `src/lib/utils/bed-mock.ts` — FNV-1a deterministic mock occupancy (~70% occupied)
- `src/hooks/use-bed-selection.ts` — bed selection hook
- `src/app/api/student/bed-selection/route.ts` — GET + POST (validate, UPDATE profiles, flip beds.is_occupied, upsert dorm_calendar_completions)
- `src/app/api/cron/bed-selection-auto-confirm/route.ts` — D-0 23:59 auto-confirm cron
- `src/components/student/bed-selection/bed-button.tsx`
- `src/components/student/bed-selection/room-card.tsx`
- `src/components/student/bed-selection/bed-reservation-sheet.tsx`
- `src/components/student/bed-selection/bed-selection-content.tsx`
- `src/components/student/bed-selection/confirm-content.tsx`
- `src/components/student/bed-selection/success-content.tsx`
- `src/app/[locale]/(student)/bed-selection/page.tsx`
- `src/app/[locale]/(student)/bed-selection/confirm/page.tsx`
- `src/app/[locale]/(student)/bed-selection/success/page.tsx`
- `supabase/migrations/20260429_bed_selection_enums.sql`
- `supabase/migrations/20260430_bed_selection_seed.sql`

### Changed
- `src/components/student/task-card.tsx` — CTA `internal_bed_selection` routes to `/bed-selection`
- `src/components/student/list-view.tsx` — wired bed selection task card
- `src/hooks/use-dorm-calendar.ts` — bed selection calendar item support
- `src/lib/supabase/types.ts` — new enums
- `vercel.json` — cron for auto-confirm

### Infrastructure
- Deploy status: DEPLOYED

---

## [v2.7.0] — 2026-04-26

### Added — Repair Flow v3 + Requisition Versioning
- `src/lib/ai/agents/material-agent.ts` — GPT-4o vision / gpt-4o-mini material suggestions
- `src/lib/utils/specific-icons.ts` — slug → Lucide icon mapping
- `src/lib/utils/ticket-code.ts` — `formatTicketCode()` helper
- `src/lib/line/flex-builders/technician-group-notify.ts`
- `src/lib/line/flex-builders/technician-group-digest.ts`
- `src/lib/line/push-to-technician-group.ts`
- `src/lib/chatbot/handlers/technician.ts`
- `src/components/admin/maintenance/materials-section.tsx`
- `src/components/admin/maintenance/status-transition.tsx` (rewritten)
- `src/components/admin/maintenance/requisition-document.tsx`
- `src/components/admin/maintenance/requisitions-history.tsx`
- `src/components/admin/maintenance/all-requisitions-view.tsx`
- `src/app/api/admin/maintenance/[id]/suggest-materials/route.ts`
- `src/app/api/admin/maintenance/[id]/materials/route.ts`
- `src/app/api/admin/maintenance/[id]/requisitions/route.ts`
- `src/app/api/cron/technician-group-digest/route.ts`
- `src/app/print/requisition/[id]/page.tsx`
- `src/app/admin/maintenance/[id]/requisitions/page.tsx`
- `src/app/admin/maintenance/requisitions/page.tsx`
- `supabase/migrations/20260425_repair_flow_enhancements.sql`
- `supabase/migrations/20260426_repair_requisitions.sql`

### Infrastructure
- Next.js updated to 16.x, next-intl 4.8.2
- `LINE_TECHNICIAN_GROUP_ID` + `CRON_SECRET` added to Vercel prod env
- Deploy status: DEPLOYED

---

## [v2.6.0] — 2026-04-25

### Added — Knowledge Base AI + Versioning + Dashboard Feedback
- `src/lib/knowledge/detect-version.ts`
- `src/lib/knowledge/ai-analyze.ts`
- `src/app/api/admin/knowledge/analyze/route.ts`
- `src/app/api/admin/knowledge/apply-suggestion/route.ts`
- `src/app/api/admin/knowledge/feedback/route.ts`
- `src/app/api/admin/knowledge/documents/[id]/versions/route.ts`
- `src/app/api/admin/ai-feedback-stats/route.ts`
- `src/components/admin/knowledge/ai-suggestion-dialog.tsx`
- `src/components/admin/dashboard/dashboard-ai-feedback-card.tsx`
- `supabase/migrations/20260424_knowledge_versioning_ai.sql`
- 5 new hooks: `useAnalyzeDocument`, `useApplySuggestion`, `useAISuggestionFeedback`, `useDocumentVersions`, `useAIFeedbackStats`

### Infrastructure
- Deploy status: BUILT (pending real-world admin testing)

---

## [v2.5.0] — 2026-04-24

### Added — Student Profile Edit Flow
- `src/app/[locale]/(student)/profile/edit/page.tsx`
- `src/components/student/profile/edit-profile-form.tsx`

### Changed
- `src/components/student/profile/profile-content.tsx` — "Edit Profile" CTA links to real edit page; logout moved here
- `src/components/student/profile/profile-info-card.tsx` — residence labels resolved from FK relations
- `src/components/student/profile/settings-content.tsx` — logout removed
- `src/components/student/logout-button.tsx` — locale-aware redirect
- `eslint.config.mjs` — Next 16 flat config
- `package.json` — `npm run lint` changed to `eslint .`
- `.gitignore` — added `.gemini/`, `agent.md`, `admin-dashboard-mockup.html`

### Infrastructure
- Deploy status: DEPLOYED — `https://c-madong-product.vercel.app`
- Commit: `008e7e9`
