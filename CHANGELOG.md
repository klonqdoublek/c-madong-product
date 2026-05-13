# Changelog

All notable changes to C-Madong are documented here.
Format: `## [vX.Y.Z] — YYYY-MM-DD` with subsections Added / Changed / Fixed / Removed / Infrastructure.

---

## [v3.6.0] — 2026-05-13

### Added
- `src/lib/chatbot/handlers/billing.ts` — NEW: `handleBilling(lineUid)` fetches student's pending bills, returns `buildBillReminderFlex()` for most-urgent bill or "ไม่พบบิลค้างชำระ" text when none
- `src/lib/chatbot/webhook-handler.ts` — `BILLING_KEYWORDS` array + `isBillingRelated()` fast-path keyword check before AI classifier; `case "billing":` in intent switch; import of `handleBilling`

### Changed
- `src/components/student/parcels-page-content.tsx` — redesigned student parcel page from Figma node `1925:3827`: CU cream/pink mobile layout, featured parcel hero, pickup-location dashed card, search bar, unclaimed/claimed tabs, grouped parcel history, and status pills
- `src/components/student/billing/billing-page-content.tsx` — redesigned student dorm-bill page from Figma node `1374:13187`: amount summary gradient card, bill breakdown chips, invoice/receipt download actions, due-date reminder card, auto-debit method row, and searchable transaction history
- Both redesigned pages keep existing routes and data hooks (`useMyParcels`, `useMyBills`) and use existing Tailwind v4 CU tokens/fonts instead of adding new dependencies or copying Figma's generated Tailwind verbatim

### Fixed
- `src/lib/chatbot/types.ts` — added `"billing"` to `ChatIntent` union type (root cause: AI could return billing intent but validator rejected it → fell to chitchat every time)
- `src/lib/chatbot/intent-router.ts` — added `"billing"` to `validIntents` array (same root cause as above)
- `src/lib/chatbot/suggestions.ts` — added `billing` entry to `Record<ChatIntent, QuickReply[]>` map (was throwing type error without it)
- `src/lib/chatbot/handlers/index.ts` — exported `handleBilling`
- `src/lib/chatbot/handlers/postback.ts` — `handleRemindBill()` replaced stub: fetches bill + profile, validates ownership, deletes `notification_dispatch_log` entries for day-windows 0/1/3 to unlock cron re-push, replies with next push time + due date + CTA to `/th/billing`
- `src/lib/chatbot/handlers/postback.ts` — `handleConfirmPayment()` replaced stub: fetches bill + profile, validates ownership, appends `[LINE] นิสิตแจ้งชำระเงินผ่าน LINE เมื่อ {datetime}` to `bills.admin_notes`, replies confirming recorded + admin will verify within 1–2 business days + CTA
- `src/lib/chatbot/flex-builders/events-carousel.ts` — footer button changed from `type: "postback"` to `type: "uri"` pointing to `${WEB_BASE}/th/events/${event.id}` (was silently replying bot text instead of opening webapp)

### Infrastructure
- No DB migrations (uses `notification_dispatch_log` from migration `20260514_proactive_notifications.sql` applied in prior session)
- No new API routes
- No new env vars
- No type regeneration required
- Commits: `777c001` (billing intent + events carousel fix), `5d2fa42` (remind_bill real impl), `7d70ac6` (confirm_payment real impl)
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

---

## [v3.4.0] — 2026-05-12

### Added
- `src/app/[locale]/intro/page.tsx` — SSG public route for the 5-slide intro onboarding flow
- `src/components/student/intro/intro-content.tsx` — client component: Framer Motion swipe gesture (`drag="x"`, dragElastic=0, ±60px threshold), AnimatePresence background-image layer, fixed card+text layer, spring pill indicator outside AnimatePresence, per-slide overlay icons with fade+scale, `extraUp` pixel offset config per slide
- `public/images/intro/slide-0.png` — Slide 0 background (น้องซีมะโด่งมาแล้ว!, pink gradient)
- `public/images/intro/slide-1.png` — Slide 1 background (แจ้งซ่อมง่ายๆ แค่ปลายนิ้ว!, green card)
- `public/images/intro/slide-2.png` — Slide 2 background (ถามอะไร น้องซีตอบได้!, pink card)
- `public/images/intro/slide-3.png` — Slide 3 background (ไม่พลาดทุกข่าวสารสำคัญ, cream)
- `public/images/intro/slide-4.png` — Slide 4 background (ประสบการณ์ใหม่ที่ไร้รอยต่อ, light green)
- `public/images/intro/overlay-char.png` — น้องซี character overlay (slide 0, w-36, extraUp: 48px)
- `public/images/intro/overlay-repair.png` — wrench+hand circle overlay (slide 1)
- `public/images/intro/overlay-ai.png` — AI character circle overlay (slide 2)
- `public/images/intro/overlay-noti.png` — megaphone circle overlay (slide 3)
- `public/images/intro/overlay-line.png` — stars+app icon circle overlay (slide 4)

