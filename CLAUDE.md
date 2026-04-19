# Project Context

## About the User
- **Name**: Khaoklong
- **Role**: UX/UI and Product Designer
- **Goal**: Building a digital product

## Recent Changes (2026-04-19)

### Chatbot Quick Reply UX — DEPLOYED

**Problem**: Quick replies after chatbot responses inconsistent with context. After repair flow → showed "คะแนนหอ" + "กิจกรรม" (unrelated). ALL postback responses (button taps in Flex) had ZERO quick replies → dead-end UX.

**Solution**: Context-aware quick reply menus per intent + per postback action. Every response ends with relevant navigation options + "เมนูหลัก" escape hatch.

**Files Modified**:
- `src/lib/chatbot/suggestions.ts` — rewritten with 2 functions: `getQuickReplyForIntent()` (6 intent menus) + `getQuickReplyForPostback()` (11 postback menus)
- `src/lib/chatbot/handlers/postback.ts` — 10 handlers updated (repair_confirm, repair_cancel, repair_book, repair_track, repair_cancel_ticket, repair_history, confirm_parcel_received, confirm_payment, remind_bill, event_register). All now use `replyMessage()` with quickReply
- `src/lib/chatbot/webhook-handler.ts` — changed import `getSuggestionsForIntent` → `getQuickReplyForIntent`, auto-append "เมนูหลัก" to handler-provided quick replies

**Quick Reply Menus**:
- **repair**: 📸 ส่งรูปเลย | 📋 ดูประวัติ | 🏠 เมนูหลัก
- **score**: 🎉 กิจกรรมที่ได้คะแนน | 📋 กฎหอพัก | 🏠 เมนูหลัก
- **events**: 📊 เช็คคะแนนหอ | 📦 เช็คพัสดุ | 🏠 เมนูหลัก
- **parcel**: 🔧 แจ้งซ่อม | 📊 คะแนนหอ | 🏠 เมนูหลัก
- **repair_confirm** (after ticket created): 🔍 ติดตามสถานะ | 📋 ดูประวัติ | 🏠 เมนูหลัก
- **repair_track** (after viewing status): 📋 ดูประวัติ | 🔧 แจ้งซ่อมใหม่ | 🏠 เมนูหลัก
- (+9 more postback menus)

**Pattern**: Every chatbot response (text/Flex) now has contextual quick reply → no dead ends.

**Deploy**: Vercel prod, 2m build, HTTP 200

---

### Home v2 Dashboard — DEPLOYED

Complete dashboard redesign from Figma (nodes 1361:12010, 1397:18551).

**What Changed**:
- Replaced old dashboard (header + action cards + status card + announcements) with new layered design
- Hero background: dorm photo (dormitory-hero-1440x900.jpg) with opacity-50 + pink gradient
- Layered info card: pink gradient card (180px) overlapped by cream card at top-[69px]
- Info card shows: avatar, greeting, building/room (resolved via useBuildings/useRooms/useBeds), adaptive UX with pending insights
- Quick menu: 4×2 carousel in bordered container, snap scroll, pagination dots
- Calendar section: mini calendar grid + upcoming 3 events sidebar
- Announcements carousel: horizontal snap scroll with cover images
- Events list: today badge + compact rows
- Nav bar redesign: full-width pink `rounded-t-[26px]`, 5 items (หน้าหลัก, บัตรหอพัก, ปฏิทิน, แจ้งเตือน, บัญชีของฉัน)
- Bell in nav opens notification modal (not page route)
- Chat FAB: 56px white circle, position adapts (`bottom-[104px]` when nav visible)

**Components Created**:
- `dashboard-hero.tsx` — background only, no content overlay
- `dashboard-info-card.tsx` — layered card with absolute positioning
- `dashboard-quick-menu.tsx` — carousel with scroll detection
- `dashboard-calendar.tsx` — mini grid + upcoming sidebar
- `dashboard-announcements-carousel.tsx` — horizontal scroll
- `dashboard-events-list.tsx` — today badge + rows
- `chat-fab.tsx` — floating mascot button

**Components Modified**:
- `bottom-nav.tsx` — rewritten for 5-item layout, bell button
- `student-shell.tsx` — conditional nav visibility, dynamic padding
- `dashboard/content.tsx` — new layout structure

**Bug Fixes**:
- Building/room showing UUIDs → added FK resolution via hooks
- LINE avatar not showing → changed next/image to plain img
- Type errors → used direct field access (`event.event_date` not `as`)
- Field name fix → `cover_image` not `cover_url`

**Commits**: 3b889b2 (initial implementation), 62566b8 (Figma fixes)

---

## Changes (2026-04-17)

