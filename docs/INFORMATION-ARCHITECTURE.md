# C-Madong Information Architecture & Sitemap

> **Version**: 1.0
> **Last Updated**: 2026-02-14
> **Author**: Khaoklong (Product Designer)

---

## 1. Sitemap Overview

```
C-Madong
│
├── Public (ไม่ต้อง login)
│   ├── /login                    เข้าสู่ระบบ
│   ├── /register                 ลงทะเบียน
│   └── /liff                     LINE LIFF entry
│
├── Student (นิสิต)
│   ├── /dashboard                หน้าหลัก
│   ├── /maintenance              แจ้งซ่อม
│   │   ├── /maintenance/new      แจ้งซ่อมใหม่
│   │   └── /maintenance/[id]     รายละเอียดคำขอ
│   ├── /announcements            ประกาศ
│   │   └── /announcements/[id]   รายละเอียดประกาศ
│   ├── /profile                  โปรไฟล์ / บัตรหอพัก
│   ├── /notifications            แจ้งเตือน
│   └── /onboarding               ตั้งค่าเริ่มต้น (first-time only)
│
└── Admin (เจ้าหน้าที่)
    ├── /admin/dashboard           แดชบอร์ด
    ├── /admin/maintenance         งานแจ้งซ่อม
    │   └── /admin/maintenance/[id]  จัดการคำขอ
    ├── /admin/students            จัดการนิสิต
    │   └── /admin/students/[id]   ข้อมูลนิสิต
    ├── /admin/announcements       จัดการประกาศ
    │   ├── /admin/announcements/new  สร้างประกาศ
    │   └── /admin/announcements/[id] แก้ไขประกาศ
    ├── /admin/broadcast           บรอดแคสต์
    └── /admin/settings            ตั้งค่าระบบ
```

---

## 2. Detailed Sitemap with Content Inventory

### 2.1 Public Pages (No Auth Required)

```
┌─────────────────────────────────────────────────────────┐
│  PUBLIC                                                  │
│                                                          │
│  /login                                                  │
│  ├── Content: Logo, welcome text, LINE login button      │
│  ├── Actions: เข้าสู่ระบบด้วย LINE                       │
│  └── Leads to: /register (new) or /dashboard (existing)  │
│                                                          │
│  /register                                               │
│  ├── Content: Registration form                          │
│  │   ├── Student ID (10 หลัก)                            │
│  │   ├── ชื่อ-นามสกุล (ไทย)                               │
│  │   ├── ชื่อ-นามสกุล (English)                           │
│  │   ├── CUNET Email (@student.chula.ac.th)              │
│  │   └── เบอร์โทร (optional)                              │
│  ├── Actions: ลงทะเบียน, ยืนยันอีเมล                     │
│  └── Leads to: /onboarding                               │
│                                                          │
│  /liff                                                   │
│  ├── Content: LINE LIFF mini app container               │
│  ├── Actions: Auto-login via LIFF SDK                    │
│  └── Leads to: /dashboard (within LINE app)              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Onboarding (First-Time Only)

```
┌─────────────────────────────────────────────────────────┐
│  ONBOARDING (multi-step, sequential)                     │
│                                                          │
│  /onboarding                                             │
│                                                          │
│  Step 1: ข้อมูลส่วนตัว                                    │
│  ├── ยืนยันชื่อ-นามสกุล                                   │
│  └── อัปโหลดรูปโปรไฟล์ (optional)                         │
│                                                          │
│  Step 2: เลือกห้องพัก                                     │
│  ├── เลือกตึก (dropdown)                                  │
│  ├── เลือกชั้น (dropdown, filtered by ตึก)                │
│  ├── เลือกห้อง (dropdown, filtered by ชั้น)               │
│  └── เลือกเตียง (dropdown, filtered by ห้อง)              │
│                                                          │
│  Step 3: ตั้งค่า                                          │
│  ├── เลือกภาษา (ไทย / English)                           │
│  └── ตั้งค่าการแจ้งเตือน                                   │
│                                                          │
│  → Leads to: /dashboard                                  │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Student Pages