### Changed
- `src/middleware.ts` — `/intro` added to `PUBLIC_ROUTES`; authenticated users allowed to access /intro (same exception pattern as /guide and /legal)
- `src/app/[locale]/(auth)/login/page.tsx` — added `useRouter`; `useEffect` redirects to `/[locale]/intro` when `skip_splash` query param absent; `showSplash` state initialized from `!skipSplash` boolean

### Infrastructure
- No DB migrations
- No new API routes
- No new env vars
- No type regeneration required
- Commit: `27d3224` — feat: 5-screen intro onboarding flow with Framer Motion swipe and spring indicators
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

---

## [v3.3.0] — 2026-05-11

### Added
- `globals.css` — `--color-cu-score-green: #4A7060` design token (dark forest green for score page hero card only; distinct from `cu-task-green` #52AD7E used for task completion states)
- `src/messages/th.json` — 8 new `score` namespace keys: `passThreshold`, `failThreshold`, `disclaimer`, `promoBannerTitle`, `promoBannerSubtitle`, `viewAll`, `enteredAt`, `unit`
- `src/messages/en.json` — same 8 keys mirrored in English

### Changed
- `src/components/student/score/score-page-content.tsx` — complete Figma redesign (node 1380-15996): green hero card with `bg-cu-score-green`, composite score `text-7xl`, stacked progress bar (3-color with `BAR_COLORS` legend), pass/fail threshold badge ("ผ่านเกณฑ์!" when score >= 60), dismissable promo banner (bell icon + mascot watermark), horizontal-scroll category breakdown cards (3 cards; icons derived from category name: Sunrise/Flag/ShieldCheck/Star), history list with green circle score badges replacing trend icons, `ⓘ` info button wired into `PageHeader` `right` prop slot

### Infrastructure
- No DB migrations
- No new API routes
- No new env vars
- No type regeneration required
- Commit: `7079963` — style: redesign score page with Figma green hero card layout
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

---

## [v3.2.0] — 2026-05-11

### Added
- `supabase/migrations/20260504_realtime_live_chat.sql` — adds `chat_escalations` and `ai_chat_messages` tables to `supabase_realtime` publication (pushed to DB)
- `src/app/[locale]/print/report/page.tsx` — print-only report page; no sidebar/admin shell; accepts `?section=X&from=Y&to=Z` query params; consistent with `/print/requisition/[id]` pattern
- `src/components/admin/reports/report-print-content.tsx` — NEW client component; fetches report data for active section via existing `use-reports.ts` hooks; renders KPI grid + print-optimized tables for all 4 sections (maintenance/billing/occupancy/engagement); auto-triggers `window.print()` after 1.8s delay to allow data render

### Changed
- `src/hooks/use-escalations.ts` — removed `refetchInterval: 3000` from `useEscalationQueue` and `useEscalationMessages`; added inline Supabase channel subscriptions (same pattern as `use-notifications.ts`): `useEscalationQueue` subscribes to `chat_escalations` `*` events; `useEscalationMessages` subscribes to `ai_chat_messages` `INSERT` (no filter — linked via `line_uid` not `escalation_id`) → both invalidate relevant TanStack Query keys on event
- `src/components/admin/reports/reports-export-button.tsx` — single CSV button replaced with shadcn DropdownMenu; CSV option uses FileSpreadsheet icon, PDF option uses FileText icon and opens print route in new tab
- `src/components/admin/dashboard/dashboard-header.tsx` — replaced all `handleComingSoon` toast stubs with real implementations: CSV generates from `useDashboardStats()` cache (UTF-8 BOM, filename `dashboard-snapshot-YYYY-MM-DD.csv`); PDF opens `/[locale]/print/report?section=maintenance&from=...&to=...` in new tab; "สร้างรายงาน" uses `router.push` to `/[locale]/admin/reports`

### Infrastructure
- Migration `20260504_realtime_live_chat.sql` applied via `supabase db push`
- No new API routes
- No new RBAC permissions
- No type regeneration required
- Commit: `0ad1fb3` — feat: Phase 8 deferred — PDF export, Realtime live-chat, dashboard export wired
- Deploy status: DEPLOYED — https://c-madong-product.vercel.app

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