### Chatbot Smart Fallback Enhancement — IMPLEMENTED

**Problem**: Repetitive "ไม่เจอ" message when RAG returns 0 results → poor UX, no helpful next steps

**Solution**: Smart fallback system with 3 components:
1. **Message Rotation** — 5 personality tones × 4 topics = 20 variants, prevents repetition
2. **Topic Detection** — Keyword matching (<1ms) classifies query into: rules, billing, facilities, repair, unknown
3. **Smart Suggestions** — Context-aware quick replies based on user activity (unpaid bills, pending repairs, etc.)
4. **Graceful Escalation** — After 7 consecutive failures, suggests live chat

**Implementation**:
- 3 new files: `fallback/messages.ts` (rotation logic), `fallback/topic-detector.ts` (keyword matching), `fallback/smart-suggestions.ts` (context fetcher + priority matrix)
- Modified 5 files: `answer-generator.ts` (returns `{ text, quickReply }`), `knowledge.ts` (passes lineUid), `webhook-handler.ts` (passes lineUid), `session-manager.ts` (getSession/updateSession helpers), `api/chat/route.ts` (passes identifier)
- Feature flag: `ENABLE_SMART_FALLBACK=true` + `SMART_FALLBACK_ROLLOUT_PERCENTAGE=10` (canary → 50 → 100)
- Context fetch: 500ms timeout, parallel queries (bills, repairs, parcels, events), graceful degradation to static suggestions
- Session state: `fallback_count`, `last_fallback_index`, `last_fallback_topic` in `chatbot_sessions.state_data`

**Rollout Plan**:
- Week 1: 10% canary → monitor errors, latency, collect 100+ interactions
- Week 2: 50% expansion → A/B test re-query rate, escalation rate
- Week 3: 100% rollout → track KPIs for 2 weeks

**Success Metrics**:
- Re-query rate: baseline 10% → target >30% (3x improvement)
- Escalation rate: baseline 15% → target <7% (2x reduction)
- Suggestion click rate: target >40%

**Files**:
- NEW: `src/lib/chatbot/fallback/` (3 files)
- MODIFIED: `rag/answer-generator.ts`, `handlers/knowledge.ts`, `webhook-handler.ts`, `session-manager.ts`, `api/chat/route.ts`
- ENV: `.env.local.example` (+2 feature flags)

---

### Chatbot RAG Accuracy Fix — DEPLOYED

**Root Cause Analysis** — LINE chatbot couldn't answer knowledge base questions (hallucinated or said "ไม่เจอ"), while admin KB per-doc Q&A worked fine.

**3 Root Causes Found**:
1. **`match_documents` RPC missing `document_title`** — chatbot `answer-generator.ts` expected `document_title` but RPC returned only 4 columns → context showed `undefined: content` → LLM answered poorly
2. **No `status='ready'` filter** — RPC returned chunks from unprocessed/failed documents
3. **Intent misclassification** — "คาเฟ่ชื่ออะไร" sometimes classified as `chitchat` instead of `knowledge` → routed to chitchat handler → LLM hallucinated fake names ("The Coffee House", "Chula Cafe")

**Fixes Applied**:
- Migration `20260417_fix_match_documents_rpc.sql`: Added `document_title` to return type + `AND d.status = 'ready'` filter + new `match_document_sections` RPC for per-doc search
- `vector-search.ts`: Threshold `0.3→0.2`, match count `5→8`, embedding format `as any→JSON.stringify()`
- `system-prompts.ts`: Intent prompt expanded with ร้านอาหาร/คาเฟ่/สถานที่ keywords + "ข้อเท็จจริง = knowledge เสมอ" rule
- `system-prompts.ts`: Hallucination guard on both chitchat + dynamic prompts — "ห้ามแต่งชื่อร้าน/สถานที่"
- `admin/knowledge/query/route.ts`: Uses `match_document_sections` RPC for per-doc search (threshold 0.15, count 8)

**Debug Process** (for future RAG issues):
1. Check `document_sections` have embeddings: `SELECT COUNT(*) FROM document_sections`
2. Test RPC: `supabase.rpc("match_documents", {query_embedding, match_count: 8, match_threshold: 0.2})`
3. Verify intent: Test `classifyIntent()` with actual user messages
4. Check context assembly: Print what `answer-generator.ts` sends to LLM

**Commit**: `6fdaded` — fix: improve chatbot RAG accuracy and prevent hallucination

---

## Changes (2026-04-15)

### Announcements Organize Feature — DEPLOYED

**Full backend wiring** of the `/admin/announcements/organize` mockup page (was 100% UI with mock data).