```
┌─────────────────────────────────────────────────────────┐
│  STUDENT                                                 │
│                                                          │
│  /dashboard ─────────────────────── หน้าหลัก              │
│  ├── Greeting: สวัสดี, [ชื่อ]                             │
│  ├── Residence counter: อยู่มาแล้ว X วัน                  │
│  ├── Quick actions (4 cards):                            │
│  │   ├── แจ้งซ่อม → /maintenance/new                     │
│  │   ├── ประกาศ → /announcements                         │
│  │   ├── ค่าน้ำค่าไฟ → (Phase 8)                         │
│  │   └── พัสดุ → (Phase 8)                               │
│  ├── Pinned announcements (cards)                        │
│  └── Recent activity feed                                │
│                                                          │
│  /maintenance ──────────────────── แจ้งซ่อม               │
│  ├── Filter tabs: ทั้งหมด / รอดำเนินการ / กำลังดำเนินการ  │
│  ├── Request list (cards):                               │
│  │   ├── Category icon + label                           │
│  │   ├── Title / description preview                     │
│  │   ├── Status badge                                    │
│  │   └── Date submitted                                  │
│  ├── Empty state: ยังไม่มีรายการแจ้งซ่อม                   │
│  └── FAB: + แจ้งซ่อมใหม่ → /maintenance/new              │
│                                                          │
│  /maintenance/new ─────────────── แจ้งซ่อมใหม่            │
│  ├── Category picker (9 categories):                     │
│  │   ไฟฟ้า, ประปา, เฟอร์นิเจอร์, แอร์,                    │
│  │   อินเทอร์เน็ต, กุญแจ, แมลง, ทำความสะอาด, อื่นๆ       │
│  ├── Title input                                         │
│  ├── Description textarea (10-2000 chars)                │
│  ├── Photo upload (max 5)                                │
│  ├── Appointment picker:                                 │
│  │   ├── Date picker                                     │
│  │   └── Time slots (09:00-18:00)                        │
│  └── Actions: ส่งคำขอ / ยกเลิก                           │
│                                                          │
│  /maintenance/[id] ────────────── รายละเอียดคำขอ          │
│  ├── Status timeline (visual progress)                   │
│  ├── Request details:                                    │
│  │   ├── Category, title, description                    │
│  │   ├── Photos (gallery)                                │
│  │   └── Appointment date/time                           │
│  ├── Admin notes (read-only)                             │
│  ├── Update history                                      │
│  └── Actions: ยกเลิกคำขอ (if pending)                    │
│                                                          │
│  /announcements ───────────────── ประกาศ                  │
│  ├── Pinned section (top)                                │
│  ├── Announcement list (newest first):                   │
│  │   ├── Cover image (if any)                            │
│  │   ├── Title                                           │
│  │   ├── Content preview (2 lines)                       │
│  │   ├── Published date                                  │
│  │   └── Read/unread indicator                           │
│  └── Empty state: ยังไม่มีประกาศ                          │
│                                                          │
│  /announcements/[id] ─────────── รายละเอียดประกาศ         │
│  ├── Cover image (full width)                            │
│  ├── Title                                               │
│  ├── Content (rich text)                                 │
│  ├── Author + published date                             │
│  └── Actions: mark as read (auto on view)                │
│                                                          │
│  /profile ─────────────────────── โปรไฟล์                 │
│  ├── Digital Dorm Card:                                  │
│  │   ├── Profile photo                                   │
│  │   ├── ชื่อ-นามสกุล                                     │
│  │   ├── รหัสนิสิต                                        │
│  │   ├── ตึก / ชั้น / ห้อง / เตียง                        │
│  │   └── QR Code (for check-in)                          │
│  ├── Personal info section                               │
│  │   ├── อีเมล, เบอร์โทร                                  │
│  │   └── Move-in date                                    │
│  ├── Settings:                                           │
│  │   ├── ภาษา (ไทย / English)                            │
│  │   └── การแจ้งเตือน preferences                         │
│  └── Actions: แก้ไขโปรไฟล์, ออกจากระบบ                    │
│                                                          │
│  /notifications ───────────────── แจ้งเตือน               │
│  ├── Notification list (newest first):                   │
│  │   ├── Icon by type (maintenance/announcement/         │
│  │   │   bill/parcel/general)                            │
│  │   ├── Title                                           │
│  │   ├── Body preview                                    │
│  │   ├── Timestamp (relative)                            │
│  │   └── Read/unread dot                                 │
│  ├── Actions: mark all as read                           │
│  └── Empty state: ไม่มีแจ้งเตือน                          │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Admin Pages

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN                                                   │
│                                                          │
│  /admin/dashboard ─────────────── แดชบอร์ด               │
│  ├── Stats cards (4):                                    │
│  │   ├── จำนวนนิสิตทั้งหมด                                │
│  │   ├── งานแจ้งซ่อมค้าง                                  │
│  │   ├── บิลค้างชำระ                                      │
│  │   └── พัสดุ                                            │
│  ├── Charts section (Phase 6):                           │
│  │   ├── Maintenance requests over time                  │
│  │   ├── Category breakdown (pie)                        │
│  │   └── Resolution time trend                           │
│  ├── Recent announcements (5 latest)                     │
│  └── Recent maintenance tickets (5 latest)               │
│      └── Real-time updates (Supabase subscription)       │
│                                                          │
│  /admin/maintenance ───────────── งานแจ้งซ่อม             │
│  ├── View toggle: Kanban / List                          │
│  │                                                       │
│  │  [Kanban View]                                        │
│  │  ├── Column: รอดำเนินการ (pending)                     │
│  │  ├── Column: รับเรื่องแล้ว (acknowledged)              │
│  │  ├── Column: กำลังดำเนินการ (in_progress)              │
│  │  ├── Column: เสร็จสิ้น (completed)                     │
│  │  └── Column: ไม่สำเร็จ (failed)                       │
│  │  Cards: drag-and-drop between columns                 │
│  │                                                       │
│  │  [List View]                                          │
│  │  ├── Search bar                                       │
│  │  ├── Filters: status, category, building, floor       │
│  │  └── Table: ID, category, title, room, status, date   │
│  │                                                       │
│  └── Real-time updates (Supabase subscription)           │
│                                                          │
│  /admin/maintenance/[id] ──────── จัดการคำขอ              │
│  ├── Request details (read-only from student)            │
│  ├── Status dropdown (change status)                     │
│  ├── Assigned to (technician)                            │
│  ├── Admin notes (textarea)                              │
│  ├── Failure reason (if status = failed)                 │
│  ├── Photo gallery                                       │
│  ├── Status history / audit log                          │
│  └── Actions: บันทึก, ส่งแจ้งเตือนนิสิต                   │
│                                                          │
│  /admin/students ──────────────── จัดการนิสิต              │
│  ├── Search bar                                          │
│  ├── Filters: building, floor, status, tags              │
│  ├── Table:                                              │
│  │   ├── Name, Student ID, Room                          │
│  │   ├── LINE status (linked / not linked)               │
│  │   ├── Tags (badges)                                   │
│  │   └── Status (active / inactive)                      │
│  ├── Bulk actions: assign tags, export                   │
│  └── Actions: + เพิ่มนิสิต, import, sync LINE followers  │
│                                                          │
│  /admin/students/[id] ─────────── ข้อมูลนิสิต             │
│  ├── Profile card:                                       │
│  │   ├── Photo, name, student ID                         │
│  │   ├── Email, phone, LINE UID                          │
│  │   └── Room info (building/floor/room/bed)             │
│  ├── Tags management (add/remove)                        │
│  ├── Maintenance history                                 │
│  ├── Notification history                                │
│  └── Actions: แก้ไข, เปลี่ยนสถานะ, ลบ                    │
│                                                          │
│  /admin/announcements ─────────── จัดการประกาศ            │
│  ├── Filter tabs: all / draft / scheduled / sent / failed│
│  ├── Search bar                                          │
│  ├── Table/cards:                                        │
│  │   ├── Title, status badge                             │
│  │   ├── Target (broadcast / tag names)                  │
│  │   ├── Scheduled / sent date                           │
│  │   └── Author                                          │
│  └── Actions: + สร้างประกาศใหม่                           │
│                                                          │
│  /admin/announcements/new ─────── สร้างประกาศ             │
│  ├── Title input (Thai / English)                        │
│  ├── Content editor:                                     │
│  │   ├── Tab: Rich text editor                           │
│  │   └── Tab: LINE Flex message editor                   │
│  │       ├── Template selector                           │
│  │       ├── Visual builder                              │
│  │       ├── JSON editor toggle                          │
│  │       └── Live preview                                │
│  ├── AI Writing Assistant panel                          │
│  ├── Cover image upload                                  │
│  ├── Target selector:                                    │
│  │   ├── Radio: ส่งถึงทุกคน (broadcast)                   │
│  │   └── Radio: เลือกกลุ่ม (select tags)                  │
│  ├── Schedule options:                                   │
│  │   ├── ส่งทันที                                         │
│  │   ├── ตั้งเวลาส่ง (date/time picker)                   │
│  │   └── ส่งซ้ำ (recurring: daily/weekly/monthly)         │
│  ├── Pin toggle (ปักหมุด)                                 │
│  └── Actions: ส่ง / ตั้งเวลา / บันทึกแบบร่าง              │
│                                                          │
│  /admin/announcements/[id] ────── แก้ไขประกาศ             │
│  ├── Same as /new (pre-filled)                           │
│  ├── Delivery status (if sent):                          │
│  │   ├── Sent count                                      │
│  │   └── Failed count                                    │
│  └── Actions: อัปเดต / ลบ                                │
│                                                          │
│  /admin/broadcast ─────────────── บรอดแคสต์               │
│  ├── Broadcast history                                   │
│  ├── Scheduled queue                                     │
│  ├── Template library:                                   │
│  │   ├── Grid/list of templates                          │
│  │   ├── Categories: payment, event, emergency,          │
│  │   │   maintenance                                     │
│  │   ├── Preview (Flex message render)                   │
│  │   └── Actions: ใช้, แก้ไข, ลบ                         │
│  └── Actions: + สร้าง template ใหม่                       │
│                                                          │
│  /admin/settings ──────────────── ตั้งค่าระบบ             │
│  ├── General settings:                                   │
│  │   └── Dorm info, academic year                        │
│  ├── LINE integration:                                   │
│  │   ├── Channel access token status                     │
│  │   └── Webhook URL                                     │
│  ├── AI settings:                                        │
│  │   ├── API key management                              │
│  │   └── Provider selection                              │
│  ├── Tag management:                                     │
│  │   ├── Tag list (name, color, description)             │
│  │   └── Actions: สร้าง / แก้ไข / ลบ tag                 │
│  └── Account management:                                 │
│      ├── Staff accounts list                             │
│      └── Role assignment                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Navigation Structure

### 3.1 Student Navigation (Mobile Bottom Nav)

```
┌──────────────────────────────────────────────┐
│                                              │
│              [Page Content]                  │
│                                              │
├──────────────────────────────────────────────┤
│  🏠         🔧          📢         👤        │
│  หน้าหลัก   แจ้งซ่อม     ประกาศ     โปรไฟล์   │
│  /dashboard /maintenance /announce  /profile │
│             ments                            │
└──────────────────────────────────────────────┘

