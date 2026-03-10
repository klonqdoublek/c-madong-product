# C-Madong Product Requirements Document (PRD)

> **Version**: 1.4
> **Last Updated**: 2026-03-09
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
│   └── Chatbot น้องซีมะโด่ง (intent router, RAG, chitchat) ✅
│
└── Backend (Supabase)
    ├── PostgreSQL Database + pgvector (RAG embeddings)
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
- [ ] เลือกประเภท: ไฟฟ้า, ประปา, เฟอร์นิเจอร์, แอร์, อินเทอร์เน็ต, กุญแจ, แมลง, ทำความสะอาด, อื่นๆ
- [ ] กรอกรายละเอียดปัญหา (10-2000 ตัวอักษร)
- [ ] แนบรูปภาพ (สูงสุด 5 รูป)
- [ ] เลือกวัน-เวลานัดหมายช่าง (09:00-18:00)
- [ ] AI auto-categorize & priority (optional)

#### US-3.2: Track Request (Student)
> **As a** student, **I want to** track my maintenance requests, **so that** I know when they'll be fixed.

**Features:**
- [ ] ดูรายการแจ้งซ่อมทั้งหมดของตัวเอง
- [ ] สถานะ: รอดำเนินการ → รับเรื่องแล้ว → กำลังดำเนินการ → เสร็จสิ้น/ยกเลิก
- [ ] Real-time status updates via notification
- [ ] รายละเอียดการซ่อม, หมายเหตุจากช่าง

#### US-3.3: Manage Tickets (Admin)
> **As a** staff member, **I want to** manage maintenance tickets, **so that** I can track and resolve issues.

**Features:**
- [ ] Kanban board view (drag-and-drop status changes)
- [ ] Table/list view with search & filters
- [ ] Ticket detail: change status, add notes, assign technician
- [ ] Status: new → received → in_progress → completed/failed
- [ ] Failure reason (required if marking as failed)
- [ ] Send LINE notification to student on status change
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
| พัสดุ (Parcels) | แจ้งเตือนพัสดุ, รับพัสดุ | Medium |
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

**Chatbot น้องซีมะโด่ง ✅ FULLY WORKING (2026-03-03):**
- LINE webhook handler (`/api/webhooks/line`)
- Intent router (OpenAI gpt-4o-mini classification)
- Session management + chat history
- RAG integration (pgvector embeddings → gpt-4o-mini answer) — tested end-to-end on LINE ✅
- Quick Reply menu (trigger: "น้องซีมะโด่ง", "เมนู", "help") with 4 action buttons ✅
- Image support
- All AI: OpenAI gpt-4o-mini (switched from Gemini — free tier quota exhausted)

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
- score_categories, score_entries, dorm_events
- bills, bill_items (new — Phase 3)
- user_roles, role_permissions (RBAC — cross-phase)

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

### Phase 4: Parcel Management
- Parcel notification system
- Parcel pickup tracking
- LINE notification on arrival

### Phase 5: Dorm Score & Activities (Plan drafted)
- Score categories (activities, community service, rules, meetings)
- Dorm events with schedule + attendance tracking
- Student score dashboard
- Admin score entry management

### Phase 6: AI Adaptive UX Layer (Plan drafted)
- Dashboard insights (personalized for each student)
- Smart notifications (AI-prioritized)
- Adaptive UX (usage-based interface optimization)
- Chatbot enhancement (multi-turn, proactive suggestions)

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
