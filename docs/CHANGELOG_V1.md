# C-Madong Product — V1 Changelog

> **Version 1.0.0** Release Date: 2026-04-10
> First production release with complete core features

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