Header (top):
┌──────────────────────────────────────────────┐
│  [Logo C-Madong]              🔔 (3)         │
│                               /notifications │
└──────────────────────────────────────────────┘
```

**Navigation Rules:**
- Bottom nav visible on all student pages
- Active tab highlighted (primary color)
- Notification badge shows unread count (red dot, "99+" max)
- Header sticky on scroll
- Bottom nav hidden on `md:` screens and above

### 3.2 Admin Navigation (Sidebar)

```
┌────────────────────┬─────────────────────────┐
│                    │                          │
│  C-Madong Admin    │     [Page Content]       │
│                    │                          │
│  ──────────────    │                          │
│                    │                          │
│  📊 แดชบอร์ด       │                          │
│     /admin/        │                          │
│     dashboard      │                          │
│                    │                          │
│  🔧 งานแจ้งซ่อม    │                          │
│     /admin/        │                          │
│     maintenance    │                          │
│                    │                          │
│  👥 นิสิต          │                          │
│     /admin/        │                          │
│     students       │                          │
│                    │                          │
│  📢 ประกาศ         │                          │
│     /admin/        │                          │
│     announcements  │                          │
│                    │                          │
│  📡 บรอดแคสต์      │                          │
│     /admin/        │                          │
│     broadcast      │                          │
│                    │                          │
│  ──────────────    │                          │
│                    │                          │
│  ⚙️ ตั้งค่า        │                          │
│     /admin/        │                          │
│     settings       │                          │
│                    │                          │
│  ──────────────    │                          │
│  🚪 ออกจากระบบ     │                          │
│                    │                          │
└────────────────────┴─────────────────────────┘
```

**Navigation Rules:**
- Desktop: fixed sidebar (w-64), always visible
- Mobile: hamburger menu toggle (overlay with backdrop)
- Active item: highlighted background
- Sidebar collapsible on mobile via Zustand `ui-store`

---

## 4. User Flows

### 4.1 First-Time Student Flow

```
LINE App
  │
  ├── 1. Open C-Madong LIFF / direct URL
  │
  ▼
