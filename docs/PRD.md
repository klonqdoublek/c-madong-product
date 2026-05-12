# C-Madong Product Requirements Document (PRD)

> **Version**: 3.5
> **Last Updated**: 2026-05-11
> **Author**: Khaoklong (Product Designer)
> **Status**: In Development

---

## 1. Product Overview

### 1.1 Product Name
**C-Madong** (ซี-มะโด่ง) — ระบบบริหารจัดการหอพักจุฬาลงกรณ์มหาวิทยาลัย

### 1.2 Vision
A unified digital platform for Chulalongkorn University dormitory management — connecting students and staff through LINE integration, real-time notifications, and streamlined workflows.

แพลตฟอร์มดิจิทัลแบบครบวงจรสำหรับจัดการหอพักจุฬาฯ เชื่อมต่อนิสิตกับเจ้าหน้าที่ผ่าน LINE พร้อมการแจ้งเตือนแบบเรียลไทม์

### 1.3 Problem Statement

| Problem | Current State |
|---------|--------------|
| การแจ้งซ่อม | ใช้กระดาษ/โทรศัพท์ ไม่มีการติดตามสถานะ |
| การสื่อสาร | ประกาศติดบอร์ด, LINE กลุ่มที่วุ่นวาย |
| การจัดการข้อมูลนิสิต | Excel/กระดาษ, ข้อมูลกระจัดกระจาย |
| บัตรหอพัก | บัตรกระดาษ สูญหายง่าย |
| การจ่ายค่าน้ำค่าไฟ | ตรวจสอบยอดลำบาก |

### 1.4 Target Users

| User Type | Description | Access |
|-----------|-------------|--------|
| **Student (นิสิต)** | ผู้พักอาศัยในหอพัก | Mobile-first web app via LINE |
| **Staff (เจ้าหน้าที่)** | เจ้าหน้าที่หอพัก, ช่างซ่อม | Admin portal (desktop & mobile) |
| **Admin (ผู้ดูแล)** | หัวหน้าหอพัก, ผู้จัดการ | Full admin access |
| **Committee (กรรมการ)** | กรรมการหอพัก (นิสิต) | Limited admin access |

### 1.5 Product Components

```
C-Madong Platform
├── Student App (c-madong-product)       — Next.js 16, mobile-first
│   ├── LINE Login & Onboarding
│   ├── Digital Dorm Card
│   ├── Maintenance Requests
│   ├── Announcements
│   ├── Notifications
│   ├── Profile Management
│   ├── Emergency Contact (draggable bottom sheet, 5 category tabs) ✅
│   ├── In-App Chat (น้องซีมะโด่ง modal) ✅
│   ├── Live Chat Escalation (talk to human, waiting screen) ✅
│   └── Design System Token Layer (semantic tokens, WCAG motion guard) ✅ v2.9.0
│
├── Admin Portal (ported into c-madong-product) ✅
│   ├── Dashboard (KPI cards, recent tickets, quick actions)
│   ├── Student Management (directory, tags, edit)
│   ├── Maintenance Service Desk (Kanban, list, detail modal)
│   ├── Technician CRUD
│   ├── Announcement Management + LINE Flex Editor
│   ├── Message Template Library
│   ├── LINE Broadcast
│   ├── Knowledge Base (RAG: document upload, AI Q&A)
│   ├── Booking (public appointment page)
│   ├── Live Chat Handoff (escalation queue, claim, reply, close) ✅
│   └── Settings & Configuration (AI settings, tone, thresholds) ✅
│
├── LINE Integration
│   ├── LIFF Mini App
│   ├── LINE Login (OAuth) ✅
│   ├── Flex Message Broadcasting ✅
│   ├── Webhook (events & messaging) ✅
│   └── Chatbot น้องซีมะโด่ง (intent router, RAG, vision AI, chitchat) ✅
│
├── AI Layer ✅
│   ├── RepairOrchestrator (multi-agent coordination)
│   ├── VisionAgent (template matching → Gemini → GPT-4o fallback)
│   ├── Gemini 2.0 Flash (image analysis, free tier 1500 req/day)
│   ├── OpenAI GPT-4o (fallback, gpt-4o-mini for text)
│   └── pgvector Template Library (repair image embeddings)
│
└── Backend (Supabase)
    ├── PostgreSQL Database + pgvector (RAG embeddings + repair templates)
    ├── Authentication (LINE OAuth + synthetic email)
    ├── Real-time Subscriptions ✅
    ├── Edge Functions
    └── Storage (maintenance-photos, dorm-knowledge)
```

---

## 2. User Stories & Requirements

### 2.1 Authentication & Onboarding

#### US-1.1: LINE Login (Student)
> **As a** student, **I want to** login with my LINE account, **so that** I can access the system without creating a new account.

**Acceptance Criteria:**
- [ ] กดปุ่ม "เข้าสู่ระบบด้วย LINE" แล้ว redirect ไป LINE OAuth
- [ ] หลัง login สำเร็จ ระบบตรวจสอบว่ามี profile หรือยัง
- [ ] ถ้ายังไม่มี → redirect ไป registration
- [ ] ถ้ามีแล้ว → redirect ไป dashboard

#### US-1.2: Registration (Student)
> **As a** new student, **I want to** register with my CUNET email, **so that** my identity is verified.

**Acceptance Criteria:**
- [x] กรอก student ID (10 หลัก), ชื่อ-นามสกุล (ไทย/อังกฤษ), อีเมล CUNET
- [x] กรอกคณะ (faculty) — required, free-text input (เช่น "คณะวิศวกรรมศาสตร์")
- [ ] ระบบส่ง verification email ไปที่ @student.chula.ac.th
- [ ] ยืนยันอีเมลแล้วจึงดำเนินการต่อ

#### US-1.3: Onboarding (Student)
> **As a** registered student, **I want to** set up my room information, **so that** the system knows where I stay.

**Acceptance Criteria:**
- [x] เลือกตึก → ชั้น (1-17) → ห้อง → เตียง (multi-step form)
- [x] เตียงแสดงเป็น button group (ไม่ใช่ dropdown) — ชวนชม A-B (2 col), ตึกอื่น A-D (4 col)
- [x] เลือกภาษาที่ต้องการใช้ (ไทย/อังกฤษ)
- [ ] ตั้งค่า preferences สำหรับการแจ้งเตือน
- [x] หลังเสร็จ → redirect ไป dashboard

#### US-1.4: Staff Login (Admin)
> **As a** staff member, **I want to** login with email/password, **so that** I can manage the dormitory.

**Acceptance Criteria:**
- [ ] Login ด้วย email + password
- [ ] Role-based access (admin, head, committee)
- [ ] Redirect ไป admin dashboard

---

### 2.2 Student Dashboard

#### US-2.1: Home Dashboard
> **As a** student, **I want to** see an overview of my dorm life, **so that** I can quickly access important features.

**Features:**
- [ ] Greeting with student name (สวัสดี, [ชื่อ])
- [ ] Residence day counter (อยู่มาแล้ว X วัน)
- [ ] Quick action buttons: แจ้งซ่อม, ประกาศ, ค่าน้ำค่าไฟ, พัสดุ
- [ ] Recent activity feed
- [ ] Pinned announcements

#### US-2.6: Design System Token Compliance ✅ DEPLOYED (2026-05-06)
> **As a** product designer, **I want** all student UI components to use semantic design tokens, **so that** the brand is consistent and maintainable.

**Acceptance Criteria:**
- [x] 5 missing tokens added to `globals.css`: `cu-warm-cream`, `cu-task-green`, `cu-task-green-dark`, `cu-neutral-warm`, `cu-neutral-warm-dark`
- [x] `cu-score-green: #4A7060` token added to `globals.css` for score page hero card (v3.3.0)
- [x] `prefers-reduced-motion` guard added to all CSS animations (WCAG 2.1 AA)
- [x] 277 raw hex values migrated to semantic tokens across 43 student components
- [x] `page-header.tsx` `<h1>` font corrected from `font-sans` to `font-heading` (Chulalongkorn) — affects all 14 student pages
- [x] All headings use `font-heading font-bold` (Chulalongkorn has no semibold weight)
- [x] Dashboard info card layout overflow, background visibility, and Thai font clipping bugs fixed
- [ ] Audit `src/app/[locale]/` page files for remaining raw hex values (session deferred)

#### US-2.2: Digital Dorm Card ✅ DEPLOYED (2026-03-24)
> **As a** student, **I want to** have a digital dorm card, **so that** I don't need to carry a physical card.

**Features:**
- [x] แสดงข้อมูลนิสิต: ชื่อ, รหัสนิสิต, รูป
- [x] ข้อมูลห้อง: ตึก, ชั้น, ห้อง, เตียง
- [ ] QR Code สำหรับ check-in/check-out
- [x] สามารถแคปหน้าจอได้ง่าย
- [x] Fullscreen lightbox modal for card view
- [x] Report lost/damaged card menu (placeholder)
- [x] Card issuance history menu (placeholder)

---

### 2.3 Maintenance Requests (แจ้งซ่อม)

#### US-3.1: Submit Request (Student)
> **As a** student, **I want to** report maintenance issues, **so that** they get fixed.

**Features:**
- [x] เลือกประเภท: ไฟฟ้า, ประปา, เฟอร์นิเจอร์, แอร์, อินเทอร์เน็ต, กุญแจ, แมลง, ทำความสะอาด, อื่นๆ
- [x] กรอกรายละเอียดปัญหา (10-2000 ตัวอักษร)
- [x] แนบรูปภาพ (สูงสุด 5 รูป)
- [x] เลือกวัน-เวลานัดหมายช่าง (08:00-17:00, ทุก 30 นาที) — toggle "ต้องการนัดวันซ่อม?" + Calendar date picker + time select dropdown ✅ (2026-03-19)
- [ ] AI auto-categorize & priority (optional)

#### US-3.2: Track Request (Student)
> **As a** student, **I want to** track my maintenance requests, **so that** I know when they'll be fixed.

**Features:**
- [x] ดูรายการแจ้งซ่อมทั้งหมดของตัวเอง
- [x] สถานะ: รอดำเนินการ → รับเรื่องแล้ว → กำลังดำเนินการ → เสร็จสิ้น/ยกเลิก
- [x] Real-time status updates via notification
- [x] LINE Flex timeline card (ติดตามสถานะ) — vertical timeline with steps, technician info, postback button ✅ (2026-03-19)
- [x] รายละเอียดการซ่อม, หมายเหตุจากช่าง
- [x] นิสิตสามารถยกเลิกคำขอซ่อมได้เอง (เฉพาะ pending/acknowledged) พร้อมกรอกเหตุผล ✅ (2026-03-19)

#### US-3.3: Manage Tickets (Admin)
> **As a** staff member, **I want to** manage maintenance tickets, **so that** I can track and resolve issues.

**Features:**
- [ ] Kanban board view (drag-and-drop status changes)
- [ ] Table/list view with search & filters
- [ ] Ticket detail: change status, add notes, assign technician
- [ ] Status: new → received → in_progress → completed/failed
- [ ] Failure reason (required if marking as failed)
- [x] Send LINE notification to student on status change — Auto Flex message + in-app notification on status change ✅ (2026-03-19)
- [ ] Filter by category, status, building, floor

