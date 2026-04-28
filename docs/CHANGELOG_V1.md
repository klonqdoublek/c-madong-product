# C-Madong Product — Changelog

> **Version 2.5.0** Release Date: 2026-04-28
> Announcement Send Fix — admin create/send/draft fully working, LINE broadcast to all followers, student tag saving fixed

---

## 🐛 V2.5.0 Bug Fixes (2026-04-28)

### Announcement Admin — Create / Send / Save Draft

**Root causes found and fixed (8 commits: 8326c21→2c8a308)**

- **Silent create failure**: `useCreateAnnouncement` used user Supabase client → RLS blocked `super_admin` (is_admin() checks only `admin|head`). `author_id: ""` also caused UUID constraint error. Fix: route POST/PATCH through API routes using `createAdminClient()`.
- **`published_at` never set**: Direct Supabase insert path skipped `published_at` → announcements sorted wrong for students. API route now sets `sent_at` + `published_at` when `status = "sent"`.
- **`title` NOT NULL violation**: POST API was missing `title` field (required column, no DB default). Added `title: title_th || title_en || ""` to insertData.
- **`target_type` check constraint**: DB constraint `announcements_target_type_check` only allows `broadcast` / `targeted`. Component was sending `"tags"`. Fixed option value → `"targeted"`, added defensive map in API.
- **`announcement-permissions.ts` never committed**: Build failed on Vercel — "Module not found". New RBAC helper file was local-only. Committed alongside modified API routes.
- **LINE broadcast text to unregistered users**: Text broadcast was individual-pushing only profiles with `line_uid`. Unregistered followers (added OA but no account) never received. Fixed: `broadcastTextMessage()` uses LINE broadcast API → sends to ALL followers.
- **Student tag save blocked by RLS**: `useUpdateStudent` used user client → `super_admin` RLS blocked UPDATE on profiles. Created `PATCH /api/admin/students/[id]` with `adminClient()`. Hook now calls API.
- **`send/route.ts` shadow variable**: Duplicate `const supabase = await createClient()` inside targeted block. Removed; uses `adminDb` (adminClient) throughout.

**New files**:
- `src/app/api/admin/announcements/[id]/route.ts` — PATCH handler (update announcement via adminClient)
- `src/app/api/admin/students/[id]/route.ts` — PATCH handler (update student/tags via adminClient)
- `src/lib/rbac/announcement-permissions.ts` — `hasAnnouncementPermission()` helper (legacy + RBAC roles)
- `src/lib/line/client.ts` — added `broadcastTextMessage()`

**Modified**:
- `new-announcement-page-content.tsx` — `saveViaApi()` replaces direct mutations; success/error toast; `"tags"` → `"targeted"`
- `send/route.ts` — adminClient for profile queries, `broadcastTextMessage` for text broadcast, `"targeted"` type check
- `use-students.ts` — `useUpdateStudent` calls PATCH API instead of direct Supabase
- `student-edit-dialog.tsx` — success/error toast on save

---

## 🎯 V2.3.0 Updates (2026-04-27)

### Bed Selection Mandatory Task

**Feature Overview**
- ✅ Annual bed selection/confirmation wired as mandatory `dorm_calendar_item` (category `bed_selection`)
- ✅ Integrated with Dorm Calendar v1 completion tracking, D-7/D-3/D-1/D-0 reminder cron, auto-score trigger
- ✅ Standalone route `/bed-selection` (not inside evaluation framework) — UI too custom for eval pattern
- ✅ Student who doesn't act → current bed auto-confirmed by D-0 23:59 cron

**3 Screens (Figma nodes 1313:1456, 1313:1186, 1314:1316)**
- **Main page**: CHULALONGKORN pink heading + current bed pill top-right + floor selector 1-17 (horizontal scroll) + status bar (building + floor + available count) + legend 3 dots + 2-col room grid with bed A/B[/C/D] buttons (3 states: available/occupied/selecting)
- **Bottom sheet (Figma 2)**: slides up on bed tap — shows selected room + bed badge + "ยืนยัน" CTA + 10-min countdown in red (`00:MM:SS`) + X cancel
- **Confirm page (Figma 3 + design-taste polish)**: full-page (not sheet) — personal info dashed card (avatar icon, full_name_th, student_id, faculty, building) + bed transition dashed card (เตียงเดิม pill → arrow → เตียงใหม่ pill, large 24px room numbers) + footer warning + "ยืนยันการเลือก" / "ยกเลิก" CTAs
- **Success page**: checkmark 64px + "ยืนยันเตียงสำเร็จ!" + new bed display + back/calendar links

**Client-side Countdown (10 min)**
- Zustand persist store (`bed-selection-store.ts`) holds `selectedBedId`, `expiresAt` (epoch+600000ms)
- `requestAnimationFrame` tick in `BedReservationSheet` (NOT in store) → countdown string
- Timer survives page refresh (localStorage); re-opens sheet on revisit if not expired
- Expiry → auto-clear + toast → user must re-pick

**Mock Occupancy (FNV-1a hash)**
- Real `beds` table queried for user's building per floor (2,448 beds, 17 floors, real structure)
- `isMockOccupied(bedId, semester, currentBedId)` → deterministic ~70% occupied per semester seed
- User's own `profile.bed_id` always `isOccupied=false` (always selectable)
- TODO comment: swap to real `beds.is_occupied` once admin tooling seeds occupancy

**Data Flow on Confirm**
- `POST /api/student/bed-selection` validates same-building, re-checks mock occupied (race guard → 409)
- Updates `profiles.bed_id + room_id`, flips `beds.is_occupied` (old → false, new → true)
- Finds active `bed_selection` calendar item → `upsert dorm_calendar_completions` (triggers auto-score)
- TanStack Query invalidates: `profile`, `residence-info`, `dorm-calendar`, `bed-selection-layout`

**Auto-Confirm Cron**
- `GET /api/cron/bed-selection-auto-confirm` — protected by `CRON_SECRET`
- Finds past-due `bed_selection` item, batch-inserts completion with `method='auto_confirm'` for students without completion
- Schedule `59 16 * * *` (UTC) = 23:59 BKT

**Migrations**
- `20260429_bed_selection_enums.sql` — ALTER TYPE adds `bed_selection`, `internal_bed_selection`, `auto_confirm`
- `20260430_bed_selection_seed.sql` — seeds calendar item (start 2026-05-01, due 2026-05-31, score +2 / penalty -5)

**Files**
- NEW: `src/stores/bed-selection-store.ts`
- NEW: `src/lib/utils/bed-mock.ts` (FNV-1a hash util)
- NEW: `src/hooks/use-bed-selection.ts` (3 hooks: layout query, confirm mutation, current bed info)
- NEW API: `src/app/api/student/bed-selection/route.ts` (GET + POST)
- NEW cron: `src/app/api/cron/bed-selection-auto-confirm/route.ts`
- NEW components: `src/components/student/bed-selection/` (6 files: bed-button, room-card, bed-reservation-sheet, bed-selection-content, confirm-content, success-content)
- NEW pages: `src/app/[locale]/(student)/bed-selection/page.tsx`, `/confirm/page.tsx`, `/success/page.tsx`
- MODIFIED: `task-card.tsx` (add `internal_bed_selection` CTA + `bed_selection` category label), `list-view.tsx` (same category label), `use-dorm-calendar.ts` (type unions), `types.ts` (custom aliases re-added post gen-types), `vercel.json` (new cron)