**Database** (Migration: `20260415_announcement_folders_tags.sql`):
- 3 new tables: `announcement_folders` (hierarchical), `announcement_tags` (UNIQUE name), `announcement_tag_assignments` (junction)
- Altered `announcements`: added `folder_id` (FK) + `archived_at` (soft delete)
- Storage bucket: `announcement-covers` with admin-only RLS
- Seed: 6 folders (Lucide icons) + 5 tags (color-coded)

**Files Created**:
- `src/hooks/use-announcement-organize.ts` — 14 hooks (folders, tags, bulk ops, organized query)
- `src/app/api/admin/announcements/` — 7 API routes (main, folders CRUD, tags CRUD, bulk, upload-cover)
- `src/components/ui/dynamic-lucide-icon.tsx` — renders Lucide icon by name string
- `src/components/ui/lucide-icon-picker.tsx` — searchable grid of 50 curated icons
- `src/components/admin/announcements/upload-area.tsx` — drag-and-drop cover image upload

**Files Modified** (9 organize components wired to real backend):
- `announcement-organizer.tsx` — replaced mock data with hooks, loading/error states
- `folder-sidebar.tsx` — DynamicLucideIcon, real folder tree, archive section
- `announcement-table.tsx` — real data, archive badges, restore action
- `create-folder-dialog.tsx` — LucideIconPicker, useCreateFolder mutation
- `create-tag-dialog.tsx` — useCreateTag mutation, 409 duplicate handling
- `move-to-folder-dialog.tsx` — useBulkMove mutation
- `add-tag-dialog.tsx` — useBulkTag mutation
- `bulk-actions-bar.tsx` — useBulkArchive/Restore mutations
- `filter-bar.tsx` — archive status filter

**Type Regeneration** (25+ type errors fixed):
- `supabase gen types` wiped custom type aliases → re-added all 11 custom types
- `profile.role` became nullable → fixed in 10+ files with `!` / `??` / optional chaining
- `tag.color` nullable → `?? undefined` in ~12 component files
- `Record<string, unknown>` vs `Json` → `as any` casts in 4 lib files

**Commit**: `71cef99` - feat: implement announcements organize feature with folders, tags, and archive

---

## Changes (2026-04-14)

### Evaluation System (แบบประเมิน) — DEPLOYED

**3 Evaluation Form Types** tied to `dorm_events` via `event_type="evaluation"`:
1. **Shop Evaluation** — Multi-step (5 shops × 4 criteria), rating 1-5 + textarea, skip/undo per criterion
2. **Dorm Re-application** — 2-step: conditions + personal info → confirm → submit
3. **Document Upload** — File upload (JPEG/PDF, 10MB) → submit

**Database** (Migration: `20260414_evaluation_system.sql`):
- 4 tables: `evaluation_forms`, `evaluation_criteria`, `evaluation_responses`, `evaluation_submissions`
- Seed: 3 events, 5 shops, 4 criteria, storage bucket `evaluation-uploads`

**Files Created**:
- `src/hooks/use-evaluation.ts` — 6 hooks
- `src/app/[locale]/(student)/events/[id]/evaluate/page.tsx` — route
- `src/app/api/student/evaluation/[formId]/` — 3 API routes (GET/POST, submit, upload)
- `src/components/student/evaluation/` — 10 components (step-indicator, rating-scale, criterion-card, evaluation-header, sticky-bottom-bar, personal-info-card, document-upload-zone, shop-evaluation-content, dorm-reapplication-content, document-upload-content, evaluation-page-content)

**Files Modified**:
- `src/components/student/events/events-page-content.tsx` — "ทำแบบประเมิน" CTA for evaluation events
- `src/messages/th.json`, `en.json` — ~25 evaluation i18n keys

**Key Patterns**:
- `busyRef` (useRef) for multi-step submit guard — avoids React state batching leaving buttons disabled
- Direct `fetch()` instead of TanStack mutations for multi-step save+submit — avoids invalidation re-renders
- StickyBottomBar uses `bottom-[72px]` to sit above bottom nav in `(student)` route group

---

## Changes (2026-04-13)

### Context-Specific Quick Reply Menus for Onboarding Carousel — DEPLOYED

**Problem Solved**
- Bubbles 2, 3, 4 in onboarding carousel all sent generic "น้องซีมะโด่ง" → showed same main menu
- Users expected context-specific actions matching each bubble's theme

**Unique Trigger Keywords** (3 new triggers in `webhook-handler.ts`)
- Bubble 2 "ถามอะไรตอบได้!" → `"ถามคำถาม"` → ASK_QUICK_REPLY
- Bubble 3 "แจ้งซ่อมได้ ง่ายกว่าที่เคย!" → `"คู่มือแจ้งซ่อม"` → repair guide text + REPAIR_GUIDE_QUICK_REPLY
- Bubble 4 "แจ้งเตือนอัจฉริยะ" → `"แจ้งเตือนอัจฉริยะ"` → SMART_NOTIFY_QUICK_REPLY