---

### 2.4 Announcements & Broadcasting (ประกาศ)

#### US-4.1: View Announcements (Student)
> **As a** student, **I want to** read announcements, **so that** I stay informed about dorm news.

**Features:**
- [ ] รายการประกาศ (ล่าสุด → เก่าสุด)
- [ ] ประกาศปักหมุด (pinned) แสดงด้านบน
- [ ] หน้ารายละเอียดประกาศ
- [ ] Mark as read

#### US-4.2: Create & Send Announcements (Admin)
> **As a** staff member, **I want to** create and broadcast announcements, **so that** students receive important information.

**Features:**
- [ ] Rich text editor for content
- [ ] LINE Flex message visual editor with preview
- [ ] Message templates library (payment, event, emergency, maintenance)
- [ ] Target: broadcast (ทุกคน) or tag-based (เฉพาะกลุ่ม)
- [ ] Schedule for later (date/time picker)
- [ ] Recurring schedules (daily, weekly, monthly)
- [ ] Save as draft
- [ ] AI-assisted Thai copy generation
- [ ] Send via LINE Messaging API

#### US-4.3: Announcement Organization (Admin) ✅ DEPLOYED (2026-04-15)
> **As an** admin, **I want to** organize announcements into folders and tags, **so that** I can manage large volumes of announcements efficiently.

**Features:**
- [x] Hierarchical folder management (parent-child nesting) with Lucide icons
- [x] Color-coded tag system with UNIQUE constraint
- [x] Bulk operations: move to folder, add tags, archive, restore
- [x] Soft-delete archive system (archived_at timestamp with restore)
- [x] Cover image upload with drag-and-drop (Supabase Storage)
- [x] Searchable icon picker (50 curated Lucide icons)
- [x] Filter by folder, tag, status (active/archived)
- [x] Formal Thai/English i18n (~65 keys)

#### US-4.4: Template Management (Admin)
> **As a** staff member, **I want to** save message templates, **so that** I can reuse them for recurring announcements.

**Features:**
- [ ] Create/edit/delete templates
- [ ] Categories: payment reminder, event, emergency, maintenance
- [ ] Supports text and Flex message formats
- [ ] Preview before saving

---

### 2.5 Student Management (Admin)

#### US-5.1: Student Directory
> **As an** admin, **I want to** manage student information, **so that** I have an up-to-date directory.

**Features:**
- [ ] View all students with search & filter
- [ ] Student info: name, student ID, LINE UID, room location, status
- [ ] Add/edit/delete students
- [ ] Assign tags for targeted messaging
- [ ] Import/export student data
- [ ] Status management (active/inactive)
- [ ] Sync LINE followers

#### US-5.2: Tag Management
> **As an** admin, **I want to** create tags, **so that** I can target announcements to specific groups.

**Features:**
- [ ] Create tags with name, description, color (8 color options)
- [ ] Assign tags to students
- [ ] Use tags as announcement targets

---

### 2.6 Notifications (แจ้งเตือน)

#### US-6.1: Notification Center (Student)
> **As a** student, **I want to** receive notifications, **so that** I don't miss important updates.

**Features:**
- [ ] In-app notification center
- [ ] Notification types: maintenance, announcement, bill, parcel, general
- [ ] Unread count badge on header
- [ ] Mark as read
- [ ] LINE push notification for critical updates

---

### 2.7 Admin Dashboard & Analytics

#### US-7.1: Dashboard Overview
> **As an** admin, **I want to** see key metrics, **so that** I can monitor dorm operations.

**Features:**
- [ ] Total students count
- [ ] Open maintenance tickets
- [ ] Pending bills
- [ ] Parcel count
- [ ] Recent announcements feed
- [ ] Recent maintenance tickets
- [ ] Real-time updates via Supabase subscriptions
- [ ] Charts & analytics (Phase 5+)

**AI Feedback Analytics Card ✅ DEPLOYED (2026-04-24):**
แสดงบน admin dashboard — สรุปความพอใจของ admin ต่อคำแนะนำจาก AI upload ช่วง 30 วันย้อนหลัง

- **Rolling Window**: 30 วันย้อนหลังจากวันปัจจุบัน
- **Metrics**:
  - Total count (จำนวนครั้งที่ admin ให้ feedback)
  - Satisfaction % (thumbs up / total)
  - Satisfaction bar (visual bar สี CU Pink)
  - Thumbs-down count (เด่นไว้เพื่อเห็นปัญหา)
- **Top Accepted Fields Histogram**: แสดงว่า field ไหนที่ admin "เก็บตามที่ AI แนะนำ" (vs แก้เอง) มากที่สุด — ช่วยประเมินคุณภาพแต่ละ suggestion type
- **Recent 5 Comments**: comment ล่าสุดพร้อม doc title + date + rating icon (thumbs up/down)

---

### 2.8 LINE Integration

#### US-8.1: LIFF Mini App
> **As a** student, **I want to** access C-Madong from within LINE, **so that** I don't need to switch apps.

**Features:**
- [ ] LINE LIFF (LINE Front-end Framework) mini app
- [ ] Auto-login with LINE credentials
- [ ] Quick access to key features
- [ ] Deep linking from LINE messages

#### US-8.2: LINE Messaging
> **As an** admin, **I want to** send messages through LINE, **so that** students receive them where they're most active.

**Features:**
- [ ] Broadcast messages (text & Flex)
- [ ] Targeted messages (by tags)
- [x] Webhook handler for incoming events (follow, unfollow, message) ✅
- [ ] Auto-sync follower list
- [ ] Flex message templates with visual builder

#### US-8.3: LINE OA Onboarding & Rich Menu
> **As a** new user adding the LINE OA, **I want to** see a welcome guide and registration CTA, **so that** I know how to get started with C-Madong.

**Acceptance Criteria:**
- [x] แอดเพื่อน LINE OA → ได้รับ greeting carousel แนะนำการใช้งาน ✅
- [x] เห็น Rich Menu A (banner ลงทะเบียน) เป็น default ✅
- [ ] กดลงทะเบียน → เปิดหน้า web registration
- [x] ลงทะเบียนสำเร็จ → Rich Menu เปลี่ยนเป็น Menu B (ปุ่มลัดฟีเจอร์) ทันที ✅
- [x] ผู้ใช้ที่ลงทะเบียนแล้วกลับมาแอดใหม่ → ได้ Menu B + welcome back message ✅

#### US-8.4: Rich Menu Feature Shortcuts
> **As a** registered student, **I want to** have quick-access buttons in LINE, **so that** I can use C-Madong features without typing.

**Features:**
- [ ] 6 ปุ่มลัด: แจ้งซ่อม, คะแนนหอ, ค่าน้ำค่าไฟ, พัสดุ, กิจกรรม, ถามน้องซี
- [ ] Persistent menu (แสดงตลอด ไม่หายเหมือน Quick Reply)
- [ ] chatBarText: "เมนู C-Madong"

---

### 2.9 Future Features (Backlog)

| Feature | Description | Priority |
|---------|-------------|----------|
| ค่าน้ำค่าไฟ (Utility Bills) | ดูยอดค่าน้ำค่าไฟ, QR payment | Medium |
| พัสดุ (Parcels) | แจ้งเตือนพัสดุ, รับพัสดุ | ✅ Done (Phase 4) |
| Check-in/Check-out | QR-based entry/exit logging | Low |
| Roommate Matching | จับคู่รูมเมท (preferences) | Low |
| Feedback & Rating | ให้คะแนนการซ่อม | Low |
| AI Image Generation | สร้างภาพสำหรับ Flex messages | Low |

---

## 3. Phased Rollout Plan

### Phase 0: Project Scaffolding ✅ COMPLETE (2026-02-14)
- Next.js 16 project setup with App Router, Turbopack
- 45 pages scaffolded
- i18n (Thai/English) with next-intl v4
- shadcn/ui component library (new-york style)
- Supabase client setup (@supabase/ssr)
- Zustand stores, TanStack Query
- Layout components (student shell, admin shell)
- Chulalongkorn University fonts (heading + body)
- CU Pink brand palette

### Phase 1: Authentication & Onboarding ✅ DEPLOYED (2026-02-23, enhanced 2026-04-10)
- Supabase project setup + environment variables
- Database migrations (profiles, buildings, rooms, beds — 5 buildings, 680 rooms, 2448 beds)
- LINE Login OAuth flow (`/api/auth/line` → `/api/auth/callback`)
- Synthetic email auth pattern (`{lineUid}@line.c-madong.app`)
- Registration form (`/api/auth/register`) — student ID, name TH/EN, **faculty** (required), email, phone
- Multi-step onboarding wizard (profile → room/bed → language)
- **Room data**: 17 floors × 8 rooms × 5 buildings. ชวนชม capacity=2 (beds A-B), others capacity=4 (beds A-D)
- **Bed selection**: Button group UI (aspect-square tiles) filtered by room capacity
- **Faculty field**: `profiles.faculty` column, displayed on student profile page
- Middleware: auth protection + i18n routing + admin role gating + onboarding redirect
- LINE Login channel (ID: 2009201565) published & verified

### Phase 2: Admin Portal + Student Maintenance ✅ DEPLOYED (2026-02-28)
**Student-facing:**
- Maintenance request form (multi-step: category → details → photos → review)
- Maintenance ticket list & detail with realtime status
- Photo upload to Supabase Storage (maintenance-photos bucket)
- Booking page (public appointment scheduling)

**Admin portal (15 pages — ported from Lovable):**
- Dashboard: 4 KPI cards, recent tickets, 6 quick-action buttons
- Service Desk: Kanban board (drag-and-drop) + list view + ticket detail modal
- Technician CRUD management
- Student directory: search, tag/building filters, edit dialog with cascading selects
- Tag management: color-coded CRUD with 8 color presets
- Announcements: list with status filter + create/edit with text/Flex tabs
- Message Templates: grid view + create with category + text/Flex support
- Flex Message Editor: JSON editor + preview + template selector
- AI Writing Assistant: Gemini-powered Thai copy generation
- LINE Broadcast: quick send with template shortcuts + tag targeting
- Knowledge Base v3 (RAG): 2-panel layout, folder/tag management, file table, document preview, per-doc Q&A ✅
- Settings: LINE OA info, AI API keys (localStorage), app info

**Maintenance Feature Completion ✅ (2026-03-19):**
- Auto LINE Flex notification on admin status change — awaits in-app + LINE Flex push, uses admin client for lookups, independent error handling
- Admin status update routes through API (`PATCH /api/admin/maintenance/[id]`) to trigger notifications
- Student cancel request: `POST /api/student/maintenance/[id]/cancel` + `useCancelTicket` hook + cancel button/dialog in ticket-detail + RLS UPDATE policy
- Appointment booking UI in new-request-form: toggle + Calendar date picker + time select (08:00-17:00), shown in review step
- Chatbot repair ticket insert: type-safe with optional vision metadata fields
- i18n strings for cancel + appointment in th.json/en.json
- Migrations: `20260322_repair_templates.sql` (pgvector + vision analysis), `20260323_student_update_policy.sql` (student UPDATE RLS)