**Commit**: `842328d`

---

## 🎯 V2.2.0 Updates (2026-04-26)

### Repair Flow v3 — Major Redesign

**Forced Review Gate (under_review replaces pending)**
- ✅ Every new ticket starts at `under_review` ("รอประเมิน") — technician must evaluate before accepting
- ✅ `pending` status removed from schema; all existing tickets backfilled to `under_review`
- ✅ Status flow: under_review → acknowledged → in_progress → completed/cancelled

**Ticket Code `#AA123456`**
- ✅ Auto-generated on insert via DB trigger (`gen_ticket_code()`) — 2 uppercase letters + 6 digits
- ✅ Shown on Kanban cards, ticket detail modal header, all LINE Flex messages, chatbot replies
- ✅ Propagated to repair_confirm, repair_status, repair_tracking Flex builders

**AI Material Listing**
- ✅ `material-agent.ts` — GPT-4o vision (with photo) or gpt-4o-mini text (no photo)
- ✅ Returns Thai item names + standard units (ชิ้น/ตัว/เมตร/ม้วน/กระป๋อง)
- ✅ Grounded in dorm context, max 8 items, avoids hallucination
- ✅ `POST /api/admin/maintenance/[id]/suggest-materials` — suggests but does not save
- ✅ `PATCH /api/admin/maintenance/[id]/materials` — saves admin-confirmed materials

**MaterialsSection Component**
- ✅ Shows in ticket detail modal between admin notes + status transitions
- ✅ Header: "วัสดุที่ต้องใช้" + "✨ ช่วยแนะนำ" AI button (right-aligned)
- ✅ List: chip rows with name × qty unit, remove button, AI sparkle icon on AI items
- ✅ Inline add: name + number input + unit dropdown + Enter to add
- ✅ AI dialog: checkbox list, "เพิ่มทั้งหมด" or per-item, dedup against existing
- ✅ "📄 สร้างใบเบิก" button + "🕐 ประวัติ" link

**Specific-Item Icons**
- ✅ Vision agent now emits `specific_item` slug (door, faucet, ceiling_fan, light_switch, etc.)
- ✅ `specific-icons.ts` maps slug → Lucide icon (DoorOpen, Droplet, Fan, ToggleLeft, Plug, Wind…)
- ✅ Kanban cards + ticket detail modal use specific icon, fall back to category icon

**Status Transition Redesign (Pill UI)**
- ✅ 5 status pills (radio-style), all always rendered
- ✅ Current: filled CU-pink + checkmark; others: outlined with hover ring
- ✅ Click any pill → confirm dialog (reason mandatory for cancelled)
- ✅ Terminal states can reopen to under_review with confirm

**Kanban Updates**
- ✅ First column: "รอประเมิน" (under_review), not "รายการใหม่"
- ✅ Cards show: `#AA123456` ticket code badge + materials count chip + specific icon

**LINE Group Push (Technician Group)**
- ✅ `LINE_TECHNICIAN_GROUP_ID=C6f5554168121fc89b92beb1c09f405dc` added to Vercel
- ✅ Immediate push ONLY for urgent/high urgency tickets (noise reduction)
- ✅ Flex: ticket code badge, urgency badge, location, "📋 ดูรายละเอียดในเว็บ" CTA only (no accept button)
- ✅ NO push on status changes (prevents noise)

**Daily Digest Cron (08:00 Bangkok)**
- ✅ `CRON_SECRET` added to Vercel env
- ✅ `vercel.json` cron: `0 1 * * *` (01:00 UTC = 08:00 ICT)
- ✅ Queries open tickets: under_review + unassigned acknowledged + in_progress
- ✅ Digest Flex: counts by status + top 8 tickets sorted by urgency + age
- ✅ Skips push if zero open tickets

**Deep-Link ?ticket= Param**
- ✅ `/admin/maintenance?ticket={id}` auto-opens ticket detail modal
- ✅ Used by LINE group push CTA

**Technician Bot (Role-Gated)**
- ✅ "งานวันนี้" → lists today's open tickets (assigned-to-me first), max 10
- ✅ "ใครว่าง" → lists active technicians sorted by open ticket count (less = more free)
- ✅ Role gate: only profiles with technician/technician_head/admin/head/super_admin roles
- ✅ Non-tech users fall through to chitchat

### Requisition Document Feature