/login
  │
  ├── 2. Tap "เข้าสู่ระบบด้วย LINE"
  │
  ▼
LINE Consent Screen
  │
  ├── 3. Approve permissions
  │
  ▼
/api/auth/callback
  │
  ├── 4. System checks: has profile?
  │
  ├── NO ──────────────────────┐
  │                            ▼
  │                        /register
  │                          │
  │                          ├── 5. Fill student info
  │                          ├── 6. Verify CUNET email
  │                          │
  │                          ▼
  │                        /onboarding
  │                          │
  │                          ├── 7. Step 1: ข้อมูลส่วนตัว
  │                          ├── 8. Step 2: เลือกห้อง
  │                          ├── 9. Step 3: ตั้งค่า
  │                          │
  │                          ▼
  ├── YES ─────────────────────┐
  │                            ▼
  │                        /dashboard
  │                          │
  │                          └── 10. Ready to use!
```

### 4.2 Maintenance Request Flow

```
Student                          Admin
  │                                │
  ▼                                │
/dashboard                         │
  │                                │
  ├── Tap "แจ้งซ่อม"               │
  │                                │
  ▼                                │
/maintenance/new                   │
  │                                │
  ├── Select category              │
  ├── Fill title + description     │
  ├── Attach photos (optional)     │
  ├── Pick appointment (optional)  │
  ├── Tap "ส่งคำขอ"                │
  │                                │
  ▼                                │