**Quick Reply Menus** (3 new exports in `quick-reply.ts`)
- **ASK_QUICK_REPLY**: 📋 กฎหอพัก | 💰 ค่าหอ/ค่าน้ำค่าไฟ | 🏢 สิ่งอำนวยความสะดวก
- **REPAIR_GUIDE_QUICK_REPLY**: 🔧 ลองแจ้งซ่อมเลย (single button)
- **SMART_NOTIFY_QUICK_REPLY**: 📊 คะแนนหอ | 📦 พัสดุ | 💰 ค่าหอพัก

**Repair Guide Text** (bubble 3 response)
```
📱 วิธีแจ้งซ่อมง่ายๆ 3 ขั้นตอน

1️⃣ กดปุ่ม 'ลองแจ้งซ่อมเลย' ด้านล่าง
2️⃣ ถ่ายรูปส่งมาให้น้องซีมะโด่ง
3️⃣ ยืนยันรายละเอียด แล้วเสร็จ!

✨ AI จะช่วยวิเคราะห์ภาพและจัดหมวดหมู่ให้อัตโนมัติจ้า
```

**Files Modified**:
- `src/lib/chatbot/flex-builders/greeting-carousel.ts` — bubbles 2-4 action text changed
- `src/lib/chatbot/quick-reply.ts` — +3 quick reply menu exports
- `src/lib/chatbot/webhook-handler.ts` — +3 trigger handlers (before rate limit for unregistered access)

**Commit**: `1b946e2` - feat: add context-specific quick reply menus to onboarding carousel

**Gotchas & Lessons Learned**:

1. **Context Understanding — Read Full Context Before Implementing**
   - Initial plan only mentioned bubble 4, but bubbles 2 & 3 had the same issue (sending generic "น้องซีมะโด่ง")
   - Lesson: When fixing a pattern issue in carousel, **audit ALL bubbles** for duplicates, not just the one mentioned
   - Pattern recognition > literal spec — if you see a problem repeated, fix it comprehensively

2. **CTA Preservation Pattern**
   - ✅ **Never remove CTAs** — only enhance them by changing action text/type
   - ✅ Kept Flex structure intact — only modified `action.text` from generic to specific triggers
   - ✅ Maintained UX flow — users still tap bubbles, just get context-relevant responses
   - Principle: Flex carousel CTAs are core UX elements → enhance, don't delete

3. **Webhook Handler Placement — Trigger Order Matters**
   - Pre-rate-limit triggers (accessible to unregistered users):
     - GUIDE_TRIGGERS, HOWTO_TRIGGERS, CONTACT_TRIGGERS
     - ASK_TRIGGERS, REPAIR_GUIDE_TRIGGERS, SMART_NOTIFY_TRIGGERS ← NEW
   - Why: Onboarding triggers must bypass rate limit so new users can explore features
   - Placing after rate limit = bad UX (unregistered users get blocked)

4. **Quick Reply Menu Design Principles**
   - Context Relevance: Menu must match bubble theme (e.g., "แจ้งเตือนอัจฉริยะ" → notification features only)
   - Button Count: Main menu = 4 buttons (max utility), Context menu = 1-3 buttons (focused choices)
   - Text Triggers: Reuse existing intent keywords ("คะแนนหอ", "พัสดุ", "ค่าหอ") → no new handlers needed

5. **Dynamic Import Pattern for Performance**
   - Use `await import("./quick-reply")` instead of top-level imports
   - Webhook handler processes every message → must be fast
   - Load quick reply configs only when trigger matched

6. **Proactive Pattern Checking**
   - When fixing one bubble, grep for similar patterns: `grep -n '"น้องซีมะโด่ง"' greeting-carousel.ts`
   - Would have found bubbles 2, 3, 4 all using same text immediately
   - DRY principle: If fixing something once, search codebase for duplication

**Key Takeaway**: Think **holistically** when modifying carousel flows — understand full context, recognize patterns, and fix comprehensively rather than literally following spec.

---

## Changes (2026-04-11)

### How-To Carousel Set 2 + LIFF Guide Pages — DEPLOYED

**Onboarding Carousel Card 6 CTA Change**
- Card 6 "ยังมีอีกเยอะ!" CTA changed from URI `/dashboard` → message action "ดูเพิ่มเติม"
- Triggers how-to carousel set 2 (5 bubbles)