**LINE Flex Messages — Repair Feature ✅ (2026-03-19):**
- 3 Figma designs implemented as LINE Flex JSON builders:
  1. **แจ้งซ่อมแล้ว** (Ticket Created) — `chatbot/flex-builders/repair-status.ts`: green header, pink ticket number box, detail rows, 3 postback actions (track/cancel/history)
  2. **ติดตามสถานะ** (Status Tracking) — `line/flex-builders/repair-tracking.ts`: vertical timeline with dots+lines, technician info, "วันนี้" marker, built from DB timestamps
  3. **ซ่อมสำเร็จ** (Repair Done) — `line/flex-builders/repair-notification.ts`: branches on status, completed shows green header + badge + review CTA
- New postback handlers: `repair_track` (timeline flex), `repair_cancel_ticket` (cancel via chatbot), `repair_history` (text list of 5 recent)
- `getReporterContext` exported from repair handler for reuse
- Exports added to `src/lib/line/index.ts`

**Chatbot น้องซีมะโด่ง ✅ FULLY WORKING (2026-03-18):**
- LINE webhook handler (`/api/webhooks/line`)
- Intent router (OpenAI gpt-4o-mini classification)
- Session management + chat history
- RAG integration (pgvector embeddings → gpt-4o-mini answer) — tested end-to-end on LINE ✅
- RAG accuracy fix (2026-04-17): `match_documents` RPC returns `document_title` + filters `status='ready'`, dedicated `match_document_sections` RPC for per-doc search, threshold 0.3→0.2, match count 5→8, hallucination guard on chitchat prompts ✅
- Quick Reply menu (trigger: "น้องซีมะโด่ง", "เมนู", "help") with 4 action buttons ✅
- Image support
- All AI: OpenAI gpt-4o-mini (switched from Gemini — free tier quota exhausted)
- **Repair flow fix (2026-03-18):** Postback reads detection from session (not params), description=original message, reporter context queries tables separately, CU Pink Flex design

**Chatbot UX Improvements (2026-03-21):**
- Banner images on Flex messages: parcel notification (`Inbox.jpg`), repair confirm (`New_Request.jpg`) — hero section with 16:9 cover + absolute overlay
- Booking flow after repair confirm: `buildTicketCreatingFlex()` with green header + booking CTA → web URL (not LIFF)
- `buildRepairStatusFlex()` with optional `AppointmentInfo` section
- Short trigger phrases ("แจ้งซ่อม", "ซ่อม") → guide message instead of creating ticket
- Status check keywords ("ติดตามสถานะ", "เช็คสถานะ", "track", "status") → route to `repair_history` BEFORE session state routing
- Ticket number (`#shortId`) shown in push notification Flex

**In-App Chat Modal ✅ (2026-03-21):**
- Chat with น้องซีมะโด่ง directly from the web app (no LINE required)
- Bottom sheet modal (85vh) opens from mascot button in bottom nav
- Reuses all chatbot handlers: chitchat, knowledge, score, events, parcel
- Repair intent redirects to LINE (requires photo/postback flow)
- Drag-to-dismiss with visual handle bar + backdrop fade
- `visualViewport` tracking for mobile keyboard avoidance
- Chat history view with date grouping from DB (`GET /api/chat/history`)
- Clear session button to start fresh conversation
- Suggestion chips on empty state
- **Files**: `chat-modal.tsx`, `use-chat.ts`, `chat-store.ts`, `api/chat/route.ts`, `api/chat/history/route.ts`

**Student Page Updates (2026-03-21):**
- New `page-header.tsx` component replaces old `header.tsx` across all student pages
- `logout-button.tsx` component added
- Student pages refactored: announcements, maintenance, profile (placeholder), billing, events, parcels, score

**LINE Messaging Pipeline ✅ (2026-02-21):**
- `@line/bot-sdk` integration
- Push/broadcast/reply for text + Flex messages
- Bill reminder Flex template (tested end-to-end)

**Database tables deployed:**
- profiles, buildings, rooms, beds
- maintenance_requests, technicians
- announcements (extended: message_type, flex_json, status, target_type, scheduled_at, sent_at)
- notifications
- tags (new)
- message_templates (new)
- documents (extended: status, filename, file_path, content_type, folder_id, version, parent_document_id, is_current, version_number, ai_suggestion, ai_applied_at) + document_sections (pgvector)
- knowledge_folders, document_tags, document_tag_assignments (Knowledge Base v3)
- ai_upload_feedback (Knowledge Base AI v2.7: `id`, `document_id`, `rating` ('up'|'down'), `comment`, `suggestion_snapshot` (JSONB), `accepted_fields` (text[]), `created_by`, `created_at`)
- ai_chat_messages, chatbot_sessions
- score_categories, score_entries, dorm_events, event_attendance (Phase 5)
- bills, bill_items (new — Phase 3)
- parcels (new — Phase 4)
- user_roles, role_permissions (RBAC — cross-phase)
- repair_templates (Phase 4.5 — pgvector embeddings)
- FK fix: `maintenance_requests.requester_id` → `profiles(id)` for PostgREST joins (2026-03-18)

**RBAC System ✅ WIRED UP (2026-03-21):**
- 13 roles (super_admin, head, registrar, finance, parcel, admin_staff, service, activity, technician_head, technician, technician_it, committee, student)
- 80+ permissions, building scopes for registrars
- Role Management UI at `/admin/roles` — assign/revoke working (via `createAdminClient()`)
- Legacy role mapping: `profiles.role` ("admin"→"super_admin", "staff"→"admin_staff")
- Admin sidebar filtered by permissions per nav item/group
- Middleware allows all staff roles (not just admin/head)
- Admin API routes use `createAdminClient()` to bypass RLS
- PermissionGuard component for conditional rendering

**Knowledge Base v3 ✅ DEPLOYED (2026-03-22):**
Full rewrite from 4-tab mock to production 2-panel layout with real DB connectivity.

- **Layout**: Collapsible nested sidebar (280px ↔ 52px icon strip) + main content area. Admin sidebar auto-collapses to 60px icon strip when on knowledge page.
- **Folder Management**: Hierarchical folders (parent/child), CRUD via context menu, drag file counts, 6 seed folders (กฎหอพัก, คู่มือนิสิต, แบบฟอร์ม, ประกาศ, FAQs, อื่นๆ)
- **Document Tags**: Many-to-many via junction table, 10 color presets, tag management dialog
- **File Table**: Checkbox selection, type badges (PDF/MD/DOC/TXT), version display, status badges, sort by date/name, filter by status/tag
- **Bulk Actions**: Move to folder, delete, assign tags, reprocess embeddings
- **File Detail View**: Document preview, metadata (version, author, date), tag badges, per-document Q&A
- **Per-Document Q&A**: RAG search scoped to single document's sections
- **Database** (migration `20260324_knowledge_folders_tags.sql`):
  - `knowledge_folders` table: hierarchical with parent_id FK (CASCADE), sort_order
  - `document_tags` table: name (unique), color
  - `document_tag_assignments` junction table
  - Added `folder_id` (FK → knowledge_folders, SET NULL on delete) + `version` to `documents`
  - RLS: authenticated read, admin write via adminClient
- **API Routes** (8 routes):
  - `GET/POST /api/admin/knowledge/folders` + `PATCH/DELETE .../folders/[id]`
  - `GET/POST /api/admin/knowledge/tags` + `PATCH/DELETE .../tags/[id]`
  - `GET /api/admin/knowledge/documents` (with folder/tag/status/search filters)
  - `GET/PATCH/DELETE /api/admin/knowledge/documents/[id]`
  - `POST /api/admin/knowledge/documents/bulk` (move/delete/tag/reprocess)
  - Enhanced upload route (folder_id + tags) + query route (document_id filter)
- **State**: Zustand `knowledge-store` (view, folders, files, sidebar, search, sort, filter) + 14 TanStack Query hooks in `use-knowledge.ts`
- **Components** (14 files in `src/components/admin/knowledge/`):
  - Sidebar: knowledge-sidebar, folder-tree, file-list-sidebar
  - Main: folder-view, file-table, file-table-toolbar, file-detail-view, document-preview
  - Dialogs: create-folder, upload-document, move-documents, tag-management, delete-confirm
  - Layout shell: knowledge-page-content (rewritten)

**AI-Assisted Upload ✅ DEPLOYED (2026-04-24):**
หลังอัปโหลดเอกสาร ระบบจะเปิด popup ให้ AI วิเคราะห์เนื้อหาและเสนอ metadata อัตโนมัติ — admin ตรวจ/แก้/ปฏิเสธได้ก่อน apply

- **AI Suggestion Popup**: เรียกหลัง upload สำเร็จ → gpt-4o-mini อ่านเนื้อหาเอกสารและตอบกลับเป็น structured JSON
- **Fields ที่ AI เสนอ**:
  - `filename` — ชื่อภาษาไทยที่สะอาด ≤ 60 ตัวอักษร
  - `folder` — เลือกจากโฟลเดอร์ที่มีอยู่ หรือเสนอโฟลเดอร์ใหม่
  - `tags` — เลือกจาก tag ที่มี หรือเสนอ tag ใหม่
  - `summary` — สรุปเอกสารสั้น ๆ
  - `confidence` — คะแนนความมั่นใจของ AI (%)
- **Admin Controls**: แก้ไขทีละ field ได้ หรือกด "ไม่ใช้คำแนะนำ" เพื่อ reject ทั้งหมด
- **Feedback Capture (optional)**: ปุ่ม thumbs up/down + free-text comment → บันทึกลง `ai_upload_feedback` table เพื่อใช้ปรับปรุงโมเดล

**Version Control ✅ DEPLOYED (2026-04-24):**
ตรวจจับเอกสารเวอร์ชันเดียวกันเพื่อไม่ให้ไฟล์รกฐานข้อมูล และเก็บประวัติการอัปเดต

- **Duplicate Detection**: match ด้วย filename ตรงกัน **หรือ** content embedding similarity ≥ 0.85 (cosine, pgvector)
- **Schema Pattern**: self-FK `parent_document_id` บน `documents` + `is_current` (boolean) + `version_number` (integer)
- **Auto-Archive Flow**: เมื่อยืนยันเวอร์ชันใหม่ → เวอร์ชันเดิมถูก set `is_current=false` โดยอัตโนมัติ; root document ถูกเก็บไว้เพื่อเป็น history chain
- **UI Behavior**:
  - File detail view แสดง version timeline (v1 → v2 → v3...)
  - Document list ซ่อน superseded versions ตามค่า default (toggle แสดงได้)
- **Schema Columns เพิ่มบน `documents`**: `parent_document_id`, `is_current`, `version_number`, `ai_suggestion` (JSONB snapshot ของคำแนะนำ AI), `ai_applied_at` (timestamp ตอนที่ admin apply คำแนะนำ)

### Phase 3: Billing & Payments ✅ DEPLOYED (2026-03-09)