**Requisition HTML Mockup**
- ✅ `docs/mockups/requisition-form-mockup.html` — A4, print-ready, Sarabun font
- ✅ CU Pink (#DD598B) header strip, dorm CI, materials table, 3 signature blocks

**Dynamic Print Page**
- ✅ `/print/requisition/[id]` — outside admin layout (no sidebar), clean A4 print
- ✅ Loads from requisition snapshot (versioned) OR falls back to live ticket data
- ✅ Requester name = `full_name_th` (real name, not LINE display_name)
- ✅ Buddhist year dates, version badge in header

**Requisition Versioning (repair_requisitions table)**
- ✅ Each "สร้างใบเบิก" click: POST → snapshot frozen (ticket info + materials) → opens print
- ✅ v1 on first generate; v2, v3… on subsequent generates after materials change
- ✅ Snapshot stores: ticket_code, title, category, requester_name (real), building, room, technician, appointment, materials[]
- ✅ Version badge shown in printed document (top-right, CU-pink)

**Requisition History Pages**
- ✅ Per-ticket: `/admin/maintenance/[id]/requisitions` — all versions, version pill, date, creator, materials preview, 🖨 print per row
- ✅ Global: `/admin/maintenance/requisitions` — table of ALL requisitions across all tickets
- ✅ "ใบเบิกทั้งหมด" button in maintenance page header (next to list/kanban tabs)
- ✅ "🕐 ประวัติ" link in MaterialsSection → opens per-ticket history

### Infrastructure

- ✅ `supabase/migrations/20260425_repair_flow_enhancements.sql` — ticket_code trigger, materials JSONB, specific_item, under_review status, repair_templates default_materials
- ✅ `supabase/migrations/20260426_repair_requisitions.sql` — repair_requisitions table, RLS
- ✅ `LINE_TECHNICIAN_GROUP_ID` + `CRON_SECRET` added to Vercel production env
- ✅ Next.js updated to 16.x, next-intl updated to 4.8.2
- ✅ Custom type aliases re-added post gen-types: MaterialItem interface added

---

> **Version 2.1.3** Release Date: 2026-04-24
> Knowledge Base AI-assisted upload + versioning + admin feedback analytics

---

## 🎯 V2.1.3 Updates (2026-04-24)

### Knowledge Base — AI-Assisted Upload + Versioning

**AI Suggestion Popup (4-State Dialog)**
- ✅ Auto-opens after admin uploads a document with loading → main → feedback-default → feedback-detail states
- ✅ AI (gpt-4o-mini, structured JSON output) analyzes the document and suggests: filename, folder (existing or new), tags (existing or new), confidence %, and summary
- ✅ Admin can edit any suggested field before accepting, or skip suggestions entirely
- ✅ Optional feedback step: thumbs up/down + textarea comment stored in new `ai_upload_feedback` table

**Version Control**
- ✅ Detects new versions two ways: exact filename match OR content similarity ≥ 0.85 via embedding cosine (reuses `match_documents` RPC)
- ✅ New `documents` columns: `parent_document_id` (self-FK), `is_current`, `version_number`, `ai_suggestion`, `ai_applied_at`
- ✅ On accept with version match: previous doc flipped to `is_current=false`, new doc linked to root via `parent_document_id`, `version_number` incremented
- ✅ File detail view shows version history timeline with current version highlighted in pink
- ✅ Document list API now filters `is_current=true` so superseded versions hide from default view

**UI Polish**
- ✅ Moved "อัปโหลดเอกสารใหม่" and "สร้างโฟลเดอร์ใหม่" CTAs to the top-right of the folder view content area
- ✅ Removed duplicated "เมนูอื่นๆ" (Quick Actions) section from the sidebar; only "ถาม-ตอบ" entry retained
- ✅ Sidebar narrowed from 280px to 260px
- ✅ Subfolder empty state rewritten as an upload-primary drop zone (drag-and-drop opens upload dialog with file pre-loaded)

**Admin Dashboard — AI Feedback Card**
- ✅ New "คำแนะนำ AI — ฐานข้อมูล" card on the admin dashboard (30-day window)
- ✅ Shows total feedback count, satisfaction %, thumbs-down count, and green/red satisfaction bar
- ✅ Top accepted fields histogram (filename/folder/tags chips)
- ✅ Most recent 5 comments with thumbs icon, document title, and date
- ✅ Empty state with a link back to the knowledge base

**Engineering / Tooling**
- Migration: `supabase/migrations/20260424_knowledge_versioning_ai.sql` — versioning columns + `ai_upload_feedback` table + RLS (admin read/insert)
- Types regenerated via `supabase gen types`; all 18 custom aliases re-added
- 5 new API routes under `/api/admin/knowledge/`: `analyze`, `apply-suggestion`, `feedback`, `documents/[id]/versions`
- 1 new API route: `/api/admin/ai-feedback-stats`
- 5 new hooks in `use-knowledge.ts`: `useAnalyzeDocument`, `useApplySuggestion`, `useAISuggestionFeedback`, `useDocumentVersions`, `useAIFeedbackStats`
- New i18n keys: `admin.knowledgeBase.header.*`, `admin.knowledgeBase.ai.*`, `admin.knowledgeBase.version.*`, `admin.knowledgeBase.folder.empty*`, `admin.dashboardPage.aiFeedback.*` (Thai + English)
- Build: `npm run build` clean, `npx tsc --noEmit` clean

**Files Changed**

NEW:
- `supabase/migrations/20260424_knowledge_versioning_ai.sql`
- `src/lib/knowledge/detect-version.ts` — filename + embedding similarity detection
- `src/lib/knowledge/ai-analyze.ts` — GPT-4o-mini structured JSON analyzer
- `src/app/api/admin/knowledge/analyze/route.ts`
- `src/app/api/admin/knowledge/apply-suggestion/route.ts`
- `src/app/api/admin/knowledge/feedback/route.ts`
- `src/app/api/admin/knowledge/documents/[id]/versions/route.ts`
- `src/app/api/admin/ai-feedback-stats/route.ts`
- `src/components/admin/knowledge/ai-suggestion-dialog.tsx` — 4-state dialog
- `src/components/admin/dashboard/dashboard-ai-feedback-card.tsx`

MODIFIED:
- `src/components/admin/knowledge/knowledge-sidebar.tsx` — width 260px, Quick Actions removed
- `src/components/admin/knowledge/knowledge-page-content.tsx` — AI dialog wired post-upload
- `src/components/admin/knowledge/folder-view.tsx` — top-right CTAs, drop-zone empty state, current folder title
- `src/components/admin/knowledge/upload-document-dialog.tsx` — accepts `defaultFile` prop
- `src/components/admin/knowledge/file-detail-view.tsx` — version history timeline
- `src/components/admin/knowledge/file-table.tsx` — `version_number` display (X.0)
- `src/app/api/admin/knowledge/documents/route.ts` — filter `is_current=true`
- `src/components/admin/dashboard/dashboard-page-content.tsx` — inserted AI feedback card
- `src/hooks/use-knowledge.ts` — 5 new hooks + extended `KnowledgeDocument` interface
- `src/lib/supabase/types.ts` — regenerated from DB
- `src/messages/th.json`
- `src/messages/en.json`

---

## 🎯 V2.1.2 Updates (2026-04-24)

### Student Profile Edit Flow

**Features**
- ✅ Added real `/[locale]/profile/edit` page for student profile editing
- ✅ Editable fields now save directly to Supabase `profiles`: `display_name`, `phone`, `email`
- ✅ New mobile-first split between editable and read-only sections
- ✅ Read-only section now shows student ID, legal name, faculty, building, room, and bed
- ✅ Building/room/bed labels resolve from relational data instead of raw IDs
- ✅ Main profile page "Edit Profile" CTA now links to the real edit page
- ✅ Logout moved from `/profile/settings` to the bottom of `/profile`
- ✅ Logout redirect now respects current locale
- ✅ Added Thai/English i18n labels and validation messages for profile editing

**Engineering / Tooling**
- Fixed new page header usage to `backHref="/profile"`
- Added locale-aware validation for display name, phone number, and email
- Ignored local-only files in git: `.gemini/`, `agent.md`, `admin-dashboard-mockup.html`
- Updated ESLint config to flat config for Next 16
- Changed `npm run lint` to execute `eslint .`

**Files Changed**
- `src/app/[locale]/(student)/profile/edit/page.tsx`
- `src/components/student/profile/edit-profile-form.tsx`
- `src/components/student/profile/profile-content.tsx`
- `src/components/student/profile/profile-info-card.tsx`
- `src/components/student/profile/settings-content.tsx`
- `src/components/student/logout-button.tsx`
- `src/messages/th.json`
- `src/messages/en.json`
- `.gitignore`
- `eslint.config.mjs`
- `package.json`

**Verification**
- TypeScript check passed: `npx tsc --noEmit`
- Production deploy succeeded on Vercel and was aliased to `https://c-madong-product.vercel.app`
- Repo-wide lint still has unrelated legacy errors outside this change set

**Commit**
- `008e7e9` — `Add student profile editing flow`

---

## 🎯 V2.1.1 Updates (2026-04-23)

### Dashboard Performance Fix

**Root Cause**
- Info card overfetched residence data — loaded ALL rooms in building + ALL beds in room just to show 1 building/room/bed label
- Insights API slow — sequential DB queries + optional OpenAI call created waterfall
- No loading UI — users saw empty state during load

**Optimizations Applied**
- ✅ New `useResidenceInfo()` hook — fetches exact building/room/bed by ID in parallel (not full collections)
- ✅ Optimized building/room/bed hooks — select only needed columns, increase `staleTime` 5min cache
- ✅ Parallelized insight queries — replaced sequential awaits with `Promise.all()`
- ✅ Disabled AI enrichment for dashboard insights route — no OpenAI wait on first paint
- ✅ Added loading skeleton UI — fixed 180px height, prevents layout shift

**Files Changed (4)**
- `src/hooks/use-buildings.ts` — new hook + optimized queries
- `src/components/student/dashboard/dashboard-info-card.tsx` — loading UI
- `src/lib/insights/generate.ts` — parallel queries
- `src/app/api/student/insights/route.ts` — disabled AI enrichment

**Performance Impact**
- Reduced triple waterfall to parallel queries
- Eliminated OpenAI latency on dashboard route
- Fixed layout shift with skeleton UI

---

## 🎯 V2.1 Updates (2026-04-21)

### Chatbot Improvements (3 Phases)

**Phase 1: Intent Misclassification Fix**
- ✅ AI classification now primary, keywords demoted to fallback (confidence 0.7 not 0.9)
- ✅ Removed overly broad keywords causing false positives:
  - `"ไฟ"` → `"ไฟเสีย"`, `"ไฟไม่ติด"` (avoids matching "ค่าไฟ")
  - `"ตู้"` → `"ตู้พัง"`, `"ตู้ล็อคไม่ได้"` (avoids matching "ตู้เย็น" buying queries)
  - `"ซ่อม"` → `"แจ้งซ่อม"` (compound only)
  - `"เสีย"` → `"เสียหาย"`, `"ใช้ไม่ได้"` (avoids "เสียใจ")
- ✅ Added exclusion patterns: billing (ค่าไฟ/ค่าน้ำ), buying (ซื้อ), status checks (สถานะ/ติดตาม)
- ✅ Enhanced intent prompt with disambiguation examples + `extractedInfo.subtype` for `new_request` vs `status_check`
- ✅ Generic "ติดตามสถานะ" now shows disambiguation menu (repair/parcel/billing/events)
- ✅ Camera quick replies: `type: "camera"` opens camera, `type: "cameraRoll"` opens gallery on LINE

**Phase 2: RAG Accuracy**
- ✅ Sentence-aware chunking — splits at Thai boundaries (`.`, `\n`), 800 chars max (was 500), 100 overlap
- ✅ New shared chunker: `src/lib/knowledge/chunk-text.ts` with naive fallback
- ✅ Improved RAG prompt: explicit irrelevance rule, anti-hallucination, source citation, bullet format
- ✅ Reduced max_tokens: 500 → 300 for knowledge responses

**Phase 3: Response Length Optimization**
- ✅ Brevity rules: 1-2 sentences max (not over 3 lines)
- ✅ Emoji bullets allowed (• or 1. 2. 3.), markdown syntax forbidden
- ✅ Chitchat max_tokens: 200 → 150
- ✅ Truncation safety net: 2000 char limit, finds Thai sentence boundary

### Files Changed
**13 files modified:**
- `intent-router.ts` — AI primary, keyword fallback
- `constants.ts` — keyword fixes + exclusion patterns
- `system-prompts.ts` — intent + RAG + chitchat prompts enhanced
- `types.ts` — camera/cameraRoll action types
- `suggestions.ts` — camera quick reply buttons
- `webhook-handler.ts` — disambiguation menu + truncation + subtype routing
- `upload/route.ts` + `process/route.ts` — use shared chunker (800, 100)
- `answer-generator.ts` — max_tokens 300
- `chitchat.ts` — max_tokens 150

**1 file created:**
- `src/lib/knowledge/chunk-text.ts` — sentence-aware chunking

### Post-Deploy Action Required
Admin must reprocess existing docs from Knowledge Base UI to get new sentence-aware chunks.

### Breaking Changes
None - backward compatible with V2.0

---

## 🎯 V2.0 Updates (2026-04-20)

### What's New in V2
- ✅ Complete dashboard quick menu navigation (all 12 buttons functional)
- ✅ Building Information page with enhanced UX design
- ✅ Documents library page with categorization
- ✅ Professional UI/UX enhancements throughout
  - Cursor pointer on all interactive elements
  - Smooth 200ms transitions
  - Hover scale transforms
  - Gradient backgrounds with colored shadows
  - 44px minimum touch targets
  - Backdrop blur effects

### Breaking Changes
None - backward compatible with V1

---

## 🎯 V1 Overview (2026-04-10)

> **Version 1.0.0** — First production release

---

## 🎯 V1 Overview

C-Madong V1 เป็น digital platform สำหรับการจัดการหอพักนิสิตจุฬาฯ ครอบคลุม 9 ระบบหลัก:
- Authentication & Onboarding
- Admin Dashboard (15 pages)
- Billing & Payment Tracking
- Parcel Management
- Maintenance Request (with AI Vision)
- Student Scoring System
- AI-Powered Chatbot (น้องซีมะโด่ง)
- Knowledge Base & Live Chat
- Announcements & Emergency Contact

**Tech Stack**: Next.js 16 · Supabase · LINE Platform · OpenAI · TanStack Query · Zustand

---

## Phase 0: Scaffold (COMPLETE — 2026-02-16)

### Features
- ✅ Next.js 16 App Router setup with Turbopack
- ✅ Tailwind v4 + shadcn/ui (new-york variant)
- ✅ Supabase integration (@supabase/ssr)
- ✅ next-intl v4 (Thai/English)
- ✅ Custom fonts (Chulalongkorn + ChulaCharasNew)
- ✅ 45 initial pages scaffolded
- ✅ Project structure: admin `/admin/*`, student `(student)/*`, auth `(auth)/*`

### Technical Decisions
- Root layout with `<html>` + `<body>` (Next.js 16 requirement)
- Locale layout with providers only (no html/body duplication)
- Zod v4 for validation (`from "zod/v4"`)

---

## Phase 1: Authentication (DEPLOYED — 2026-02-23)

### Features
- ✅ LINE Login OAuth integration
- ✅ Student registration flow with faculty field (free-text input)
- ✅ Onboarding: Building + Floor (1-17) + Room + Bed selection
- ✅ Bed selection UI: Button group (2-col for ชวนชม, 4-col for others)
- ✅ Dev login shortcuts (localhost only)

### Database
- `profiles` table: added `faculty` TEXT column (nullable)
- `buildings`: `floors = 17`
- `rooms`: 680 rooms seeded (5 buildings × 17 floors × 8 rooms)
- `beds`: 2,448 beds seeded (capacity rule: ชวนชม=2, others=4)

### Migrations
- `20260408_register_flow_enhancements.sql` — faculty + floors 17
- `20260409_seed_floors_6_to_17.sql` — 480 rooms + 160 beds backfilled

### Files
- `/register` page with faculty input
- `/onboarding` page with bed button group
- `src/lib/validators/auth.ts` — registerSchema + faculty validation
- `POST /api/auth/register` — profile creation

---

## Phase 2: Admin Dashboard (DEPLOYED — 2026-02-28)

### Features
- ✅ 15 admin pages (from Lovable scaffold)
- ✅ Admin layout with collapsible sidebar
- ✅ Permission-based navigation filtering (RBAC)
- ✅ Dashboard stats cards + activity feed

### Pages
- Admin Dashboard, Students, Billing, Events, Parcels, Scores, Maintenance, Knowledge Base, Roles, Settings, Broadcast, Templates, Tags, Announcements, Live Chat

### RBAC System
- 12 roles (super_admin, admin_staff, dorm_manager, etc.)
- 80+ permissions
- `user_roles` table with building scopes
- Legacy role mapping: `"admin"` → `"super_admin"`, `"staff"` → `"admin_staff"`

### Components
- `admin-shell.tsx` — sidebar with permission filtering
- `admin-logout-button.tsx`
- 17 admin component directories

---

## Phase 3: Billing (DEPLOYED — 2026-03-09)

### Features
- ✅ Bill generation (monthly rent + utilities)
- ✅ Payment tracking
- ✅ LINE Flex bill reminder (hero banner design from Figma)
- ✅ Student billing dashboard

### Database
- `bills` table with status tracking
- Bill items: rent, water, electricity

### API Routes
- `POST /api/admin/bills` — create bills
- `GET /api/student/bills` — student view

### Components
- Student billing page with payment history
- Admin billing CRUD

---

## Phase 4: Parcels (DEPLOYED — 2026-03-17)

### Features
- ✅ Admin parcel management (CRUD)
- ✅ Student parcel tracking
- ✅ LINE Flex notification with hero banner (`Inbox.jpg`)
- ✅ Chatbot parcel carousel (tracking numbers + pickup)

### Database
- `parcels` table with statuses: pending, ready, collected

### LINE Integration
- Flex message: parcel ready notification
- Chatbot: parcel history + status check

### Components
- `src/components/student/parcels/` — student UI
- `src/components/admin/parcels/` — admin CRUD
- `src/lib/line/flex-builders/parcel.ts`
- `src/lib/chatbot/handlers/parcel.ts`

---

## Phase 4.5: Vision AI (DEPLOYED — 2026-03-28)

### Features
- ✅ AI-powered repair image analysis
- ✅ Template matching with pgvector (20 seeded templates)
- ✅ Multi-provider orchestration (OpenAI primary, Gemini fallback)
- ✅ Automatic category + urgency detection

### Technical Implementation
- **Template Search**: text-embedding-3-small vectors, 0.85 similarity threshold
- **Vision Analysis**: GPT-4o (primary) → Gemini 2.0 Flash (fallback) → Keyword fallback
- **Categories**: 20 repair templates across plumbing, electrical, aircon, furniture, pest
- **Feature Flag**: `ENABLE_VISION_ANALYSIS=true`

### Database
- `repair_templates` table with pgvector extension
- `maintenance_requests`: added `ai_confidence`, `ai_provider`, `template_id`, `damage_details`

### Migrations
- `20260322_repair_templates.sql` — pgvector + repair_templates table

### Files
- `src/lib/ai/orchestrator.ts` — VisionOrchestrator
- `src/lib/ai/agents/vision-agent.ts` — multi-provider logic
- `scripts/seed-repair-templates.ts` — 20 templates with embeddings
- `scripts/test-vision-ai.ts` — test suite

---

## Phase 5: Student Scoring (DEPLOYED — 2026-03-16)

### Features
- ✅ Score calculation (mandatory, external, internal activities)
- ✅ Admin score CRUD
- ✅ Student score dashboard (stacked bar chart)
- ✅ LINE Flex score cards (event registration confirmation)

### Database
- `student_scores` table
- Score categories: mandatory (-deduct), external (+bonus), internal (+bonus)

### Components
- 21 UI files for score management
- Student score page with breakdown
- Admin score assignment

### LINE Integration
- `src/lib/line/flex-builders/score.ts`
- Event registration Flex with score info

---

## Phase 6: AI-Powered UX (DEPLOYED — 2026-03-17)

### Features
- ✅ In-app notifications (bell icon + real-time updates)
- ✅ AI-generated insights (personalized dashboard cards)
- ✅ Notification triggers (bill overdue, parcel ready, etc.)
- ✅ Chatbot enhancements (chitchat, knowledge RAG)

### Chatbot (น้องซีมะโด่ง)
- **Model**: gpt-4o-mini
- **Handlers**: 8 intent handlers (chitchat, knowledge, repair, parcel, score, events, escalation, postback)
- **RAG**: Knowledge base Q&A with vector search
- **Flex Messages**: 7 builders (response, events, parcel, repair-confirm, repair-status, score, greeting-carousel)

### Notification System
- In-app notifications with priority levels
- LINE push notifications
- Notification categories: bill, parcel, maintenance, score, event, announcement

### Files
- `src/lib/notifications/` — create, triggers, priority, line-push
- `src/lib/insights/` — AI-generated insights
- `src/lib/chatbot/` — webhook-handler, intent-router, handlers/, rag/

---

## Phase 7: LIFF (SCAFFOLDED — 2026-03-11)

### Status
⚠️ **Partially Implemented** — SDK init + auth bridge only

### Implemented
- LIFF SDK initialization
- Auth state bridging

### Pending
- Full LIFF Mini App features
- Reserved for V2 development

---

## Phase 7.5: LINE Onboarding (DEPLOYED — 2026-04-08)

### Features
- ✅ **Welcome Bubble** for new users (single bubble on follow event)
- ✅ **Onboarding Carousel** (6 bubbles, Figma designs)
- ✅ **Guide triggers** ("ดูคู่มือการใช้งานน้องซีมะโด่ง")
- ✅ **Banner assets** optimized (4.6MB → 684KB)

### Design Implementation
- **Welcome Bubble**: Pink CU header (#DD598B) + 3 numbered steps + 2 CTAs
- **6 Carousel Bubbles**: Alternating pink/cream themes, square 1:1 hero banners
  1. เริ่มต้นใช้งานง่ายๆ (pink)
  2. ถามอะไรตอบได้ (cream)
  3. แจ้งซ่อมได้ง่ายกว่าที่เคย (pink)
  4. แจ้งเตือนอัจฉริยะ (cream)
  5. LINE MINI APP (cream)
  6. ยังมีอีกเยอะ (pink)

### Assets
- 6 JPEG banners at `public/line-banners/onboarding-{1-6}-{slug}.jpg`
- Optimized: 1800×1800 → 1040×1040, JPEG q75
- Total size: 684KB

### User Flow
- New user follows → Welcome bubble
- Taps "ดูคู่มือ" → 6-bubble carousel
- Registered user follows → Welcome back bubble + Menu B swap

### Files
- `src/lib/chatbot/flex-builders/greeting-carousel.ts` — welcome + onboarding builders
- `src/lib/chatbot/webhook-handler.ts` — GUIDE_TRIGGERS + follow event logic
- `public/line-banners/` — 6 optimized banner images

---

## Additional Features (Deployed Post-Launch)

### In-App Chat Modal (2026-03-21)
- ✅ Bottom sheet chat interface (85vh)
- ✅ Drag-to-dismiss with backdrop
- ✅ Chat history with date grouping
- ✅ Clear session button
- ✅ Suggestion chips
- ✅ Reuses all chatbot handlers (except repair → redirects to LINE)

### LINE Flex Repair Messages (2026-03-19)
- ✅ **3 Figma designs**: Ticket Created, Status Tracking Timeline, Repair Done
- ✅ Postback handlers: track, cancel, history
- ✅ Color-coded urgency badges
- ✅ Vertical timeline with technician info

### RBAC Wired Up (2026-03-21)
- ✅ Admin sidebar permission filtering
- ✅ Legacy role mapping in hooks
- ✅ Admin API routes with `createAdminClient()`
- ✅ Role assignment with auth verification

### Knowledge Base v3 (2026-03-22)
- ✅ 2-panel layout with collapsible sidebars
- ✅ Folder hierarchy with CRUD
- ✅ Document tags (many-to-many)
- ✅ Per-document Q&A (RAG scoped)
- ✅ File table with bulk actions

### Student Profile (2026-03-24)
- ✅ **3 Figma designs**: Profile Main, Settings, Digital ID Card
- ✅ Avatar + stats (days in dorm, events attended)
- ✅ Score summary (stacked bar)
- ✅ Digital ID card with fullscreen lightbox
- ✅ Settings page with toggle switches

### AI Settings (2026-04-01)
- ✅ Admin AI configuration panel
- ✅ Model select (gpt-4o-mini / gpt-4o)
- ✅ Temperature slider with presets (Focused/Balanced/Creative)
- ✅ Tone presets (Professional/Friendly/Casual)
- ✅ Vision AI toggle + confidence threshold
- ✅ Mock AI cost dashboard (฿245.50/mo)
- ✅ Dynamic system prompt generation

### Live Chat Handoff (2026-04-01)
- ✅ Student escalation ("คุยกับทีมงาน")
- ✅ Admin queue with claim system
- ✅ Real-time polling (3s refetchInterval)
- ✅ LINE notification to all admins
- ✅ Chat history archive
- ✅ Close & return to AI

### Announcements v2 (2026-04-02)
- ✅ Bookmark toggle (heart icon)
- ✅ Event registration
- ✅ Read tracking
- ✅ Document attachments
- ✅ Profile saved section (horizontal scroll)

### Emergency Contact (2026-04-02)
- ✅ Animated hero with phone CTA
- ✅ Draggable bottom sheet
- ✅ 5 category tabs (dorm, hospital, security, internal, external)
- ✅ 19 mock contacts with tel: links

### Context-Specific Quick Reply Menus (2026-04-13)
- ✅ **Unique trigger keywords** for onboarding carousel bubbles 2-4
- ✅ **3 new quick reply menus** (ASK, REPAIR_GUIDE, SMART_NOTIFY)
- ✅ Bubble 2 "ถามคำถาม" → 📋 กฎหอพัก | 💰 ค่าหอ/ค่าน้ำค่าไฟ | 🏢 สิ่งอำนวยความสะดวก
- ✅ Bubble 3 "คู่มือแจ้งซ่อม" → repair guide text + 🔧 ลองแจ้งซ่อมเลย
- ✅ Bubble 4 "แจ้งเตือนอัจฉริยะ" → 📊 คะแนนหอ | 📦 พัสดุ | 💰 ค่าหอพัก
- ✅ Pre-rate-limit triggers for unregistered user access
- ✅ Dynamic imports for performance optimization

**Lessons Learned**:
- Pattern recognition: audit ALL carousel bubbles for duplicates, not just one mentioned
- CTA preservation: enhance not delete, maintain UX flow
- Webhook trigger placement: pre-rate-limit for onboarding accessibility
- Think holistically when modifying flows

### Announcements Organize (2026-04-15)
- ✅ **Full backend wiring** of `/admin/announcements/organize` mockup → real database
- ✅ **3 new tables**: `announcement_folders` (hierarchical), `announcement_tags` (UNIQUE), `announcement_tag_assignments` (junction)
- ✅ **Folder management**: Create, edit, delete with parent-child hierarchy + Lucide icons
- ✅ **Tag management**: Color-coded tags with UNIQUE constraint + 409 duplicate handling
- ✅ **Bulk operations**: Move to folder, add tags, archive (soft delete), restore
- ✅ **Archive system**: `archived_at` timestamp, filter toggle, restore functionality
- ✅ **Cover image upload**: Drag-and-drop with Supabase Storage bucket `announcement-covers`
- ✅ **14 TanStack Query hooks** in `use-announcement-organize.ts`
- ✅ **7 API routes**: folders CRUD, tags CRUD, bulk operations, upload-cover
- ✅ **Dynamic Lucide icons**: `DynamicLucideIcon` renderer + `LucideIconPicker` (50 curated icons)
- ✅ **~65 i18n keys** added for formal Thai/English UI text
- ✅ **Type regeneration**: 25+ cascading type errors fixed after `supabase gen types`

**Database** (Migration: `20260415_announcement_folders_tags.sql`):
- `announcement_folders` — hierarchical (parent_id FK), Lucide icon name, color, sort_order
- `announcement_tags` — UNIQUE name, color
- `announcement_tag_assignments` — many-to-many junction
- `announcements` altered: +`folder_id` (FK, ON DELETE SET NULL), +`archived_at` (TIMESTAMPTZ)
- RLS: authenticated SELECT, admin-only ALL
- Seed: 6 folders + 5 tags

**Lessons Learned**:
- `supabase gen types` wipes custom type aliases — always re-add after regeneration
- `profile.role` became nullable in generated types — fix with `!` assertions or `?? "student"` fallback
- `tag.color` nullable → use `?? undefined` for CSS style props
- Budget for type cascading errors when regenerating — use batch fixes not one-by-one

### Evaluation System (2026-04-14)
- ✅ **3 evaluation form types**: Shop Evaluation (ประเมินร้านค้า), Dorm Re-application (ยื่นขออยู่หอต่อ), Document Upload (อัปโหลดผลลงทะเบียนเรียน)
- ✅ **Shop evaluation**: Multi-step flow (5 shops), 4 criteria per shop (ความสะอาด, คุณภาพสินค้า, ราคา, ข้อเสนอแนะ), 1-5 rating scale, skip/undo per criterion
- ✅ **Dorm re-application**: 2-step flow — conditions review + personal info verification → submit
- ✅ **Document upload**: Single-step — file upload zone (JPEG/PDF, 10MB max) → submit
- ✅ **Shared UI components**: StepIndicator, RatingScale, CriterionCard, EvaluationHeader, StickyBottomBar, PersonalInfoCard, DocumentUploadZone
- ✅ **Completion tracking**: Already-submitted evaluation shows completion notice with submitted date
- ✅ **Integration with events**: Evaluation events show "ทำแบบประเมิน" CTA on events list

**Database** (4 new tables):
- `evaluation_forms` — form config per event (form_type, config JSONB, total_steps)
- `evaluation_criteria` — rating/textarea questions
- `evaluation_responses` — per-criterion per-step per-student responses
- `evaluation_submissions` — overall progress tracking (in_progress/completed/skipped)
- Migration: `20260414_evaluation_system.sql` with seed data (3 events, 5 shops, 4 criteria)

**API Routes**:
- `GET /api/student/evaluation/[formId]` — form config + criteria + submission
- `POST /api/student/evaluation/[formId]` — save step responses
- `POST /api/student/evaluation/[formId]/submit` — mark as completed
- `POST /api/student/evaluation/[formId]/upload` — file upload to Supabase storage

**Components** (10 files in `src/components/student/evaluation/`):
- step-indicator, rating-scale, criterion-card, evaluation-header, sticky-bottom-bar
- personal-info-card, document-upload-zone, shop-evaluation-content
- dorm-reapplication-content, document-upload-content, evaluation-page-content

**Lessons Learned**:
- Fixed bottom bar inside `(student)` route group needs `bottom-[72px]` to sit above bottom nav
- TanStack Query `invalidateQueries` during multi-step async flows causes re-renders → use direct `fetch()` instead
- `useRef` for busy guards avoids React state batching leaving buttons disabled
- `profiles.id` is the FK to `auth.users`, NOT `profiles.auth_id`
- Seed data dates must be in the future for events to appear in "upcoming" tab

---

## Database Summary (V1)

### Tables Created
26 migrations · 47+ tables

**Core Auth & Users**:
- `profiles`, `user_roles`, `buildings`, `rooms`, `beds`

**Features**:
- `bills`, `bill_items`, `parcels`, `maintenance_requests`, `student_scores`, `event_registrations`, `announcements`

**AI & Knowledge**:
- `documents`, `knowledge_folders`, `document_tags`, `document_tag_assignments`, `repair_templates`

**Evaluation**:
- `evaluation_forms`, `evaluation_criteria`, `evaluation_responses`, `evaluation_submissions`

**Chatbot**:
- `ai_chat_sessions`, `ai_chat_messages`, `chat_escalations`

**Notifications**:
- `notifications`, `announcement_bookmarks`, `announcement_registrations`, `announcement_reads`
- `announcement_folders`, `announcement_tags`, `announcement_tag_assignments`

### Extensions
- `pgvector` — for embeddings
- `uuid-ossp` — for UUIDs

---

## API Routes Summary (V1)

### Student APIs (`/api/student/`)
- bills, evaluation/[formId] (GET/POST), evaluation/[formId]/submit, evaluation/[formId]/upload, insights, maintenance/[id]/cancel, notifications, parcels

### Admin APIs (`/api/admin/`)
- ai, announcements (+ folders, tags, bulk, upload-cover), bills, booking, knowledge (6 sub-routes), live-chat, maintenance, parcels, roles, scores, settings, students

### Shared APIs (`/api/`)
- auth (9 routes), chat, chat/escalate, chat/history, chat/messages, chatbot (LINE webhook), flex, maintenance, webhooks

---

## LINE Integration Summary (V1)

### Channels
- **LINE Login**: OAuth authentication
- **Messaging API**: Chatbot + push notifications

### Flex Messages (6 builders in `/lib/line/`)
- Bill reminder (hero banner)
- Booking confirmation
- Parcel notification (hero banner)
- Repair notification (3 states)
- Repair tracking (timeline)
- Score card

### Chatbot Flex (7 builders in `/lib/chatbot/`)
- Response template
- Events carousel
- Parcel carousel
- Repair confirm (hero banner)
- Repair status (2 designs)
- Score card
- Greeting carousel (welcome + onboarding)

### Banner Assets
- `Inbox.jpg` — parcel notification
- `New_Request.jpg` — repair confirm
- 6× onboarding carousel banners (optimized, 684KB total)

---

## State Management (V1)

### Zustand Stores (6)
- `user-store` — auth state
- `notification-store` — in-app notifications
- `ui-store` — UI state (sidebar collapse, modals)
- `chat-store` — chat modal state
- `knowledge-store` — knowledge base state
- `maintenance-store` — maintenance state

### TanStack Query Hooks (27)
- use-user, use-notifications, use-insights, use-permissions, use-bills, use-score, use-events, use-evaluation, use-parcels, use-maintenance-tickets, use-my-tickets, use-chat, use-knowledge, use-knowledge-query, use-announcements, use-announcement-organize, use-buildings, use-dashboard-stats, use-documents, use-realtime, use-role-management, use-students, use-tags, use-technicians, use-templates, use-ai-settings, use-escalations

---

## Known Issues & Gotchas (V1)

### Supabase
- PL/pgSQL loop variable vs column name collision → use prefix `v_`
- RLS infinite recursion → use `is_admin()` SECURITY DEFINER
- FK to `auth.users` ≠ FK to `profiles` for PostgREST joins
- New tables not in generated types → cast `(supabase as any).from("table")`

### React / Next.js
- `= []` default in useQuery + useEffect sync → infinite re-render
- Next.js 16: root layout MUST have `<html>` + `<body>`
- `useSearchParams()` requires `<Suspense>` boundary
- iOS Safari modal scroll-lock: NEVER use `overflow: hidden` on `body`
- Fixed bottom bar inside `(student)` route group needs `bottom-[72px]` — bottom nav covers `bottom-0` elements
- TanStack Query `invalidateQueries` during multi-step async flows causes component re-renders → use direct `fetch()` instead of mutations
- React state-based loading (`isPending`, `useState`) can leave buttons stuck disabled due to batching → use `useRef` for busy guards

### LINE
- Login vs Messaging API are SEPARATE channels
- Flex `backgroundColor` only accepts hex, NOT `rgba()`
- Carousel max 10 bubbles
- Fire-and-forget `fetch()` dies when response returns → always `await`

### Vercel
- Git Author check blocks CLI deploy
- `echo` adds trailing `\n` to env vars → use `printf '%s'`

---

## Performance & Optimization (V1)

### Build
- Turbopack for faster dev builds
- Next.js 16 App Router with Server Components

### Caching
- AI settings cached 5 min server-side
- TanStack Query with stale-while-revalidate

### Real-time
- Polling-based (3s refetchInterval) — no WebSockets

### Assets
- Banner images optimized: 4.6MB → 684KB (JPEG q75)
- Local fonts (Chulalongkorn + ChulaCharasNew)

---

## V1 Release Checklist

- ✅ All Phase 0-7.5 features deployed
- ✅ LINE Messaging API live in production
- ✅ Chatbot (น้องซีมะโด่ง) working end-to-end
- ✅ Vision AI tested with real images
- ✅ RBAC permission filtering working
- ✅ Admin live chat handoff tested
- ✅ Emergency contact page deployed
- ✅ Git tag v1.0.0 created
- ✅ CHANGELOG_V1.md documented
- ✅ V1_FEATURES.md created
- ✅ PRD.md updated with V2 planning section

---

## What's Next: V2 Roadmap

### Phase 7.7: Evaluation System ✅ (2026-04-14)
- See "Evaluation System" in Additional Features section above

### Announcements Organize ✅ (2026-04-15)
- See "Announcements Organize" in Additional Features section above

### Phase 8: Reports (NOT STARTED)
- Admin analytics dashboards
- Export functionality (PDF/Excel)
- Data visualization

### Phase 9: Polish (NOT STARTED)
- Performance optimization
- Accessibility audit
- UX refinements

### LIFF Mini App (Pending)
- Full LIFF integration
- In-app features (QR code, camera, etc.)

### Future Enhancements
- WebSocket real-time updates (replace polling)
- Push notifications (web + mobile)
- Advanced AI features (sentiment analysis, predictive maintenance)

---

**C-Madong V1** — Built with ❤️ by Khaoklong
Tech Stack: Next.js 16 · Supabase · LINE · OpenAI · TailwindCSS
Production: https://c-madong-product.vercel.app

## Announcement AI Poster Upload v2.4.0 (DEPLOYED — 2026-04-27)

### Features
- ✅ **Poster Upload Wizard** — 3-step UI: dropzone → AI analyzing → review. Mode toggle: รูป+ข้อความ (OCR) vs รูปอย่างเดียว (image only)
- ✅ **Typhoon OCR** (primary) — Thai-optimized OCR via `api.opentyphoon.ai`. Outperforms GPT-4o/Gemini 2.5 Flash on stylized Canva posters. Falls back to GPT-4o vision on 5xx/timeout
- ✅ **gpt-4o-mini Structurer** (`announcement-agent.ts`) — Converts OCR markdown → JSON: title_th/en, content, category, event_date (ISO), location, has_dorm_score, folder_id, tag_ids. Validates returned IDs against existing DB, drops hallucinations
- ✅ **AI Suggestion Dialog** — 4-state flow (loading → main edit → thumbs feedback → comment). All fields editable before save. Feedback stored in `announcement_ai_feedback` table
- ✅ **New `event_date` DB column** — Date of the event itself (separate from published_at). Extracted by AI. Shown in student activity carousel and announcement detail
- ✅ **Bot RAG integration** — `announcements.embedding vector(1536)` + `is_bot_searchable` toggle. `match_documents` RPC extended via UNION — น้องซีมะโด่ง can now answer questions about announcements and returns Flex resource cards (cover image + title + ดูประกาศ CTA)
- ✅ **Year filter** on organize page — derived from `created_at`, shows พ.ศ. year dropdown
- ✅ **"Paste from Facebook" mockup pill** — opens future-feature dialog (no backend yet)
- ✅ **Bot searchable switch** in create form — default ON
- ✅ `scripts/embed-existing-announcements.ts` — one-shot backfill for existing published announcements

### New Files
- `src/lib/ai/typhoon-ocr.ts`, `src/lib/ai/agents/announcement-agent.ts`
- `src/app/api/admin/announcements/analyze-poster/route.ts`, `[id]/embed/route.ts`, `[id]/ai-feedback/route.ts`
- `src/lib/chatbot/flex-builders/announcement-resource-card.ts`
- `src/components/admin/announcements/poster-upload-flow.tsx`, `ai-suggestion-dialog.tsx`
- `scripts/embed-existing-announcements.ts`
- `supabase/migrations/20260501_announcement_ai_extraction.sql`

### Modified Files
- `src/lib/chatbot/rag/vector-search.ts` (SearchResult type + source_type field)
- `src/lib/chatbot/rag/answer-generator.ts` (announcement carousel on high-similarity hits)
- `src/lib/chatbot/handlers/knowledge.ts` (replyToken param for multi-message reply)
- `src/lib/chatbot/webhook-handler.ts` (pass replyToken to knowledge handler)
- `src/app/api/admin/announcements/route.ts` (POST handler + year filter)
- `src/app/api/admin/knowledge/query/route.ts` (filter source_type=document only)
- `src/components/admin/announcements/new-announcement-page-content.tsx` (AI CTA + new fields)
- `src/components/admin/announcements/organize/components/filter-bar.tsx` (year dropdown)
- `src/components/student/announcements/announcement-detail-content.tsx` (event_date display)
- `src/components/student/news/featured-activity-carousel.tsx` (event_date in caption)
- `src/lib/supabase/types.ts` (regenerated + 18 aliases + pre-existing enum fixes)
- Env: `TYPHOON_OCR_API_KEY` added to Vercel prod + `.env.local.example`

### AI Pipeline Cost
- Typhoon OCR: ~฿0.50/poster | gpt-4o-mini structure: ~฿0.10 | embedding: ~฿0.01 → **~฿0.61/poster**

### Commit
- `da90965` — feat(announcements): AI poster upload — Typhoon OCR + bot RAG v2.4.0

---

## Student Menu Nav + Bottom Sheet Arrangement (DEPLOYED — 2026-04-23)

### Features
- ✅ Bottom nav now uses `หน้าหลัก | เมนู | ปฏิทิน | แจ้งเตือน | บัญชีของฉัน`
- ✅ Added dedicated `เมนู` trigger in bottom nav with active white/bold state while the sheet is open
- ✅ New menu bottom sheet opens from the bottom with spring motion and supports drag-down to close
- ✅ Backdrop stops above the nav bar so the nav shadow remains visible
- ✅ Rearrange mode supports drag-and-drop menu sorting with draft state
- ✅ Menu order persists only when user confirms with `เสร็จสิ้น`
- ✅ Dashboard quick menu now reads from shared persisted menu order
- ✅ Floating mascot `ถามน้องซี` stays above the menu/backdrop layer across student pages

### UX Details
- Menu closes automatically on route change and when tapping nav destinations
- Reordering is cancel-safe: closing the sheet without `เสร็จสิ้น` discards draft changes
- Menu items are grouped into `หอพัก`, `บัญชี`, and `การตั้งค่า`
- Bottom sheet sits above the nav bar (`bottom-20`) to avoid covering the nav shadow
- Mascot z-index raised so it remains visually prominent above modal layering

### Files Changed
- `src/components/layout/bottom-nav.tsx` — replaced dorm-card nav entry with menu trigger and active-state behavior
- `src/components/layout/menu-modal.tsx` — new animated bottom sheet with drag-close and drag-and-drop arrangement mode
- `src/components/layout/student-shell.tsx` — mounted menu modal and auto-close-on-navigation behavior
- `src/components/student/chat-fab.tsx` — raised layering and persistent `ถามน้องซี` label treatment
- `src/components/student/dashboard/dashboard-quick-menu.tsx` — switched to store-backed menu order
- `src/stores/menu-store.ts` — new persisted student menu state and canonical menu item list
- `src/messages/th.json`, `src/messages/en.json` — added menu/i18n labels for nav and sheet

### Verification
- TypeScript check passed: `npx tsc --noEmit`
- Production deploy succeeded on Vercel and was aliased to `https://c-madong-product.vercel.app`
- Local `npm run build` hit a sandbox-only Google Fonts fetch issue for `Geist` / `Geist Mono`, not an app code error

### Commit
- `76b6f3b` — `feat(student): adjust menu nav and bottom sheet arrangement`

---

## Quick Menu Navigation + Information Pages (DEPLOYED — 2026-04-20)

### Features
- ✅ All 12 dashboard quick menu buttons wired to real pages
- ✅ Building Information page (`/information`)
  - Sticky building tabs (5 buildings) with backdrop blur
  - Hero image with hover scale effect
  - Building logo card with gradient background
  - 4 quick action buttons (roster, repair, LINE openchat, calendar)
  - Address card with copy-to-clipboard functionality
  - 4 info chips (hours, workdays, location, phone) with individual hover shadows
  - Documents bullet list with smooth transitions
  - Fixed floating contact bar above bottom nav with staff photo + 2 action buttons
- ✅ Documents page (`/documents`)
  - 3 category tabs (rules, forms, guides)
  - Document list with icons + descriptions
  - 6 mock documents across categories
  - Empty state handling
- ✅ i18n support: 25 new keys (information.* + documents.* namespaces)

### UX Enhancements
- Cursor pointer on all interactive elements
- Smooth 200ms transitions throughout
- Hover scale transforms (105% on cards, 95% on active buttons)
- Group hover effects for nested icon/text combinations
- Gradient backgrounds with colored shadows (shadow-primary/30)
- Touch targets minimum 44px for accessibility
- Backdrop blur on sticky elements (tabs + contact bar)
- Icon color transitions (primary/70 → primary on hover)
- Ring borders with subtle opacity
- Shadow elevation system (sm → md → lg → xl)

### Quick Menu Routing
| Button | Route | Status |
|--------|-------|--------|
| ค่าหอพัก | `/billing` | Working |
| แจ้งซ่อม | `/maintenance` | Working |
| พัสดุ | `/parcels` | Working |
| ข่าวสาร | `/announcements` | Working |
| ฉุกเฉิน | `/emergency` | Working |
| ปฏิทิน | `/events` | Working |
| ข้อมูล | `/information` | **NEW** |
| แบบประเมิน | `/events` | Working |
| คะแนน | `/score` | Working |
| ติดต่อ | `/emergency` | Working |
| เอกสาร | `/documents` | **NEW** |
| ช่วยเหลือ | `/guide/getting-started` | Working |

### Files Changed
- Modified: `dashboard-quick-menu.tsx`, `th.json`, `en.json`
- Created: 4 files (2 pages + 2 components)
- Commit: `5892ce3`

---