**How-To Carousel Set 2** (`buildHowToCarousel()`)
- 5 bubbles: (1) ติดต่อเจ้าหน้าที่ pink (2) วิธีการใช้งานเบื้องต้น cream (3) คีย์ลัด pink (4) เกี่ยวกับบัญชี cream (5) คำถามที่พบบ่อย pink
- Banner images: `public/line-banners/howto-{1-5}-{slug}.jpg`
- Reuses `buildOnboardingBubble()` + `buildCtaPill()` from set 1

**Webhook Triggers** (before rate limit, accessible to unregistered users)
- `HOWTO_TRIGGERS = ["ดูเพิ่มเติม"]` → replies with how-to carousel + quick reply menu
- `CONTACT_TRIGGERS = ["ติดต่อเจ้าหน้าที่"]` → replies with mock contact info text

**LIFF Guide Pages** (4 image-based pages)
- Routes: `/guide/getting-started`, `/guide/shortcuts`, `/guide/account`, `/guide/faq`
- Located at `src/app/[locale]/guide/` (NOT inside `(student)` route group — no bottom nav)
- Shared layout: mobile shows full-width image, desktop shows "กรุณาเปิดบนมือถือ" fallback
- Images: `public/guide/{getting-started,shortcuts,account,faq}.jpg`
- Components: `src/components/student/guide/` (guide-image-page, desktop-fallback, guide-layout-client)
- Middleware: `/guide` added to `PUBLIC_ROUTES` (no auth required)
- i18n: `guide.desktopOnly` + `guide.desktopOnlyDescription` in th/en

**Files**:
- Modified: `greeting-carousel.ts` (card 6 CTA + `buildHowToCarousel` + `HOWTO_BANNERS`), `webhook-handler.ts` (+2 trigger blocks), `middleware.ts` (+`/guide`), `th.json`, `en.json`
- Created: `src/app/[locale]/guide/` (layout + 4 pages), `src/components/student/guide/` (3 components), `public/guide/` (4 JPEGs), `public/line-banners/howto-*.jpg` (5 JPEGs)

---

## Changes (2026-04-10)

### Register Flow Enhancements — DEPLOYED

**Faculty Field (Registration)**
- `profiles.faculty` TEXT column (nullable for legacy users)
- Required free-text input on `/register` page (after fullNameEn, before email)
- Validated via `registerSchema` in `src/lib/validators/auth.ts`
- Stored via `POST /api/auth/register` → profile insert
- Profile page renders `profile.faculty` from DB (not mockup). Null → silent hide
- i18n: `auth.faculty` + `auth.facultyPlaceholder` in th/en

**Floors 1-17 + Room Seeding**
- Migration `20260408_register_flow_enhancements.sql`: `profiles.faculty` column + `buildings.floors=17` + `rooms.capacity` rule (ชวนชม=2, others=4)
- Migration `20260409_seed_floors_6_to_17.sql`: PL/pgSQL DO block seeding 480 rooms (floors 6-17 × 8 rooms × 5 buildings) + 160 backfilled bed D rows for non-ชวนชม floors 1-5
- Total: **680 rooms · 2,448 beds** across 5 buildings × 17 floors
- Room numbering: `{floor}{NN}` zero-padded (101-108 ... 1701-1708)

**Bed Selection — Button Group UI**
- Onboarding page: replaced `<Select>` dropdown with grid of `<button>` tiles
- Filter by `rooms.capacity`: ชวนชม → 2-col grid (A, B), others → 4-col grid (A, B, C, D)
- Selected state: `border-primary bg-cu-light-pink text-primary`
- Floor select: hardcoded 1-17 (not derived from `buildings.floors`)

**Files**:
- Migrations: `20260408_register_flow_enhancements.sql`, `20260409_seed_floors_6_to_17.sql`
- Types: `src/lib/supabase/types.ts` (+faculty on profiles Row/Insert/Update)
- Validator: `src/lib/validators/auth.ts` (+faculty required)
- Register: `src/app/[locale]/(auth)/register/page.tsx` (+faculty field + form data)
- Register API: `src/app/api/auth/register/route.ts` (+faculty in insert)
- Onboarding: `src/app/[locale]/(auth)/onboarding/page.tsx` (floor 1-17 hardcode, bed button group, capacity filter)
- Profile: `src/components/student/profile/profile-info-card.tsx` (real faculty from DB)
- i18n: `th.json`, `en.json` (+auth.faculty, +auth.facultyPlaceholder, profile.faculty→label)

---

## Changes (2026-04-08)

### Phase 7.5 — Welcome Bubble + Onboarding Carousel Redesign — DEPLOYED