**Admin billing portal:**
- Create bill form with student search (API-backed, debounced, shows building/room)
- Bill list with stat cards (revenue, outstanding, overdue, paid), filters (status/month/year)
- Bill detail with status management (mark paid/overdue/cancelled), admin notes
- Checkbox selection + batch LINE Flex reminder send (up to 50 at once)
- Single bill LINE Flex reminder send
- Zod validation on all inputs

**Student billing views:**
- Billing page: current bills (pending/overdue) + payment history
- Bill detail: amount breakdown, room info, due date, status
- Dashboard bill card: shows most urgent pending/overdue bill with amount and due date

**Database (migration `20260314_phase3_billing.sql`):**
- `bills` table: student_id, building/room/bed refs, billing_month/year/round, total_amount, status (pending/paid/overdue/cancelled), due_date, timestamps
- `bill_items` table: bill_id, label, category (room/electricity/water/deposit/fine/other), amount
- RLS policies for student read access + admin full access

**API routes:**
- `GET/POST /api/admin/bills` — list (with filters) + create
- `GET/PATCH/DELETE /api/admin/bills/[id]` — detail + status update + delete
- `POST /api/admin/bills/[id]/send-reminder` — single LINE Flex send
- `POST /api/admin/bills/batch-send` — batch LINE Flex send
- `GET /api/admin/students/search?q=` — student search (admin client, bypasses RLS)
- `GET /api/student/bills` — student's own bills

**Not yet implemented:**
- QR payment integration (requires PromptPay/bank API)

### Phase 4: Parcel Management ✅ DEPLOYED (2026-03-17)

**Database (migrations `20260317_phase4_parcels.sql` + `20260320_notification_type_parcels.sql`):**
- `parcels` table: student_id, tracking_number, parcel_type (box/envelope/bag/oversized/other), status (pending/notified/picked_up/returned), pickup_location, notes, timestamps
- RLS policies for student read + admin full access
- Notification type `parcels` added to enum

**Admin pages:**
- `/admin/parcels`: Register parcels, list with filters, notify students (single + bulk LINE push)
- API routes: `GET/POST /api/admin/parcels`, `PATCH/DELETE /api/admin/parcels/[id]`, `POST /api/admin/parcels/[id]/notify`, `POST /api/admin/parcels/notify-bulk`

**Student pages:**
- `/parcels`: Pending parcels list with tracking info + pickup history
- API route: `GET /api/student/parcels`

**Chatbot Flex cards (Figma-based):**
- `buildParcelStatusFlex`: Pink header "📦 รายการพัสดุ" — single bubble for 1 parcel, carousel (swipeable) for 2+, each showing tracking/type/date + pickup location + LIFF CTA
- `buildParcelAllReceivedFlex`: Green "📦 รับพัสดุทั้งหมดแล้ว! ✅" compact card + LIFF CTA
- Handler: `src/lib/chatbot/handlers/parcel.ts` — intent `parcel` triggers Flex response

**Not yet implemented:**
- QR code for parcel pickup confirmation
- Parcel photo upload on registration
- Auto-return workflow after X days uncollected

### Phase 4.5: AI Vision Analysis for Repair Reporting ✅ DEPLOYED (2026-03-28)

> **Goal:** Enable AI-powered image analysis for maintenance requests to automatically categorize damage, assess urgency, and improve ticket quality — reducing manual categorization and speeding up technician assignment.

**Problem:**
- Existing chatbot receives photos but doesn't analyze them (images stored but not processed)
- Manual categorization prone to errors
- No automatic urgency assessment from visual damage
- Students struggle to describe technical issues accurately

**Solution:** Multi-provider AI vision analysis with cost optimization

**Architecture:**
```
LINE Webhook → RepairOrchestrator
    ↓
VisionAgent (photo analysis)
    ↓
1. Template Matching (pgvector embedding search) — 70% cases, <1s, FREE
2. GPT-4o (primary AI, since 03-28) — 25% cases, <5s, ฿0.30/ticket
3. Gemini 2.0 Flash (fallback) — 5% cases, <3s, FREE (quota limited)
4. Keyword Detection (last resort) — instant, FREE
```

**Database (migration `20260318_repair_templates.sql`):**
- `repair_templates` table: category, title, description, image_url, embedding vector(1536), usage_count, accuracy_score
- Vector similarity search function: `match_repair_templates(embedding, threshold, count)` using IVFFlat index
- Added to `maintenance_requests`: ai_confidence (0.0-1.0), ai_provider (template/gemini/openai/text-only/keyword), template_id (FK), damage_details
- RPC functions: `increase_template_usage()`, `decrease_template_accuracy()` for feedback loop

**AI Components:**

1. **Gemini Client** (`src/lib/ai/gemini.ts`):
   - Gemini 2.0 Flash integration for vision analysis (30x cheaper than GPT-4o)
   - Thai-optimized repair analysis prompt (7 categories, 4 urgency levels)
   - Multi-image support with confidence aggregation
   - JSON response parsing with validation

2. **VisionAgent** (`src/lib/ai/agents/vision-agent.ts`):
   - Multi-provider fallback chain with confidence thresholds
   - Template matching via embedding similarity (cost optimization)
   - Provider selection based on confidence scores
   - Graceful degradation to keyword detection

3. **RepairOrchestrator** (`src/lib/ai/orchestrator.ts`):
   - Coordinates vision analysis + user context lookup (parallel execution)
   - Handles both photo-based and text-only repair requests
   - Multi-image analysis support (future Phase 4.5D)

**Updated Handlers:**
- `handleRepair()`: Uses orchestrator when `ENABLE_VISION_ANALYSIS=true` and photos exist
- `createRepairTicket()`: Stores vision metadata (provider, confidence, template_id, damage_details)
- `handleRepairConfirm()`: Passes vision metadata from session to ticket creation

**Seed Data:**
- Initial 20 template images across 7 categories (plumbing: 6, electrical: 5, aircon: 4, furniture: 3, pest: 2)
- Script: `scripts/seed-repair-templates.ts` — generates embeddings and populates DB
- Usage: `bun run scripts/seed-repair-templates.ts`

**Cost Analysis (50 tickets/month):**
- Template matching: ฿0.02 (70% of requests)
- Gemini Flash: FREE or ฿0.01 if exceed tier (25% of requests)
- GPT-4o fallback: ฿0.90 (5% of requests)
- **Total: ~฿1/month** (93% cheaper than GPT-4o-only approach)

**Rollout Status (2026-03-28):**
- **Foundation**: COMPLETE — migrations, agents, orchestrator, 20 seed templates with embeddings
- **Provider**: OpenAI GPT-4o (primary), Gemini 2.0 Flash (fallback) — swapped due to Gemini quota exhaustion
- **Production**: LIVE — `ENABLE_VISION_ANALYSIS=true` on Vercel, LINE E2E tested
- **Next**: Monitor accuracy/cost, expand template library to 50+, multi-photo analysis

**Feature Flag:**
- `ENABLE_VISION_ANALYSIS=true` (enabled in production 2026-03-28)
- Set to `false` to disable vision analysis and fall back to text-only detection

**Success Metrics:**
- 85%+ categorization accuracy (admin validation)
- <3s average response time (P95)
- <฿5/month API costs for 50 tickets
- 70%+ template match rate (no API cost)

**Not yet implemented:**
- Admin re-analyze tool (re-run vision AI on existing tickets)
- Incorrect categorization feedback loop (admin flags wrong category → adds to training data)
- Photo gallery in admin ticket detail
- Multi-photo aggregation (analyze all photos, not just first)
- Content moderation (NSFW/inappropriate image filtering)

### Phase 5: Dorm Score & Activities ✅ DEPLOYED (2026-03-16)

> Reference: [`docs/dorm-score-activities.md`](dorm-score-activities.md) — Full activity impact matrix, scoring rules, and DB schema.

**Database (migration `20260315_phase5_dorm_score.sql`):**
- `score_categories` table: 4 categories (Activities 40%, Community Service 20%, Rules Compliance 25%, Meetings 15%)
- `dorm_events` table: title TH/EN, description TH/EN, location TH/EN, event_type, impact_level, mandatory flag, score/penalty points, capacity, status workflow (draft→published→ongoing→completed→cancelled)
- `score_entries` table: student scoring with source tracking (manual_admin, event_attendance, system)
- `event_attendance` table: student registration + attendance status (registered/attended/absent/excused)
- Materialized view `student_score_summary` for composite score calculation
- RPC `get_composite_score(student_uuid)` for student score retrieval
- Trigger `auto_score_from_attendance`: attendance status change → auto score_entry
- RLS policies for all tables