/maintenance                       │
  │                                │
  ├── See new request              │        ┌─── Realtime notification ───┐
  │   (status: รอดำเนินการ)        │        │                             │
  │                                ▼        ▼                             │
  │                          /admin/maintenance                           │
  │                                │                                      │
  │                                ├── See new ticket on Kanban           │
  │                                ├── Drag to "รับเรื่องแล้ว"            │
  │                                │                                      │
  │    ◄── LINE notification ──────┤                                      │
  │    ◄── In-app notification ────┤                                      │
  │                                │                                      │
  │                                ├── Assign technician                  │
  │                                ├── Drag to "กำลังดำเนินการ"           │
  │                                │                                      │
  │    ◄── LINE notification ──────┤                                      │
  │                                │                                      │
  ▼                                ├── Add admin notes                    │
/maintenance/[id]                  ├── Drag to "เสร็จสิ้น"                │
  │                                │                                      │
  ├── View status timeline         │   OR                                 │
  ├── See admin notes              ├── Mark as "ไม่สำเร็จ"                │
  │                                │   + failure reason                   │
  │    ◄── LINE notification ──────┤                                      │
  │                                │                                      │
  └── Done                         └── Done                               │
```

### 4.3 Announcement Broadcasting Flow

```
Admin
  │
  ▼
/admin/announcements
  │
  ├── Tap "+ สร้างประกาศใหม่"
  │
  ▼