**New User Onboarding Flow (from Figma)**
- **Welcome Bubble** (`buildWelcomeNewEntryFlex`) — single bubble shown on follow event for new users. Pink CU header (#DD598B) + 3 numbered steps + 2 CTAs: green "สร้างบัญชี/เข้าสู่ระบบ" (URI → /register) + white pink-border "📖 ดูคู่มือการใช้งานน้องซีมะโด่ง" (message action). Replaces old 4-bubble carousel on follow.
- **Onboarding Carousel** (`buildOnboardingCarousel`) — 6 bubbles shown when user taps "ดูคู่มือ" CTA. Replaces old `buildGreetingCarousel`. Alternating pink/cream themes, square 1:1 hero banners, dark-grey CTA pill footer.
- **6 Figma-designed bubbles**: (1) เริ่มต้นใช้งานง่ายๆ pink (2) ถามอะไรตอบได้ cream (3) แจ้งซ่อมได้ง่ายกว่าที่เคย pink (4) แจ้งเตือนอัจฉริยะ cream (5) LINE MINI APP cream (6) ยังมีอีกเยอะ pink
- **Banner assets**: 6 square JPEG banners at `public/line-banners/onboarding-{1-6}-{slug}.jpg`. Optimized from 4.6MB → 684KB total (1800×1800 → 1040×1040, JPEG q75). Served via `https://c-madong-product.vercel.app/line-banners/...`
- **Conditional hero rendering**: `buildOnboardingBubble()` helper swaps between hero-image version (when bannerUrl set) and fallback styled colored bubble (header+body+footer with theme bg)
- **GUIDE_TRIGGERS**: `["ดูคู่มือการใช้งานน้องซีมะโด่ง", "ดูคู่มือ", "คู่มือการใช้งาน"]` in `webhook-handler.ts`, placed BEFORE rate limit + registration check so unregistered users can view guide
- **CTA actions**: Bubbles 1-4 use message action sending "น้องซีมะโด่ง" (triggers menu quick reply). Bubble 5 → URI /register. Bubble 6 → URI /dashboard.
- **Welcome banner pending**: `WELCOME_BANNER_URL = null` — welcome bubble still uses text-based pink header layout
- Files: `src/lib/chatbot/flex-builders/greeting-carousel.ts` (added `buildWelcomeNewEntryFlex` + `buildOnboardingCarousel` + helpers `buildCtaPill`/`buildOnboardingBubble`, removed old `buildGreetingCarousel`), `src/lib/chatbot/webhook-handler.ts` (GUIDE_TRIGGERS + follow event update), `public/line-banners/` (6 new optimized JPEGs)

---

## Changes (2026-04-05)

### Notification Bell Removal — DEPLOYED

**UX Polish: Clean Page Headers**
- Removed notification bell from `PageHeader` component used by 14 student pages
- Bell now appears ONLY on dashboard page (via `DashboardHeader`)
- Clean header design: back button (left) + centered title + spacer (right) for visual symmetry
- Affected pages: billing, maintenance, parcels, announcements, events, score, profile, emergency
- Files: `src/components/layout/page-header.tsx` (simplified - removed 3 imports, removed bell button + state)
- Deployment: Pre-deploy validation with vercel-deploy-doctor skill, build passed, 2min deploy
- Commit: `ac853a0` - refactor: Remove notification bell from PageHeader component

---

## Changes (2026-04-02)

### Phase 7.5 — Greeting Carousel + Follow Event — DEPLOYED

- `buildGreetingCarousel(displayName)` — 4-bubble Flex carousel for new (unregistered) users: Welcome → Features → Getting Started (URI→register) → Try It (message action)
- `buildWelcomeBackFlex(displayName)` — single bubble for returning (registered) users + quick menu hints
- Follow event in `webhook-handler.ts` now differentiates new vs registered users via `checkUserRegistered()`
- Registered user → `linkRegisteredMenu()` (Menu B swap) + welcome back flex
- New user → stays on default Menu A + greeting carousel
- `getProfileByLineUid()` helper for personalized display name
- Files: NEW `src/lib/chatbot/flex-builders/greeting-carousel.ts`, MODIFIED `webhook-handler.ts`
- **Pending**: ทดสอบ greeting carousel ด้วยบัญชี LINE ที่ยังไม่ได้ลงทะเบียน
- **Bug**: Quick Reply ไม่แสดงหลัง follow event flex (welcome back / carousel) — ต้อง debug

### Emergency Contact Page — DEPLOYED

**Emergency Contact Page (`/emergency`)**
- Hero section: Concentric animated circles (CSS pulse, GPU-composited scale) + Phone icon in white circle → `tel:` main number
- Draggable bottom sheet: touch/mouse drag, collapsed 200px / expanded 60dvh, 50px snap threshold
- 5 category tabs with icons: หอพัก (Building2), โรงพยาบาล (Hospital), รปภ. (ShieldCheck), ภายในมหา'ลัย (Landmark), ภายนอก (MapPin)
- 19 hardcoded mock contacts across all categories, each with pink `tel:` call button
- Bottom nav "ฉุกเฉิน" button now links to `/emergency` (was `#`)
- Files: `src/app/[locale]/(student)/emergency/page.tsx`, `src/components/student/emergency/emergency-content.tsx`
- Modified: `bottom-nav.tsx` (href fix), `th.json` + `en.json` (+10 i18n keys each)

### Announcement Features — DEPLOYED

**Announcement Detail Page Enhancements**
- Bookmark toggle (heart icon), registration button, read tracking, document attachments
- Tables: `announcement_bookmarks`, `announcement_registrations`, `announcement_reads`, `announcement_documents`
- Migration: `20260402_announcement_features.sql`
- Hooks: `useIsBookmarked`, `useToggleBookmark`, `useMyRegistration`, `useRegisterAnnouncement`, `useUnregisterAnnouncement`, `useMarkAnnouncementRead`, `useAnnouncementDocuments`
- New student components: `src/components/student/announcements/` (announcement-content, announcement-card)

**Saved Announcements on Profile Page**
- `ProfileSavedSection` component: horizontal scroll of bookmarked announcement cards (cover image + category badge + title)
- `useMyBookmarkedAnnouncements()` hook: joins `announcement_bookmarks` → `announcements` for current user
- Empty state with Bookmark icon when no bookmarks
- Max 10 items visible, "ดูทั้งหมด" link if more
- Files: `src/components/student/profile/profile-saved-section.tsx`, `use-announcements.ts` (+1 hook), `profile-content.tsx` (wired in), 3 i18n keys

---

## Changes (2026-04-01)

### AI Settings + Live Chat Handoff — DEPLOYED

**AI Settings (admin/settings → AI tab)**
- `app_settings` DB table (key-value JSONB) with 5-min server-side cache
- Model select (gpt-4o-mini / gpt-4o), temperature slider with 3 presets (Focused/Balanced/Creative)
- Response length (brief/standard/detailed), vision AI toggle + confidence slider
- 3 tone presets (Professional/Friendly/Casual) + custom instructions textarea + live preview mini-chat
- Intent threshold + auto-escalate toggle + escalation threshold
- Mock AI cost dashboard (฿245.50/mo, breakdown by model, sparkline)
- Dynamic system prompt: `buildDynamicSystemPrompt(settings, profileContext)` wired into chatbot
- Files: `src/lib/ai/settings.ts`, `src/components/admin/settings/ai-settings-section.tsx`, `tone-settings-section.tsx`, `ai-cost-section.tsx`, `api/admin/settings/`, `api/admin/settings/preview/`, `use-ai-settings.ts`

**Live Chat Handoff (admin/live-chat)**
- Student taps "คุยกับทีมงาน" in chat modal → waiting screen (no input, cancel button)
- Admin sees queue at `/admin/live-chat` → claims → replies → closes → AI resumes
- `chat_escalations` table: waiting → active → closed lifecycle with `closed_summary` JSONB
- `ai_chat_messages` extended with `sender_type` (ai/user/admin/system) + `sender_id`
- Polling-based real-time (3s TanStack Query refetchInterval)
- 2-panel admin UI: queue (Active/History tabs) + conversation view + AI context card
- Notifications: in-app + LINE push + Flex message with LIFF CTA to all admins
- LINE webhook: escalation keywords ("ขอคุยกับคน", "ช่วยเหลือ") → redirect to web app
- End conversation from both sides (admin "Close & Return to AI" / student "จบการสนทนา")
- Chat history archive: closed conversations viewable in History tab
- Files: 5 live-chat components, `use-escalations.ts`, `api/chat/escalate/`, `api/chat/messages/`, `api/admin/live-chat/`, `api/admin/live-chat/[id]/`, `escalation-flex-builder.ts`
- Migration: `20260331_admin_features.sql` (app_settings + chat_escalations + alter ai_chat_messages)

**Layout & Dev Login**
- Root layout now has `<html>` + `<body>` (Next.js 16 requirement), locale layout has providers only
- Dev login: `student@c-madong.app` / `devstudent123` + quick-switch buttons (Admin/Student) on localhost

---

## Changes (2026-03-28)

### Phase 4.5 Vision AI — DEPLOYED

- **Seed script fixed**: Removed `@ts-nocheck`, fixed `"=" * 50` → `"=".repeat(50)`, typed `any` → proper types
- **20 repair templates seeded**: 6 plumbing, 5 electrical, 4 aircon, 3 furniture, 2 pest — with text-embedding-3-small vectors
- **Provider order swapped**: OpenAI GPT-4o primary, Gemini 2.0 Flash fallback (Gemini quota exhausted)
- **Build fix**: Added missing return path in `VisionAgent.analyze()` for edge case (no provider + no primaryResult → keyword fallback)
- **Feature flag enabled**: `ENABLE_VISION_ANALYSIS=true` on Vercel production
- **LINE tested**: Image → text description → Vision AI categorizes → Flex confirm card. Working end-to-end
- **Fallback chain**: Template matching (0.85+ sim) → OpenAI GPT-4o (primary) → Gemini Flash (fallback) → Keywords
- **Files modified**: `scripts/seed-repair-templates.ts`, `src/lib/ai/orchestrator.ts`, `src/lib/ai/agents/vision-agent.ts`
- **Test script**: `scripts/test-vision-ai.ts` — 5 tests (template search, VisionAgent+image, keyword fallback, DB count)

---

## Changes (2026-03-24)

### Student Profile Page — 3 Figma Designs

- **Profile Main** (`/profile`): Avatar + name + room/building + faculty badge + stats (days in dorm, events attended) + score summary (stacked bar) + settings link
- **Settings** (`/profile/settings`): 3 grouped sections (General, Support, Permissions) + 3 toggle switches (local state) + logout
- **Digital ID Card** (`/profile/dorm-card`): Per-user card PNG (พิชญา พูลเพียร = `id-card-pitchaya.png`, others = `id-card-example.png`) + -6deg rotation + pink blur shadow + fullscreen lightbox (90deg landscape, `w-[90vh]`) + report lost/history menus
- **Code-rendered card branch**: `feat/digital-dorm-card` has `DormIdCard` React component (CU emblem SVG, Thai Buddhist dates, CSS barcode, signature, dual scale modes)
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

---

### RAG / Knowledge Base
- **`match_documents` RPC must return `document_title`** — chatbot `answer-generator.ts` builds context as `[1] title: content`. Without title → `undefined` in context → LLM answers poorly
- **`status='ready'` filter required** — without it, RPC returns chunks from processing/failed documents
- **Thai text needs low similarity threshold** — 0.3 misses many relevant chunks. Use 0.2 for global search, 0.15 for per-document search
- **Intent misclassification → hallucination** — if factual question ("คาเฟ่ชื่ออะไร") routes to chitchat instead of knowledge, LLM fabricates answers. Intent prompt must explicitly list factual categories (ร้านอาหาร, เวลาเปิดปิด, etc.) as knowledge
- **Chitchat prompt needs hallucination guard** — without "ห้ามแต่งชื่อร้าน/สถานที่", LLM invents plausible-sounding names ("The Coffee House", "Chula Cafe")
- **Document chunking affects retrieval** — if relevant info (e.g. "X-Cafe") is buried mid-chunk with unrelated content, similarity score drops. Consider re-chunking documents with better boundaries
- **Two RPC functions**: `match_documents` (global, 8 results, threshold 0.2) vs `match_document_sections` (per-doc, 8 results, threshold 0.15). Admin per-doc Q&A uses the latter
- **Debug RAG issues locally**: Use `scripts/` test scripts with `createClient(url, serviceRoleKey)` to query `document_sections` and test RPC directly

## Token Optimization & Anti-Over-Engineering Guidelines

### Session Efficiency Rules
1. **`supabase gen types` always causes cascading type errors** — budget for this. After regeneration: (a) re-add custom type aliases, (b) batch-fix nullable fields with sed/grep, (c) fix `Json` vs `Record<string, unknown>` with `as any`. Don't fix one file at a time — use pattern-based bulk fixes
2. **When wiring mockup components to backend**: Don't rewrite components — just replace mock data arrays with hook calls and replace `alert()` with mutations. Keep existing UI structure intact
3. **Avoid over-planning**: If mockup UI already exists and the pattern is proven (e.g. Knowledge Base v3), skip exhaustive planning and go straight to implementation. The plan should be a checklist, not a specification document
4. **Parallel file reads**: Read multiple files in one turn instead of sequentially. Group independent tool calls
5. **Prefer `Edit` over `Write`**: For existing files, use targeted edits instead of rewriting entire files. Reduces tokens spent on unchanged content
6. **Don't duplicate context**: If CLAUDE.md already documents a pattern, don't re-explain it in code comments or plan documents
7. **Build early, fix incrementally**: Run `next build` after major changes to catch errors early. Don't wait until everything is done — cascading errors are cheaper to fix in small batches
8. **Minimize re-reads**: Read a file once, make all edits, move on. Don't re-read the same file multiple times across turns