**Student pages (US-5.1, US-5.2):**
- Dashboard: Score card (composite score + 4 category mini bars + tier color) + Upcoming events section (3 events with mandatory badges)
- `/score` page (redesigned v3.3.0, Figma node 1380-15996): Green hero card (`cu-score-green` #4A7060) with composite score in `text-7xl`, stacked progress bar with 3-color legend, pass/fail threshold badge ("ผ่านเกณฑ์!" when score >= 60), dismissable promo banner (bell icon + mascot), horizontal-scroll category breakdown cards (3 cards with per-category icons: Sunrise/Flag/ShieldCheck), redesigned history list with green circle score badges, info button (ⓘ) in page header
- `/events` page: Tabs (upcoming/past), event type filter, register/unregister buttons, attendance status badges
- `/events/[id]` detail: Full event info, capacity progress bar, register/unregister, attendance status

**Admin pages (US-5.3, US-5.4):**
- `/admin/events`: 4 stat cards, type/status filters, events table with CRUD, create/edit form dialog (bilingual fields, scoring config, capacity, status)
- `/admin/events/[id]/attendance`: Event info header, student attendance table with status dropdowns, bulk "Mark All Attended"
- `/admin/scores`: 4 stat cards (avg score, below 60 count, top scorer, total entries), search filter, student score table with category mini bars, manual score entry dialog

**Hooks:**
- `use-score.ts`: useMyScore (RPC), useMyScoreHistory, useScoreCategories, useStudentScores, useAddScoreEntry
- `use-events.ts`: useUpcomingEvents, usePastEvents, useEventDetail, useMyAttendance, useRegisterEvent, useUnregisterEvent, useAdminEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useEventAttendees, useUpdateAttendance

**Status:** US-5.1 through US-5.4: COMPLETE (RLS fix migration 20260316 + LINE push notification on admin score entry deployed 2026-03-16). US-5.5: Deferred.

**Not yet implemented (US-5.5):**
- Obligation deadline tracking + LINE push reminders (needs LINE scheduling, separate concern)
- Bulk attendance import (CSV/QR scan)
- Export scores (CSV)

### Home v2 Dashboard ✅ DEPLOYED (2026-04-19)

Complete dashboard redesign from Figma (nodes 1361:12010, 1397:18551):

**Hero Section** (`dashboard-hero.tsx`) — Dorm photo background (dormitory-hero-1440x900.jpg) with opacity-50 + pink gradient overlay

**Layered Info Card** (`dashboard-info-card.tsx`) — Card-within-card design:
- Pink gradient card (180px, top-0): Avatar + greeting + building/room icons
- Cream card (overlaps at top-[69px]): Adaptive UX (Sparkles icon + pending insights + countdown + "ทำเลย" CTA)
- Data resolved via useBuildings/useRooms/useBeds (UUID→readable names)
- LINE avatar uses plain img (not next/image) for CDN compatibility

**Quick Menu** (`dashboard-quick-menu.tsx`) — 4×2 carousel in bordered container:
- 2 pages (8+4 items), snap scroll with pagination dots
- Items: ค่าหอพัก, แจ้งซ่อม, พัสดุ, ข่าวสาร, ฉุกเฉิน, ปฏิทิน, ข้อมูล, แบบประเมิน

**Calendar** (`dashboard-calendar.tsx`) — Mini calendar + upcoming sidebar:
- Left: Month grid with today circle + event dots
- Right: Next 3 events (date + title)

**Announcements Carousel** (`dashboard-announcements-carousel.tsx`) — Horizontal snap scroll with cover images, pinned badges

**Events List** (`dashboard-events-list.tsx`) — Today badge + compact event rows

**Nav Bar Redesign** (`bottom-nav.tsx`) — Full-width pink bar, rounded-t-[26px]:
- 5 items: หน้าหลัก, บัตรหอพัก, ปฏิทิน, แจ้งเตือน (bell with badge), บัญชีของฉัน
- Bell opens notification modal (not page route)
- Conditional visibility on 5 routes only

**Chat FAB** (`chat-fab.tsx`) — 56px white circle, mascot icon:
- Position adapts: `bottom-[104px]` when nav visible, `bottom-6` when hidden
- Replaces old center mascot button

**Layout** (`content.tsx`) — Hero → info card (-mt-[200px] overlap) → quick menu container → calendar → announcements → events → footer

**Commits**: 3b889b2 (initial), 62566b8 (Figma fixes)

### Student Profile Page ✅ DEPLOYED (2026-03-24)

3 Figma designs implemented as a complete profile experience:

**Design 1 — Profile Main (`/profile`):**
- Avatar + display name + student ID + Thai name
- Room/building/bed info + faculty (mockup)
- "นิสิตหอพักปัจจุบัน" pink badge
- Action buttons: "ดูบัตรหอพัก" (→ dorm-card) + "แก้ไขข้อมูลส่วนตัว" (placeholder)
- Re-application status card (mockup)
- Stats: Days in dorm (calculated from `move_in_date`) + Events attended (from `useMyAttendance`)
- Score summary: Composite score + stacked bar (3 category colors) + legend (→ links to `/score`)
- Settings link → `/profile/settings`

**Design 2 — Settings (`/profile/settings`):**
- 3 grouped sections: General (account, payment, security, language), Support & FAQs, Permissions
- Permission toggles: Data Access, Push Notification, Personalization Enhancement (local state only)
- Logout button + version text

**Design 3 — Digital ID Card (`/profile/dorm-card`):**
- Serial number display
- ID card PNG (per-user: real card for พิชญา พูลเพียร, placeholder for others) with -6deg rotation + pink blur shadow
- "แสดงบัตรแบบเต็ม" button → fullscreen lightbox with card rotated 90deg to landscape, scaled to `w-[90vh]` (dark backdrop, tap-to-dismiss, iOS Safari safe)
- Report lost/damaged card + card history menus (placeholders)

**Components** (7 files in `src/components/student/profile/`):
- `profile-content.tsx`, `profile-info-card.tsx`, `profile-stats-section.tsx`, `profile-score-section.tsx`
- `settings-content.tsx`, `settings-menu-item.tsx` (reusable: icon + label + chevron/toggle)
- `dorm-card-content.tsx`

**Routes**: `(student)/profile/page.tsx` (updated), `(student)/profile/settings/page.tsx` (new), `(student)/profile/dorm-card/page.tsx` (new)

**Data sources**: `useUser()`, `useBuildings()`, `useRooms()`, `useBeds()`, `useMyScore()`, `useMyAttendance()`

**Not yet implemented:**
- Profile edit form (requires API route)
- Settings persistence (toggles are local state only)
- Real faculty/department data (mockup string)
- QR Code on dorm card

### LINE Flex Messages — Dorm Score Cards (2026-03-16)

Two Flex Message builders from Figma designs (file `zepMkYbO2pzKy9lhya4sVW`):

1. **Score Summary** (`src/lib/line/flex-builders/score-summary.ts`, node 1:2606):
   - Pink (#DD598B) bubble with greeting, composite score (3xl), mascot image, "ดูรายละเอียดเพิ่มเติม" action → `/th/score`
   - Interface: `ScoreSummaryData { studentName, score, updatedAt }`

2. **Score Added** (`src/lib/line/flex-builders/score-added.ts`, node 3:2):
   - Green (#23BE47) for positive, Red (#E53E3E) for negative score changes
   - Shows activity name + "+N คะแนน!" or "-N คะแนน"
   - Interface: `ScoreAddedData { studentName, activityName, pointsChange, updatedAt }`

**Chatbot integration**: Score handler (`src/lib/chatbot/handlers/score.ts`) updated to:
- Query `profiles.line_uid` (fixed: was querying nonexistent `students` table)
- Use `get_composite_score` RPC for accurate composite score
- Return new pink Figma Flex card (replaced old purple card)
- Quick reply "📊 คะแนนหอ" and typed "คะแนนหอ" both trigger score Flex response
- Tested end-to-end on LINE (2026-03-16)

### Phase 6: AI Adaptive UX Layer ✅ DEPLOYED (2026-03-17)

**Database (migration `20260318_phase6_ai_ux.sql`):**
- Notification priority system + AI insight tables

**Notification system (`src/lib/notifications/`):**
- `create.ts`: Create notifications with type/priority
- `triggers.ts`: Auto-trigger notifications on key events
- `priority.ts`: AI-based priority scoring
- `line-push.ts`: Push critical notifications via LINE
- Student UI: `notification-item.tsx`, `notification-modal.tsx`, `notification-store.ts`

**AI Insights (`src/lib/insights/`):**
- `generate.ts`: Personalized insights via OpenAI gpt-4o-mini
- `prompts.ts`: Prompt templates for student context
- API: `GET /api/student/insights`

**Chatbot enhancements:**
- Context manager (`context-manager.ts`): Multi-turn conversation awareness
- Suggestions (`suggestions.ts`): Proactive quick reply suggestions
- Enhanced postback handler, intent router, system prompts
- Parcel intent + handler integration

**Not yet implemented:**
- Adaptive UX (usage-based interface optimization)
- Dashboard insight cards (API ready, UI pending)
- Notification preferences per student

### Phase 7: LINE LIFF Integration
- LIFF mini app setup
- Auto-login from LINE
- Deep linking from Flex messages
- Quick actions within LINE

### Phase 7.5: LINE OA Onboarding & Rich Menu — DEPLOYED ✅
Detailed plan: [`docs/phase7.5-line-onboarding.md`](phase7.5-line-onboarding.md)

> **Goal:** ให้ผู้ใช้ใหม่ที่แอด LINE OA ได้รับ onboarding experience ที่ดี และมี persistent Rich Menu สำหรับเข้าถึงฟีเจอร์หลักได้ตลอด

**Rich Menu A — ยังไม่ลงทะเบียน (Default):** ✅
- Banner เดียว full-width → กดลงทะเบียน (URI → web registration)
- ตั้งเป็น default rich menu → ผู้ใช้ใหม่ทุกคนเห็น
- chatBarText: "ลงทะเบียนใช้งาน"

**Rich Menu B — ลงทะเบียนแล้ว (Per-user):** ✅
- Grid 6 ปุ่มลัด: แจ้งซ่อม, คะแนนหอ, ค่าน้ำค่าไฟ, พัสดุ, กิจกรรม, ถามน้องซี
- Link ให้ user หลัง registration สำเร็จ → per-user menu override default
- chatBarText: "เมนู C-Madong"

**Welcome Bubble + Onboarding Carousel (Follow Event):** ✅ UPDATED 2026-04-13
- **New user (follow event)** → Single `buildWelcomeNewEntryFlex()` bubble: pink CU header + 3 numbered steps + 2 CTAs (green URI→register, white pink-border message→"ดูคู่มือ")
- **Onboarding Carousel** (`buildOnboardingCarousel`) → 6-bubble carousel triggered when user taps "📖 ดูคู่มือการใช้งานน้องซีมะโด่ง" or types "ดูคู่มือ"
  - Bubble 1 — เริ่มต้นใช้งานง่ายๆ (pink) → sends "น้องซีมะโด่ง" (main menu)
  - Bubble 2 — ถามอะไรตอบได้! (cream) → sends "ถามคำถาม" (ASK_QUICK_REPLY: กฎหอพัก, ค่าหอ, สิ่งอำนวยความสะดวก) ✅
  - Bubble 3 — แจ้งซ่อมได้ ง่ายกว่าที่เคย! (pink) → sends "คู่มือแจ้งซ่อม" (repair guide + quick reply) ✅
  - Bubble 4 — แจ้งเตือนอัจฉริยะ (cream) → sends "แจ้งเตือนอัจฉริยะ" (SMART_NOTIFY_QUICK_REPLY: คะแนนหอ, พัสดุ, ค่าหอพัก) ✅
  - Bubble 5 — LINE MINI APP (cream, URI → /register)
  - Bubble 6 — ยังมีอีกเยอะ! (pink) → sends "ดูเพิ่มเติม" (how-to carousel set 2)
- All bubbles use 1:1 square banner images (Figma-designed, served from `public/line-banners/`)
- **Context-Specific Quick Replies** (2026-04-13): Each bubble has unique trigger matching its theme → better UX than generic "น้องซีมะโด่ง"
- Returning user (มี profile แล้ว) → swap to Menu B + welcome back flex
- `GUIDE_TRIGGERS` check placed BEFORE rate limit + registration so unregistered users can view guide
- Files: `greeting-carousel.ts` (`buildWelcomeNewEntryFlex` + `buildOnboardingCarousel` + `buildWelcomeBackFlex` + helpers `buildCtaPill`/`buildOnboardingBubble`), `public/line-banners/onboarding-{1-6}-{slug}.jpg` (optimized 4.6MB → 684KB)

**Menu Swap Logic:** ✅
- Follow event: `checkUserRegistered()` → new user gets carousel, returning user gets Menu B + welcome back
- Registration callback → `linkRegisteredMenu(lineUid)` → per-user Menu B
- Per-user menu takes priority over default → เห็น Menu B ทันที
- `rich-menu.ts`: `linkRegisteredMenu()`, `unlinkUserMenu()`

**Pending / Known Issues:**
- ทดสอบ welcome bubble + onboarding carousel ด้วยบัญชี LINE ที่ยังไม่ได้ลงทะเบียน (add bot ใหม่)
- Quick Reply (แจ้งซ่อม, คะแนนหอ, กิจกรรม, ถาม) ไม่แสดงหลัง follow event flex — fix ด้วย pattern `replyMessages([flex, text+quickReply])` แล้ว รอ verify
- `WELCOME_BANNER_URL` ยังเป็น null — welcome bubble ใช้ text-based pink header layout ไปก่อน

**Not yet implemented:**
- Rich Menu tab switching (richmenuswitch action)
- Role-based menu variants (committee, technician)
- Admin Rich Menu editor UI
- Menu analytics (tap tracking)
- Setup script batch link existing users to Menu B

### Phase 7.6: PIN Security (6-digit) — PLANNED 📋

**Goal**: เพิ่มชั้นความปลอดภัยด้วย PIN 6 หลัก สำหรับ lock screen และ gate action สำคัญ (ดูบิล, บัตรหอ, เปลี่ยน settings) โดย PIN บังคับตั้งครั้งแรกตอน onboarding และ reset ได้ผ่าน LINE OAuth re-auth

**Use Cases (ตกลงแล้ว 2026-04-06)**:
- Lock screen ทุกครั้งที่เปิดแอป (หรือหลัง idle timeout)
- Gate ก่อน action สำคัญ: ดูบิล, ดูบัตรหอ (dorm-card), logout, เปลี่ยน settings
- ลืม PIN → re-auth ผ่าน LINE OAuth → ตั้ง PIN ใหม่
- ตั้ง PIN บังคับใน onboarding flow (หลัง complete profile)

**Scope Breakdown**:

**1. Database Migration** (⭐ ง่าย)
- Migration: `supabase/migrations/YYYYMMDD_pin_security.sql`
- Columns บน `profiles`:
  - `pin_hash` (text, nullable) — bcrypt hash, salt rounds = 10
  - `pin_set_at` (timestamptz) — เวลาที่ตั้ง PIN ครั้งล่าสุด
  - `pin_failed_attempts` (int, default 0) — นับ fail สำหรับ rate limit
  - `pin_locked_until` (timestamptz, nullable) — lock 5 นาทีหลัง fail 5 ครั้ง
- RLS: user อ่าน/เขียนได้เฉพาะของตัวเอง; `pin_hash` ห้ามส่งกลับ client (ใช้ explicit column select ทุกที่)
- Index: `profiles(pin_locked_until)` สำหรับ cleanup job (optional)

**2. API Routes** (⭐⭐ ปานกลาง)
- `POST /api/auth/pin/set` — ตั้ง PIN ครั้งแรก (verify authenticated + `pin_hash IS NULL`)
- `POST /api/auth/pin/verify` — ตรวจ PIN, track failed attempts, lock 5 นาทีหลัง fail 5 ครั้ง, return JWT-ish unlock token
- `POST /api/auth/pin/reset` — เรียกหลัง re-auth LINE OAuth สำเร็จ → clear hash → redirect ไปตั้งใหม่
- `POST /api/auth/pin/change` — เปลี่ยน PIN (verify PIN เก่าก่อน)
- ทั้งหมดใช้ `runtime = "nodejs"` (bcrypt ไม่รองรับ Edge runtime)
- ใช้ `createAdminClient()` สำหรับอัปเดต `pin_hash` เพื่อ bypass RLS safely

**3. UI Components** (⭐⭐ ปานกลาง)
- `src/components/pin/pin-keypad.tsx` — numeric keypad 0-9 + delete, 6 dots indicator, shake animation on error, haptic feedback (mobile)
- `src/components/pin/pin-setup-screen.tsx` — 2 steps: enter + confirm (ต้องตรงกัน)
- `src/components/pin/pin-lock-screen.tsx` — full-screen overlay, mascot น้องซีมะโด่ง, keypad, "ลืม PIN?" link
- `src/components/pin/pin-verify-dialog.tsx` — modal สำหรับ gate action สำคัญ
- `src/app/[locale]/(auth)/forgot-pin/page.tsx` — trigger LINE OAuth re-auth → redirect กลับมา setup ใหม่

**4. State & Lock Logic** (⭐⭐⭐ ยากสุด — edge cases เยอะ)
- `src/stores/pin-store.ts` (Zustand) — `isUnlocked`, `unlockedAt`, `idleTimeoutMs` (default 5 นาที)
- `src/hooks/use-pin-lock.ts` — ฟัง `visibilitychange` + `pagehide` (iOS Safari), lock เมื่อ background > 30 วิ
- Gate ใน `src/components/layout/student-shell.tsx` — ถ้า `profile.pin_hash` exists + `!isUnlocked` → render `<PinLockScreen />` แทน children
- Onboarding flow — เพิ่ม step `setup-pin` หลัง `complete-profile` ใน `(auth)/register/onboarding`
- **Edge cases ที่ต้องจัดการ**:
  - iOS Safari `visibilitychange` ไม่เสถียร → ใช้ `pagehide` ร่วมด้วย
  - Dev login mode (`NEXT_PUBLIC_DEV_LOGIN=true`) ต้อง bypass PIN
  - LIFF environment: unlock state ไม่ควรแชร์ข้าม LIFF/web (ใช้ sessionStorage ไม่ใช่ localStorage)
  - Deep link → ต้อง preserve intent หลัง unlock (redirect กลับไปหน้าที่ตั้งใจเปิด)

**5. Protected Actions Wrapper** (⭐ ง่าย)
- `<PinGate>` compound component → เปิด `PinVerifyDialog` ก่อนทำงาน
- Wrap: ปุ่มดูบิล, ดูบัตรหอ (`/profile/dorm-card`), logout, settings ที่สำคัญ

**6. i18n + Microcopy** (⭐ ง่าย)
- ~15 keys ใน `th.json` + `en.json` (setup, verify, error, locked, forgot, mismatch, too_many_attempts)
- Tone: น้องซีมะโด่ง friendly แต่ serious สำหรับ security — ใช้ `thai-ux-writing` skill

**Gotchas / Security Considerations**:
- `pin_hash` ห้ามหลุดไปใน `useUser()` query — ต้อง explicit column select ในทุก hook ที่ดึง profiles
- bcrypt ใน Next.js 16 Edge runtime ไม่ support → API route ต้องประกาศ `export const runtime = "nodejs"`
- Rate limit: lock 5 นาทีหลัง fail 5 ครั้ง → ป้องกัน brute force
- PIN = 6 หลัก (10^6 = 1M combinations) — เพียงพอถ้ามี lockout, แต่ไม่ใช่ security สูง
- ห้ามเก็บ PIN ใน plain text ที่ไหนเลย (แม้แต่ logs)
- `pin_hash` + `pin_failed_attempts` update ต้องผ่าน server-side เท่านั้น (ห้าม client update ตรง)

**Delivery Plan (2 PRs)**:
1. **PR1**: DB + API + Setup flow ใน onboarding (ยังไม่ enforce lock)
   - User สามารถตั้ง PIN ได้ แต่ยังไม่ต้องใช้
   - Admin ตรวจใน DB ได้ว่า user ไหนตั้งแล้วบ้าง
2. **PR2**: Lock screen + gate logic + forgot PIN + protected actions
   - Enforce lock ทั้งระบบ
   - Forgot PIN flow ผ่าน LINE OAuth
   - `<PinGate>` wrapper ใน actions สำคัญ

**Not in scope (Phase 7.6)**:
- Biometric auth (Face ID / Touch ID) — อาจเพิ่มใน Phase 9+
- PIN history (ป้องกันตั้งซ้ำของเก่า)
- Admin reset PIN ผ่าน dashboard (user ใช้ LINE OAuth เองได้)
- PIN complexity rules (ห้าม 000000, 123456) — พิจารณาภายหลัง

---

### Phase 7.7: Evaluation System (แบบประเมิน) — DEPLOYED ✅ (2026-04-14)

**Goal**: ระบบแบบประเมินสำหรับกิจกรรมหอพัก — ประเมินร้านค้า, ยื่นขออยู่หอต่อ, อัปโหลดเอกสาร ผูกกับ `dorm_events` ผ่าน `event_type="evaluation"`

**3 Form Types**:
1. **Shop Evaluation** (ประเมินร้านค้า) — Multi-step: 5 shops × 4 criteria each (rating 1-5 + textarea), skip/undo per criterion
2. **Dorm Re-application** (ยื่นขออยู่หอต่อ) — 2-step: conditions review → personal info verification → submit
3. **Document Upload** (อัปโหลดผลลงทะเบียนเรียน CR54) — Single-step: file upload (JPEG/PDF, 10MB) → submit

**Database** (Migration: `20260414_evaluation_system.sql`):
- `evaluation_forms` — one per event (form_type, config JSONB, total_steps)
- `evaluation_criteria` — rating/textarea questions per form
- `evaluation_responses` — per criterion × step × student
- `evaluation_submissions` — progress tracking (in_progress/completed/skipped)
- Seed data: 3 evaluation events, 5 shops, 4 criteria, storage bucket `evaluation-uploads`

**API Routes** (`api/student/evaluation/[formId]/`):
- `GET /` — form config + criteria + submission status
- `POST /` — save/update step responses (upsert)
- `POST /submit` — mark as completed
- `POST /upload` — file upload to Supabase storage

**Hooks** (`src/hooks/use-evaluation.ts`): 6 hooks (useEvaluationForm, useMySubmission, useMyResponses, useSaveStepResponses, useCompleteEvaluation, useUploadEvaluationFile)

**UI** (10 components in `src/components/student/evaluation/`):
- Shared: StepIndicator, RatingScale, CriterionCard, EvaluationHeader, StickyBottomBar, PersonalInfoCard, DocumentUploadZone
- Content: ShopEvaluationContent, DormReapplicationContent, DocumentUploadContent, EvaluationPageContent

**Route**: `src/app/[locale]/(student)/events/[id]/evaluate/page.tsx`

---

### Phase 8: Reports & Analytics — v3.2.0 — DEPLOYED (2026-05-11)

**Route**: `/admin/reports` — single page with 4 tabs, date range picker (30d/90d/6mo/1y preset), CSV + PDF export, admin dashboard export fully wired.

**Phase 8 Deferred — Now Complete (v3.2.0, 2026-05-11)**:

**PDF Export for Reports**:
- `src/app/[locale]/print/report/page.tsx` — print route (`?section=X&from=Y&to=Z`), no sidebar, consistent with `/print/requisition/[id]` pattern
- `src/components/admin/reports/report-print-content.tsx` — fetches active section data via existing hooks, renders KPI grid + print-optimized tables for all 4 sections, auto-triggers `window.print()` after 1.8s delay
- `src/components/admin/reports/reports-export-button.tsx` — CSV single button upgraded to DropdownMenu with CSV (FileSpreadsheet) + PDF (FileText) options

**Supabase Realtime for Live Chat (replaces 3s polling)**:
- `supabase/migrations/20260504_realtime_live_chat.sql` — adds `chat_escalations` + `ai_chat_messages` to `supabase_realtime` publication
- `src/hooks/use-escalations.ts` — removed `refetchInterval: 3000` from `useEscalationQueue` and `useEscalationMessages`; added Supabase channel subscriptions matching `use-notifications.ts` pattern

**Admin Dashboard Export Wired**:
- `src/components/admin/dashboard/dashboard-header.tsx` — replaced `handleComingSoon` toast stubs: CSV uses `useDashboardStats()` data (UTF-8 BOM, `dashboard-snapshot-YYYY-MM-DD.csv`); PDF opens `/[locale]/print/report?section=maintenance&from=...&to=...`; "สร้างรายงาน" → `router.push` to `/admin/reports`

**Commit**: `0ad1fb3`
**Deploy status**: DEPLOYED — https://c-madong-product.vercel.app

---

### Phase 8 (Original): Reports & Analytics ✅ DEPLOYED (2026-05-10)

**Route**: `/admin/reports` — single page with 4 tabs, date range picker (30d/90d/6mo/1y preset), CSV export button per tab.

**4 Report Sections (tabs)**:

1. **การซ่อมบำรุง** (Maintenance) — 4 KPIs (total tickets, completion rate, avg response time hrs, cancellation rate) + category donut PieChart + monthly volume stacked BarChart + response time LineChart + slowest open tickets table

2. **การเงิน** (Billing) — 4 KPIs (revenue collected, collection rate, outstanding amount, overdue rate) + monthly revenue grouped BarChart + status distribution PieChart + category revenue horizontal BarChart + overdue table

3. **การพักอาศัย** (Occupancy) — 4 KPIs (occupancy rate, total/occupied/vacant beds) + per-building horizontal BarChart + move-in timeline BarChart + building detail table with inline progress bars

4. **การมีส่วนร่วม** (Engagement) — 4 KPIs (avg read rate, event attendance rate, calendar completion rate, parcel pickup rate) + weekly reads LineChart + event attendance by type BarChart + chatbot intent distribution PieChart + top announcements table

**New Files**:
- `src/app/[locale]/admin/reports/page.tsx` — page entry point, `?tab=X` URL sync
- `src/app/api/admin/reports/maintenance/route.ts`
- `src/app/api/admin/reports/billing/route.ts`
- `src/app/api/admin/reports/occupancy/route.ts`
- `src/app/api/admin/reports/engagement/route.ts`
- `src/app/api/admin/reports/export/route.ts` — CSV export with UTF-8 BOM for Thai Excel compat
- `src/hooks/use-reports.ts` — 4 TanStack Query hooks, `staleTime: 5 * 60 * 1000`
- `src/lib/utils/thai-month.ts` — Thai month labels + `formatBaht()` helper
- 14 components under `src/components/admin/reports/`

**Modified Files**:
- `src/components/layout/admin-shell.tsx` — Reports nav entry with BarChart3 icon, `Permission.REPORTS_VIEW`
- `src/messages/th.json` + `src/messages/en.json` — `navReports` key added

**Technical Decisions**:
- `recharts` installed (first chart library in project) — all chart components are `"use client"` with `ResponsiveContainer`
- No new DB migrations — all queries use existing tables; JS-side aggregation (not raw SQL GROUP BY)
- `REPORTS_VIEW`, `REPORTS_VIEW_ALL`, `REPORTS_EXPORT` permissions were pre-existing in `src/lib/rbac/permissions.ts`
- CSV export uses native Blob API + BOM prefix (`﻿`) for Thai character Excel compatibility
- All 4 sections prefetch on page load via parallel TanStack Query calls
- URL tab sync via `?tab=X` query param

**Commit**: `836ceef` — feat: Phase 8 reports & analytics dashboard
**Deploy status**: DEPLOYED — https://c-madong-product.vercel.app

### Phase 9: UX/UI Polish & Consistency — v3.1.0 — DEPLOYED (2026-05-11)
Detailed plan: [`docs/phase9-plan.md`](phase9-plan.md)
**Commit**: `6a0c0a4`

**WP1: Code Cleanup & Deduplication** — SKIPPED — domain constants already centralized; UI spacing via Tailwind not worth centralizing at current scale.

**WP2: Design Tokens** ✅ COMPLETE (v2.9.0, 2026-05-06) — Semantic status tokens + `prefers-reduced-motion` guard deployed.

**WP3: Token Compliance** ✅ COMPLETE (v2.9.0, 2026-05-06) — 277 raw hex values → semantic tokens across 43 student components.

**WP4: Component Patterns** ✅ PARTIALLY COMPLETE (v3.1.0, 2026-05-11):
- Replaced `window.confirm/alert` with shadcn `AlertDialog` in 4 files: `roles-list.tsx`, `user-roles-dialog.tsx`, `events-page-content.tsx`, `bill-detail-content.tsx`
- Reused existing `DeleteConfirmDialog` component (no new StatusBadge component created — deferred)
- Errors now surface via `toast.error()` instead of silent failures

**WP5: i18n Completeness** ✅ PARTIALLY COMPLETE (v3.1.0, 2026-05-11):
- `notification-item.tsx` — new `getRelativeTimeParts()` function; time strings extracted to `common.time` namespace (justNow, minutesAgo, hoursAgo, daysAgo, today, yesterday)
- `chat-modal.tsx` — `formatDateLabel()` refactored to accept translated strings; "ทีมงาน" → `t("teamDefault")`
- `th.json` / `en.json` — added: `common.time`, `admin.rbac` (revokeConfirmDesc, revokeConfirmGenericDesc, revokeError, assignError), `chat.teamDefault`, `admin.eventsPage.deleteTitle`, `dashboard.noUpcomingEvents`
- Remaining deferred: `menu-modal.tsx`, `lucide-icon-picker.tsx`, `role-badge.tsx`, `dashboard-events-section.tsx`, `dorm-calendar/empty-state.tsx` still have hardcoded Thai

**WP6: Loading/Empty/Error States** ✅ PARTIALLY COMPLETE (v3.1.0, 2026-05-11):
- `dashboard-events-list.tsx` — CalendarDays icon + `dashboard.noUpcomingEvents` i18n key instead of silent `return null`
- Skeleton loading on 3 additional pages: deferred to Phase 9.5

**WP7: Spacing & Layout** ✅ COMPLETE (v3.1.0, 2026-05-11):
- `profile-info-card.tsx` — `truncate` + `text-center` on name and student ID lines

**WP8: Accessibility** ✅ COMPLETE (v3.1.0, 2026-05-11):
- `bottom-nav.tsx` — bell button `aria-label` with dynamic unread count
- `chat-fab.tsx` — `aria-label="ถามน้องซีมะโด่ง"`
- `roles-list.tsx` — trash button `aria-label={t("revokeRole")}`
- `user-roles-dialog.tsx` — trash button `aria-label={t("revokeRole")}`

**WP9: Animation** — SKIPPED (bonus scope, not critical path).

**Not in scope**: Performance/SEO (Phase 9.5), dark mode, Figma pixel audit, mock/prototype pages.

**Deferred to Phase 9.5**: Skeleton loading states on 3 pages; remaining hardcoded Thai strings in 5 files; `StatusBadge` shared component.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Lighthouse score > 90
- Real-time updates within 1s

### 4.2 Security
- Supabase RLS on all tables (role-based)
- CUNET email verification for students
- LINE OAuth for authentication
- No sensitive data in localStorage
- Input validation (Zod schemas)
- OWASP top 10 compliance

### 4.3 Accessibility
- Bilingual support (Thai default, English)
- Mobile-first responsive design
- WCAG 2.1 AA compliance
- Touch-friendly UI (minimum 44px tap targets)

### 4.4 Scalability
- Target: 1,000+ concurrent students
- Supabase auto-scaling
- Edge functions for serverless compute
- CDN for static assets (Vercel)

### 4.5 Compatibility
- Modern browsers (Chrome, Safari, Firefox)
- LINE In-App Browser (LIFF)
- iOS 15+ / Android 10+
- Desktop responsive (admin portal)

---

## 5. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Student adoption | 80% of dorm residents | Active users / total residents |
| Maintenance response time | < 24 hours | Time from submit to acknowledged |
| Announcement read rate | > 70% | Read count / total recipients |
| Student satisfaction | > 4.0/5.0 | In-app feedback survey |
| Staff efficiency | 50% time reduction | Maintenance ticket processing time |

---

## 6. Version History & Roadmap

### 6.1 V1 Checkpoint (2026-04-10) ✅

**Status**: Production Release — Feature Complete

#### Deployed Features (Phases 0-7.5)
- ✅ **Phase 0**: Scaffold (Next.js 16, Tailwind v4, Supabase, 45 pages)
- ✅ **Phase 1**: Authentication (LINE Login, registration, onboarding, 17 floors, bed button group)
- ✅ **Phase 2**: Admin Dashboard (15 pages, RBAC with 12 roles)
- ✅ **Phase 3**: Billing (bill generation, payment tracking, LINE Flex reminder)
- ✅ **Phase 4**: Parcels (admin CRUD, student UI, LINE Flex notification, chatbot carousel)
- ✅ **Phase 4.5**: Vision AI (repair image analysis, template matching, GPT-4o + Gemini fallback)
- ✅ **Phase 5**: Student Scores (scoring system, admin CRUD, LINE Flex cards)
- ✅ **Phase 6**: AI-Powered UX (notifications, insights, chatbot น้องซีมะโด่ง, RAG)
- ✅ **Phase 7**: LIFF (scaffolded SDK init only)
- ✅ **Phase 7.5**: LINE Onboarding (welcome bubble + 6-bubble carousel, 684KB optimized banners)

#### Post-Launch Features
- ✅ In-App Chat Modal (bottom sheet, drag-to-dismiss, history, suggestion chips)
- ✅ LINE Flex Repair (3 Figma designs: created, tracking, done)
- ✅ Knowledge Base v3 (2-panel layout, folder/tag CRUD, per-doc Q&A)
- ✅ Student Profile (3 Figma designs: main, settings, digital ID card)
- ✅ AI Settings (model, temperature, tone, vision, thresholds, cost dashboard)
- ✅ Live Chat Handoff (student escalation, admin queue, polling-based real-time)
- ✅ Announcements v2 (bookmark, register, read tracking, docs, saved section)
- ✅ Emergency Contact (animated hero, draggable bottom sheet, 5 tabs, 19 contacts)
- ✅ Evaluation System (3 form types: shop eval, dorm reapplication, doc upload)
- ✅ Announcements Organize (folders, tags, bulk ops, archive, cover upload)
- ✅ RAG Accuracy Fix (RPC fixes, intent classification, anti-hallucination guard)
- ✅ Chatbot Quick Reply UX (context-aware menus per intent/postback, auto-append main menu, 11 postback menus)
- ✅ **Chatbot Improvements V2.1 (2026-04-21)** — 3-phase accuracy fix:
  - Intent misclassification: AI primary (not keyword fast-path), broad keywords removed, exclusion patterns, camera quick replies
  - RAG accuracy: sentence-aware chunking (800 chars), better prompt with source citation, max_tokens 300
  - Response length: 1-2 sentence cap, emoji bullets, truncation safety net (2000 chars)
- ✅ **Knowledge Base AI v2.7 (2026-04-24)** — Knowledge Base AI suggestions, version control, and feedback analytics card on admin dashboard
- ✅ **Dorm Calendar v1 (2026-04-26)** — Mandatory task calendar (8 categories), hybrid flag-first sources, admin CRUD + batch, D-7/D-3/D-1/D-0 cron reminders, Framer Motion UX
- ✅ **Bed Selection v2.3.0 (2026-04-27)** — Annual mandatory bed selection flow: floor selector (1-17), room grid with live mock occupancy, 10-min countdown client timer, confirm page (personal info + bed transition card), success page, auto-confirm cron D-0 23:59 BKT, dorm_calendar completion + score integration
- ✅ **Announcement AI Poster Upload v2.4.0 (2026-04-27)** — Admin uploads Canva poster → Typhoon OCR extracts Thai text → gpt-4o-mini structures into title/body/event_date/category/tags → AI suggestion dialog (4-state, editable, feedback loop). New `event_date` column shown in student activity carousel. Published announcements embedded (vector 1536) into `match_documents` UNION — น้องซีมะโด่ง can answer questions about announcements and return Flex resource cards. Commit: `da90965`

#### Technical Metrics (V1)
- **Pages**: 36 (student + admin)
- **API Routes**: 60+
- **Database Tables**: 40+
- **LINE Integrations**: 17 (Flex + webhook)
- **Migrations**: 27 files
- **Components**: 100+ custom components
- **State Hooks**: 25 TanStack Query hooks
- **Stores**: 6 Zustand stores

#### V1 Documentation
- 📄 [CHANGELOG_V1.md](./CHANGELOG_V1.md) — Detailed changelog
- 📄 [V1_FEATURES.md](./V1_FEATURES.md) — Feature reference
- 📄 [V1_SNAPSHOT.md](./V1_SNAPSHOT.md) — Architecture snapshot

#### Git Reference
```bash
# V1.0.0 release tag
git tag -a v1.0.0 -m "C-Madong V1 Release - Full feature set"
git checkout -b release/v1.0  # Maintenance branch
```

---

### 6.2 V2 Planning (2026-Q2 onwards)

**Status**: Planning Phase

#### Core Objectives
1. **Complete Phases 8-9** (Reports + Polish)
2. **LIFF Mini App** (full integration)
3. **Technical Debt Resolution**
4. **Advanced AI Features**

---

#### Phase 8: Reports & Analytics ✅ DEPLOYED (2026-05-10)

See Phase 8 section above for full spec. Summary:
- [x] Maintenance analytics (completion rate, response time, category breakdown, slowest open tickets)
- [x] Billing analytics (collection rate, revenue, overdue tracking)
- [x] Occupancy reports (bed utilization, per-building stats, move-in timeline)
- [x] Student engagement (read rate, event attendance, chatbot intent distribution, parcel pickup rate)
- [x] CSV export per tab with Thai BOM prefix for Excel compatibility
- [x] Date range filter (30d / 90d / 6mo / 1y presets)
- [x] `recharts` library integrated (PieChart, BarChart, LineChart, ResponsiveContainer)

**Completed in v3.2.0 (2026-05-11)**:
- [x] PDF export — `/print/report` print route + `report-print-content.tsx` client component, `window.print()` after 1.8s delay
- [x] Live Chat Realtime — `chat_escalations` + `ai_chat_messages` added to Supabase Realtime publication; polling removed from `use-escalations.ts`
- [x] Admin dashboard CSV/PDF export — `dashboard-header.tsx` stubs replaced with real implementations

**Still deferred to V2 / Phase 9+**:
- [ ] Student personal activity summary / monthly reports
- [ ] Real-time chart streaming on reports page itself (KPI cards updating live as new tickets arrive; Realtime was done for live-chat only)

---

#### Phase 9: UX Polish & Accessibility — PARTIALLY DEPLOYED (v3.1.0, 2026-05-11)

**Performance Optimization** (deferred to Phase 9.5)
- [ ] Replace polling with WebSockets (Supabase Realtime)
- [ ] Image lazy loading + blur placeholders
- [ ] Code splitting for admin modules
- [ ] Service worker + offline support
- [ ] Bundle size optimization (< 200KB initial)

**Accessibility Audit (WCAG 2.1 AA)**
- [ ] Screen reader testing (VoiceOver + TalkBack)
- [ ] Keyboard navigation improvements
- [ ] Focus management in modals
- [ ] Color contrast fixes
- [x] `aria-label` on icon buttons (bottom nav bell, chat FAB, RBAC trash buttons) ✅ 2026-05-11
- [ ] `focus-visible` rings on custom interactive elements

**UX Refinements**
- [x] AlertDialog replaces `window.confirm/alert` in 4 files ✅ 2026-05-11
- [x] Toast error notifications for role assign/revoke failures ✅ 2026-05-11
- [x] Empty state with CalendarDays icon on student dashboard events list ✅ 2026-05-11
- [x] Text truncation on profile info card name/ID lines ✅ 2026-05-11
- [ ] Loading skeletons on 3 pages (deferred Phase 9.5)
- [ ] Error boundaries + retry mechanisms
- [ ] Animated page transitions
- [ ] Haptic feedback (mobile)

**i18n Completeness**
- [x] `common.time` namespace — relative time strings (justNow, minutesAgo, hoursAgo, daysAgo, today, yesterday) ✅ 2026-05-11
- [x] `admin.rbac` — revoke/assign confirmation and error keys ✅ 2026-05-11
- [x] `chat.teamDefault` — "ทีมงาน" extracted from chat-modal ✅ 2026-05-11
- [x] `dashboard.noUpcomingEvents` — student dashboard empty events state ✅ 2026-05-11
- [ ] Remaining hardcoded Thai in: `menu-modal.tsx`, `lucide-icon-picker.tsx`, `role-badge.tsx`, `dashboard-events-section.tsx`, `dorm-calendar/empty-state.tsx` (Phase 9.5)

**Design System Audit**
- [ ] Token consistency check (spacing, colors, shadows)
- [ ] Component prop standardization
- [ ] Dark mode support (optional)

**Estimated Effort**: 2-3 weeks

---

#### Phase 10: LIFF Mini App (SCAFFOLDED)

**Status**: SDK initialized, full integration pending

**Features to Implement**
- [ ] QR code scanner (dorm card verification)
- [ ] Camera integration (repair photo upload from LIFF)
- [ ] Share target (share announcement to LINE chat)
- [ ] Bluetooth beacon (automatic check-in)
- [ ] Push to LINE chat (emergency broadcast)
- [ ] External browser redirect (payment gateway)

**Technical Requirements**
- LIFF SDK v2 upgrade (from v1 placeholder)
- Permission handling (camera, location)
- iOS/Android compatibility testing
- Fallback for non-LIFF browsers

**Estimated Effort**: 2 weeks

---

#### Technical Debt Resolution

**Database**
- [ ] Regenerate Supabase types (all V1 tables finalized)
- [ ] Migrate legacy role mapping to RBAC-only (`profiles.role` deprecation)
- [ ] RLS policy review (remove `createAdminClient()` workarounds where possible)
- [ ] Index optimization (slow queries on `maintenance_requests`, `announcements`)

**Code Quality**
- [ ] Consolidate admin API routes (reduce duplication)
- [ ] Remove `(supabase as any)` casts (after type regen)
- [ ] Standardize error handling (unified error boundaries)
- [ ] Extract magic numbers to constants
- [ ] Remove dead code (unused components, old migrations)

**Architecture**
- [ ] Replace in-memory cache with Redis (AI settings, session state)
- [ ] WebSocket server for real-time (replace polling)
- [ ] Event-driven architecture (pub/sub for notifications)

**Estimated Effort**: 1-2 weeks

---

#### Advanced AI Features

**Vision AI Enhancements**
- [ ] Multi-photo analysis (detect multiple issues in single request)
- [ ] Damage severity scoring (minor/moderate/severe)
- [ ] Before/after comparison (repair validation)
- [ ] Object detection (specific equipment recognition)

**Chatbot Improvements**
- [ ] Sentiment analysis (detect frustrated users → auto-escalate)
- [ ] Multi-turn conversation memory (context beyond session state)
- [ ] Voice input support (Thai speech-to-text)
- [ ] Proactive notifications (predictive maintenance reminders)

**Knowledge Base**
- [ ] Auto-categorization (new docs → suggested folders/tags)
- [ ] Semantic search (not just keyword)
- [ ] Question suggestions (based on doc content)
- [ ] Multi-lingual embeddings (Thai + English)

**Predictive Analytics**
- [ ] Maintenance forecasting (predict common issues by season/building)
- [ ] Occupancy prediction (vacancy trends)
- [ ] Bill overdue risk scoring (notify high-risk students earlier)

**Estimated Effort**: 4-6 weeks

---

#### Infrastructure & DevOps

**CI/CD**
- [ ] Automated testing (Playwright E2E + Vitest unit tests)
- [ ] Staging environment (separate Supabase project)
- [ ] Preview deployments (per-PR on Vercel)
- [ ] Database migration rollback scripts

**Monitoring**
- [ ] Error tracking (Sentry or similar)
- [ ] Performance monitoring (Vercel Analytics + custom metrics)
- [ ] Uptime monitoring (LINE webhook health checks)
- [ ] Database query performance (slow query logs)

**Security**
- [ ] Dependency updates (automated Dependabot PRs)
- [ ] Security audit (OWASP top 10 compliance review)
- [ ] Penetration testing (third-party)

**Estimated Effort**: 1-2 weeks

---

#### Breaking Changes Considerations (V2)

**Database Schema**
- **Approach**: Backward-compatible migrations (additive changes only)
- **Strategy**: New columns nullable, deprecated columns kept for 1 version
- **Example**: `profiles.role` → keep but mark deprecated, read from `user_roles` instead

**API Versioning**
- **Approach**: Unversioned → `/api/v1/` prefix for new routes
- **Strategy**: Keep existing routes as-is, new features use `/api/v2/`
- **Example**: `/api/admin/maintenance` (V1) vs `/api/v2/admin/maintenance` (V2 with WebSocket)

**State Management**
- **Approach**: Migrate Zustand stores to TanStack Query where possible
- **Reason**: Server state should use TanStack Query, client state only for UI

---

### 6.3 Future Considerations (V3+)

**Platform Expansion**
- Native mobile apps (React Native or Flutter)
- Desktop app (Electron for admin portal)
- Public API for third-party integrations

**Advanced Features**
- IoT integration (smart locks, sensors)
- Payment gateway (PromptPay, credit card)
- Visitor management system
- Parcel locker integration
- Laundry booking system
- Co-working space reservation

**Multi-Tenancy**
- White-label solution for other universities
- Multi-dorm support (Chula's 30+ dorms)
- SaaS model with per-dorm pricing

---

**Next Steps for V2**:
1. ✅ ~~Complete Phase 8 (Reports)~~ — DEPLOYED 2026-05-10
2. ✅ ~~Phase 8 Deferred (PDF export + Live Chat Realtime + Dashboard export)~~ — DEPLOYED 2026-05-11 (v3.2.0, commit `0ad1fb3`)
3. Complete Phase 7.6 (PIN Security) — full spec in PRD, 0 code, DB migration + 4 API routes + 5 components needed
4. Complete Phase 9.5 (skeleton loading, remaining hardcoded Thai, StatusBadge, focus-visible) — 1 week
5. Student personal activity summary / monthly report — backlog
4. Technical debt resolution (Supabase type regen, RBAC cleanup, legacy role deprecation) — 1-2 weeks
5. LIFF Mini App — 2 weeks
6. Advanced AI (optional stretch goal) — 4-6 weeks

**Estimated V2 Timeline**: 8-12 weeks (2-3 months)

---