/admin/announcements/new
  │
  ├── Write content (rich text or Flex editor)
  │   │
  │   ├── [Option A] Rich text
  │   │   └── Type/paste content
  │   │
  │   ├── [Option B] Flex message
  │   │   ├── Choose template or build custom
  │   │   ├── Edit in visual builder
  │   │   └── Preview in phone mockup
  │   │
  │   └── [Option C] AI assist
  │       ├── Enter prompt
  │       └── Generate + refine Thai copy
  │
  ├── Choose target
  │   ├── ส่งถึงทุกคน (broadcast)
  │   └── เลือกกลุ่ม (select tags)
  │
  ├── Choose timing
  │   ├── ส่งทันที
  │   ├── ตั้งเวลาส่ง (pick date/time)
  │   └── ส่งซ้ำ (set recurrence)
  │
  ├── [Save as draft] ──► /admin/announcements (status: draft)
  │
  ├── [Send now] ──► Edge fn: send-broadcast
  │   │               │
  │   │               ├── LINE Messaging API → push to students
  │   │               ├── Create in-app notifications
  │   │               └── Update status: sent
  │   │
  │   └──► /admin/announcements (status: sent ✅)
  │
  └── [Schedule] ──► /admin/announcements (status: scheduled)
                      │
                      └── Cron: process-scheduled-broadcasts
                          └── When due → send-broadcast (same as above)
```

### 4.4 Admin Staff Login Flow

```
/login (admin view)
  │
  ├── Enter email + password
  ├── Tap "เข้าสู่ระบบ"
  │
  ▼
Supabase Auth (email/password)
  │
  ├── Check role in profiles table
  │
  ├── role ∈ {admin, head} ──► /admin/dashboard
  ├── role = committee ──────► /admin/dashboard (limited features)
  └── role = student ────────► /dashboard (student view)
```

---

## 5. Content Model

### 5.1 Content Types & Relationships

```
┌────────────────────────────────────────────────────────┐
│                    CONTENT MODEL                        │
│                                                         │
│  ┌─────────┐     authored by     ┌──────────────┐     │
│  │ Profile  │◄────────────────────│ Announcement │     │
│  │          │                     │              │     │
│  │ name     │  ┌─────────────┐   │ title        │     │
│  │ role     │  │ Tag         │   │ content      │     │
│  │ room     │  │             │   │ flex_json    │     │
│  │ line_uid │  │ name        │   │ target_tags[]│     │
│  │ tags[]   │──│ color       │──►│ schedule     │     │
│  │          │  │ description │   │ status       │     │
│  └────┬─────┘  └─────────────┘   └──────┬───────┘     │
│       │                                  │             │
│       │ submits                uses template            │
│       │                                  │             │
│       ▼                                  ▼             │
│  ┌──────────────┐          ┌─────────────────────┐    │
│  │ Maintenance  │          │ Message Template     │    │
│  │ Request      │          │                      │    │
│  │              │          │ name                  │    │
│  │ category     │          │ category              │    │
│  │ description  │          │ content               │    │
│  │ photos[]     │          │ flex_json              │    │
│  │ status       │          └─────────────────────┘    │
│  │ admin_notes  │                                     │
│  └──────┬───────┘                                     │
│         │                                              │
│         │ triggers                                     │
│         ▼                                              │
│  ┌──────────────┐                                     │
│  │ Notification │                                     │
│  │              │                                     │
│  │ type         │                                     │
│  │ title        │                                     │
│  │ body         │                                     │
│  │ is_read      │                                     │
│  └──────────────┘                                     │
└────────────────────────────────────────────────────────┘
```

### 5.2 Content per Page Summary

| Page | Primary Content | Data Source | Realtime |
|------|----------------|-------------|----------|
| Student Dashboard | Stats, quick actions, pinned announcements | profiles, announcements | No |
| Maintenance List | Own requests | maintenance_requests (filtered by user) | Yes |
| Maintenance Detail | Single request + status timeline | maintenance_requests[id] | Yes |
| Maintenance Form | Form (category, description, photos) | Local form state → insert | No |
| Announcements List | Published announcements | announcements (published) | No |
| Announcement Detail | Single announcement | announcements[id] | No |
| Profile | Own profile + dorm card | profiles[me] | No |
| Notifications | Own notifications | notifications (filtered by user) | Yes |
| Admin Dashboard | Aggregate stats + recent items | profiles, maintenance, announcements | Yes |
| Admin Maintenance | All tickets (Kanban/list) | maintenance_requests (all) | Yes |
| Admin Students | Student directory | profiles (role=student) | No |
| Admin Announcements | All announcements | announcements (all statuses) | No |
| Admin Announcement Editor | Form + Flex editor | Local form state → upsert | No |
| Admin Broadcast | Templates + broadcast history | message_templates, announcements | No |
| Admin Settings | Config values | localStorage + Supabase | No |

---

## 6. Access Control Matrix

```
                    Public  Student  Committee  Admin  Head
                    ──────  ───────  ─────────  ─────  ────
