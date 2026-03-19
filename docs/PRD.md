# C-Madong Product Requirements Document (PRD)

> **Version**: 1.8
> **Last Updated**: 2026-03-19
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
│   └── Profile Management
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
│   └── Settings & Configuration
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
- [ ] กรอก student ID (10 หลัก), ชื่อ-นามสกุล (ไทย/อังกฤษ), อีเมล CUNET
- [ ] ระบบส่ง verification email ไปที่ @student.chula.ac.th
- [ ] ยืนยันอีเมลแล้วจึงดำเนินการต่อ

#### US-1.3: Onboarding (Student)
> **As a** registered student, **I want to** set up my room information, **so that** the system knows where I stay.

**Acceptance Criteria:**
- [ ] เลือกตึก → ชั้น → ห้อง → เตียง (multi-step form)
- [ ] เลือกภาษาที่ต้องการใช้ (ไทย/อังกฤษ)
- [ ] ตั้งค่า preferences สำหรับการแจ้งเตือน
- [ ] หลังเสร็จ → redirect ไป dashboard

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

#### US-2.2: Digital Dorm Card
> **As a** student, **I want to** have a digital dorm card, **so that** I don't need to carry a physical card.

**Features:**
- [ ] แสดงข้อมูลนิสิต: ชื่อ, รหัสนิสิต, รูป
- [ ] ข้อมูลห้อง: ตึก, ชั้น, ห้อง, เตียง
- [ ] QR Code สำหรับ check-in/check-out
- [ ] สามารถแคปหน้าจอได้ง่าย

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

#### US-4.3: Template Management (Admin)
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
- [ ] Webhook handler for incoming events (follow, unfollow, message)
- [ ] Auto-sync follower list
- [ ] Flex message templates with visual builder

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

### Phase 1: Authentication & Onboarding ✅ DEPLOYED (2026-02-23)
- Supabase project setup + environment variables
- Database migrations (profiles, buildings, rooms, beds — 5 buildings, 200 rooms, 560 beds)
- LINE Login OAuth flow (`/api/auth/line` → `/api/auth/callback`)
- Synthetic email auth pattern (`{lineUid}@line.c-madong.app`)
- Registration form (`/api/auth/register`)
- Multi-step onboarding wizard (profile → room/bed → language)
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
- Knowledge Base (RAG): document upload (txt/md/PDF) → drag & drop → OpenAI embeddings → gpt-4o-mini Q&A playground ✅
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
- Quick Reply menu (trigger: "น้องซีมะโด่ง", "เมนู", "help") with 4 action buttons ✅
- Image support
- All AI: OpenAI gpt-4o-mini (switched from Gemini — free tier quota exhausted)
- **Repair flow fix (2026-03-18):** Postback reads detection from session (not params), description=original message, reporter context queries tables separately, CU Pink Flex design

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
- documents (extended: status, filename, file_path, content_type) + document_sections (pgvector)
- ai_chat_messages, chatbot_sessions
- score_categories, score_entries, dorm_events, event_attendance (Phase 5)
- bills, bill_items (new — Phase 3)
- parcels (new — Phase 4)
- user_roles, role_permissions (RBAC — cross-phase)
- FK fix: `maintenance_requests.requester_id` → `profiles(id)` for PostgREST joins (2026-03-18)

**RBAC System ✅ (2026-03-05):**
- 13 roles (super_admin, head, registrar, finance, parcel, admin_staff, service, activity, technician_head, technician, technician_it, committee, student)
- 80+ permissions, building scopes for registrars
- Role Management UI at `/admin/roles`
- PermissionGuard component for conditional rendering

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

### Phase 4.5: AI Vision Analysis for Repair Reporting ⚙️ IN PROGRESS (2026-03-18)

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
2. Gemini 2.0 Flash (primary AI) — 25% cases, <3s, FREE (1500 req/day tier)
3. GPT-4o (fallback) — 5% cases, <5s, ฿0.30/ticket
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

**Rollout Plan:**
- **Week 1 (Current)**: Foundation — migrations, agents, orchestrator, seed templates
- **Week 2**: MVP — enable for 10 beta users, monitor accuracy/cost, iterate on prompts
- **Week 3**: Full rollout — all users, expand template library to 50+, GPT-4o fallback active
- **Week 4-6**: Enhancements — multi-photo analysis, admin feedback loop, template optimization

**Feature Flag:**
- `ENABLE_VISION_ANALYSIS=false` (default off for gradual rollout)
- Set to `true` to enable vision analysis for repair requests with photos

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
- `/score` page: Composite score card with tier indicator, 2x2 category breakdown grid, score history timeline with load more
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

### Student Dashboard Redesign (Figma → Code, 2026-03-15)

Redesigned student home page from Figma design (node 189:1102):
- **DashboardHeader**: Profile avatar, personalized greeting ("สวัสดี, [name] :)"), notification bell with badge, search bar pill
- **DashboardActionCards**: Horizontal scroll "ที่ต้องดำเนินการ" section — featured pink gradient card with urgency/deadline badges + secondary outline cards (static mock data, ready for real integration)
- **DashboardStatusCard**: Combined room info (pink header bar with room number, bed, building) + score progress bar (segmented by category with legend)
- **Quick Menu Grid**: 4x2 grid with `bg-cu-light-pink` tiles — ค่าหอพัก, แจ้งซ่อม, พัสดุ, ข่าวสาร, ฉุกเฉิน, ข้อมูล, ติดต่อ, ประเมิน
- **DashboardAnnouncements**: Events list with color-coded date badges (primary→light pink→tint), importance badges, time labels
- **Footer**: Pink wave SVG decoration + "RCU.C-MADONG" + "Version 1.0"
- **Bottom nav updated**: Mascot center icon ("ถามน้องซี"), ฉุกเฉิน replaces แจ้งซ่อม, บัญชีของฉัน replaces โปรไฟล์
- **StudentShell**: Global Header hidden on dashboard page (dashboard has its own DashboardHeader)

**Files**: `dashboard/content.tsx`, `dashboard-header.tsx`, `dashboard-action-cards.tsx`, `dashboard-status-card.tsx`, `dashboard-announcements.tsx`

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

### Phase 8: Reports & Analytics
- Admin dashboard charts
- Maintenance response time analytics
- Student activity reports
- Export capabilities (CSV/PDF)

### Phase 9: Polish & Launch
- Performance optimization (FCP < 2s, Lighthouse > 90)
- Error boundaries & logging
- Comprehensive testing
- Security audit (RLS policies, input validation)
- WCAG 2.1 AA compliance audit
- Production launch

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