/login               ✅      —        —          —      —
/register            ✅      —        —          —      —
/onboarding          —       ✅       —          —      —
/dashboard           —       ✅       ✅         —      —
/maintenance         —       ✅(own)  ✅(own)    —      —
/maintenance/new     —       ✅       ✅         —      —
/maintenance/[id]    —       ✅(own)  ✅(own)    —      —
/announcements       —       ✅       ✅         —      —
/announcements/[id]  —       ✅       ✅         —      —
/profile             —       ✅       ✅         —      —
/notifications       —       ✅       ✅         —      —
/admin/dashboard     —       —        🔸(view)   ✅     ✅
/admin/maintenance   —       —        🔸(view)   ✅     ✅
/admin/students      —       —        🔸(view)   ✅     ✅
/admin/announcements —       —        🔸(create) ✅     ✅
/admin/broadcast     —       —        —          ✅     ✅
/admin/settings      —       —        —          —      ✅

✅ = full access
🔸 = limited access (see note)
— = no access / not applicable
```

---

## 7. URL Scheme Reference

All URLs are prefixed with `/{locale}/` (e.g., `/th/` or `/en/`).

### Student URLs
| URL Pattern | Page | Dynamic Params |
|-------------|------|----------------|
| `/{locale}/login` | Login | — |
| `/{locale}/register` | Register | — |
| `/{locale}/onboarding` | Onboarding | — |
| `/{locale}/dashboard` | Dashboard | — |
| `/{locale}/maintenance` | Maintenance List | — |
| `/{locale}/maintenance/new` | New Request | — |
| `/{locale}/maintenance/{id}` | Request Detail | `id` = UUID |
| `/{locale}/announcements` | Announcements | — |
| `/{locale}/announcements/{id}` | Announcement Detail | `id` = UUID |
| `/{locale}/profile` | Profile | — |
| `/{locale}/notifications` | Notifications | — |

### Admin URLs
| URL Pattern | Page | Dynamic Params |
|-------------|------|----------------|
| `/{locale}/admin/dashboard` | Admin Dashboard | — |
| `/{locale}/admin/maintenance` | Ticket Management | — |
| `/{locale}/admin/maintenance/{id}` | Ticket Detail | `id` = UUID |
| `/{locale}/admin/students` | Student Directory | — |
| `/{locale}/admin/students/{id}` | Student Detail | `id` = UUID |
| `/{locale}/admin/announcements` | Announcements Mgmt | — |
| `/{locale}/admin/announcements/new` | Create Announcement | — |
| `/{locale}/admin/announcements/{id}` | Edit Announcement | `id` = UUID |
| `/{locale}/admin/broadcast` | Broadcast & Templates | — |
| `/{locale}/admin/settings` | Settings | — |

### API URLs (no locale prefix)
| URL Pattern | Method | Purpose |
|-------------|--------|---------|
| `/api/auth/line` | GET | Redirect to LINE OAuth |
| `/api/auth/callback` | GET | Handle LINE callback |
| `/api/auth/logout` | POST | Clear session |
| `/liff` | GET | LINE LIFF entry point |
