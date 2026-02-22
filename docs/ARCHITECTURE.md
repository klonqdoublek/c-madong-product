# C-Madong System Architecture

> **Version**: 1.1
> **Last Updated**: 2026-02-14
> **Changelog**: See [CHANGELOG-v1.1.md](./CHANGELOG-v1.1.md)

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌─────────────────────┐        ┌──────────────────────────┐    │
│  │   Student App        │        │   Admin Portal            │    │
│  │   (Mobile-first)     │        │   (Desktop + Mobile)      │    │
│  │                      │        │                            │    │
│  │  • LINE Login        │        │  • Email/Password Login    │    │
│  │  • Dashboard         │        │  • Dashboard & Analytics   │    │
│  │  • แจ้งซ่อม          │        │  • Student Management     │    │
│  │  • ประกาศ            │        │  • Ticket Kanban Board    │    │
│  │  • บัตรหอพัก         │        │  • Announcement Broadcast │    │
│  │  • แจ้งเตือน         │        │  • Template Library       │    │
│  └──────────┬──────────┘        └────────────┬─────────────┘    │
│             │                                 │                  │
│             │    Next.js 16 (App Router)       │                  │
│             │    Unified Codebase              │                  │
│             └────────────┬────────────────────┘                  │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                    PLATFORM LAYER                                │
│                          │                                       │
│  ┌───────────┐   ┌──────┴──────┐   ┌──────────────────────┐    │
│  │   Vercel   │   │  Supabase   │   │   LINE Platform       │    │
│  │            │   │             │   │                        │    │
│  │  Hosting   │   │  Auth       │   │  LINE Login (OAuth)   │    │
│  │  SSR/SSG   │   │  Database   │   │  Messaging API        │    │
│  │  CDN       │   │  Realtime   │   │  LIFF SDK             │    │
│  │  Edge      │   │  Storage    │   │  Webhook              │    │
│  │            │   │  Functions  │   │                        │    │
│  └───────────┘   └─────────────┘   └──────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | Framework (App Router, SSR, API routes) |
| React | 19 | UI library |
| TypeScript | 5.9 | Type safety (strict mode) |
| Tailwind CSS | v4 | Styling (OKLCH color system) |
| shadcn/ui | new-york | Component library |
| next-intl | v4 | Internationalization (Thai/English) |
| Zustand | 5 | Client state management |
| TanStack Query | 5 | Server state & caching |
| React Hook Form | 7 | Form management |
| Zod | v4 | Schema validation |
| Framer Motion | 12 | Animations |
| Lucide React | 0.563 | Icons |

### 2.2 Route Architecture

```
src/app/
├── layout.tsx                    # Root: metadata, fonts
├── globals.css                   # Tailwind v4 theme (OKLCH)
│
├── [locale]/                     # i18n dynamic segment (th | en)
│   ├── layout.tsx                # Providers + NextIntlClientProvider
│   ├── page.tsx                  # Redirect → /login
│   │
│   ├── (auth)/                   # Route group — no URL segment
│   │   ├── layout.tsx            # Centered card layout
│   │   ├── login/page.tsx        # LINE Login
│   │   ├── register/page.tsx     # CUNET registration
│   │   └── onboarding/page.tsx   # Multi-step setup
│   │
│   ├── (student)/                # Route group — no URL segment
│   │   ├── layout.tsx            # StudentShell (Header + BottomNav)
│   │   ├── dashboard/page.tsx
│   │   ├── maintenance/
│   │   │   ├── page.tsx          # Request list
│   │   │   ├── new/page.tsx      # Submit form
│   │   │   └── [id]/page.tsx     # Detail view
│   │   ├── announcements/
│   │   │   ├── page.tsx          # List
│   │   │   └── [id]/page.tsx     # Detail
│   │   ├── profile/page.tsx      # Digital dorm card
│   │   └── notifications/page.tsx
│   │
│   └── admin/                    # URL segment (NOT route group)
│       ├── layout.tsx            # AdminShell (Sidebar)
│       ├── dashboard/page.tsx
│       ├── maintenance/
│       │   ├── page.tsx          # Kanban + list views
│       │   └── [id]/page.tsx     # Ticket management
│       ├── students/
│       │   ├── page.tsx          # Directory
│       │   └── [id]/page.tsx     # Student detail
│       ├── announcements/
│       │   ├── page.tsx          # List
│       │   ├── new/page.tsx      # Editor
│       │   └── [id]/page.tsx     # Edit
│       ├── broadcast/page.tsx    # Broadcast dashboard
│       └── settings/page.tsx
│
└── liff/page.tsx                 # LINE LIFF entry point
```

### 2.3 Why Admin Uses URL Segment (Not Route Group)

```
# Problem: Route group conflict
(student)/dashboard/page.tsx  →  /th/dashboard  ✅
(admin)/dashboard/page.tsx    →  /th/dashboard  ❌ CONFLICT!

# Solution: Admin uses URL segment
(student)/dashboard/page.tsx  →  /th/dashboard        ✅
admin/dashboard/page.tsx      →  /th/admin/dashboard   ✅ No conflict
```

### 2.4 Page Component Pattern

ทุก page ใช้รูปแบบเดียวกัน: async page component + sync content component

```typescript
// page.tsx (Server Component — async)
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PageContent />;
}

// Within same file or separate (Client Component — sync)
function PageContent() {
  const t = useTranslations('namespace');
  // hooks, state, JSX...
}
```

### 2.5 Component Hierarchy

```
src/components/
├── layout/
│   ├── header.tsx          # Logo + notification bell (unread badge)
│   ├── bottom-nav.tsx      # Mobile: 4 tabs (Home, แจ้งซ่อม, ประกาศ, โปรไฟล์)
│   ├── student-shell.tsx   # Header + main content + BottomNav
│   └── admin-shell.tsx     # Sidebar nav + responsive mobile menu
│
└── ui/                     # shadcn/ui (new-york style)
    ├── button, card, badge, input, label, separator
    └── (add more via: npx shadcn@latest add [component])
```

**Components to port from Lovable admin portal** (chula-dorm-connect):
- `FlexMessageEditor` — LINE Flex message visual builder
- `FlexMessagePreview` — Flex message renderer
- `AIWritingAssistant` — AI Thai copy generation
- `RecurringScheduleConfig` — Recurring schedule picker
- `TicketDetailModal` — Maintenance ticket editor
- `ImageUploader` — Image upload component

---

## 3. State Management

### 3.1 Architecture

```
┌─────────────────────────────────────────────┐
│              State Architecture              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Server State                  │   │
│  │         (TanStack Query)              │   │
│  │                                       │   │
│  │  • Database queries (profiles,        │   │
│  │    announcements, tickets, etc.)      │   │
│  │  • Caching (60s stale time)           │   │
│  │  • Auto-refetch on window focus       │   │
│  │  • Optimistic updates                 │   │
│  │  • 1 retry on failure                 │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Client State                  │   │
│  │         (Zustand Stores)              │   │
│  │                                       │   │
│  │  • user-store: profile, isAdmin()     │   │
│  │  • notification-store: unreadCount    │   │
│  │  • ui-store: sidebarOpen              │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Real-time State               │   │
│  │         (Supabase Subscriptions)      │   │
│  │                                       │   │
│  │  • postgres_changes on tables         │   │
│  │  • Auto-invalidate TanStack queries   │   │
│  │  • useRealtime() hook                 │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Form State                    │   │
│  │         (React Hook Form + Zod)       │   │
│  │                                       │   │
│  │  • Scoped to individual forms         │   │
│  │  • Zod v4 schema validation           │   │
│  │  • import { z } from "zod/v4"         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 3.2 Zustand Store Design

```typescript
// user-store.ts
interface UserState {
  profile: Profile | null
  isLoading: boolean
  setProfile: (profile) => void
  isAdmin: () => boolean  // role === "admin" || "head"
}

// notification-store.ts
interface NotificationState {
  unreadCount: number
  increment: () => void
  decrement: () => void  // min 0
}

// ui-store.ts
interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}
```

---

## 4. Backend Architecture (Supabase)

### 4.1 Overview

```
Supabase Project
├── Authentication
│   ├── LINE OAuth (students)
│   └── Email/Password (staff)
│
├── PostgreSQL Database
│   ├── profiles              # All users (students + staff), includes LINE UID
│   ├── buildings
│   ├── rooms
│   ├── beds
│   ├── maintenance_requests
│   ├── announcements         # Extended with flex_json, scheduling
│   ├── notifications
│   ├── message_templates     # New (from Lovable)
│   └── tags                  # New (from Lovable)
│
├── Real-time
│   ├── maintenance_requests changes
│   ├── announcements changes
│   └── notifications changes
│
├── Edge Functions (Deno)
│   ├── send-broadcast
│   ├── line-webhook
│   ├── send-repair-notification
│   ├── process-scheduled-broadcasts
│   ├── sync-line-followers
│   ├── generate-copy
│   └── generate-image
│
└── Storage
    ├── avatars/         # Profile pictures
    ├── maintenance/     # Maintenance request photos
    └── announcements/   # Announcement images
```

### 4.2 Database Schema

#### Entity Relationship

> Note: Lovable's `students` table is **merged into `profiles`** — no separate students table exists after integration. The `profiles` table handles both students and staff via the `role` field, and includes `line_uid` for LINE linking.

```
buildings ──< rooms ──< beds
                          │
profiles ─────────────────┘ (bed_id)
    │
    ├──< maintenance_requests (requester_id)
    ├──< announcements (author_id)
    └──< notifications (user_id)

tags ──>< profiles (tags[])             # Array-based many-to-many
tags ──>< announcements (target_tags[])

message_templates (standalone, created_by FK → profiles)
```

#### Unified Database Schema (after Lovable integration)

```sql
-- Core building hierarchy
buildings (id, name_th, name_en, floors, created_at)
rooms     (id, building_id FK, floor, room_number, capacity, created_at)
beds      (id, room_id FK, bed_label, is_occupied, created_at)

-- User profiles (merged: c-madong profiles + Lovable students)
-- Lovable's `students` table is NOT separate — all user data lives here
profiles (
  id, student_id, full_name_th, full_name_en, email, phone,
  line_uid, display_name,                              -- LINE linking (from Lovable)
  avatar_url, role [student|committee|admin|head],
  building_id FK, room_id FK, bed_id FK,
  move_in_date, language, tags[],                      -- tags for targeting (from Lovable)
  status [active|inactive],                            -- from Lovable
  created_at, updated_at
)

-- Maintenance (unified status enum)
maintenance_requests (
  id, requester_id FK→profiles, category, title, description,
  photos[], status [pending|acknowledged|in_progress|completed|cancelled|failed],
  assigned_to, appointment_date, appointment_time,
  failure_reason,                                      -- required if status=failed (from Lovable)
  admin_notes,                                         -- internal notes (from Lovable)
  ai_category, ai_priority, created_at, updated_at
)

-- Announcements (extended with Lovable broadcasting fields)
announcements (
  id, title_th, title_en, content_th, content_en,
  message_type [text|flex],                            -- from Lovable
  flex_json JSONB,                                     -- LINE Flex message (from Lovable)
  cover_image, is_pinned,
  target_type [broadcast|targeted],                    -- from Lovable
  target_tags[],
  status [draft|scheduled|sent|failed],                -- from Lovable
  scheduled_at, expire_at,                             -- scheduling (from Lovable)
  sent_at,                                             -- from Lovable
  author_id FK→profiles, published_at, created_at, updated_at
)

-- Notifications
notifications (
  id, user_id FK→profiles, type [maintenance|announcement|bill|parcel|general],
  title_th, title_en, body_th, body_en,
  data JSONB, is_read, created_at
)

-- Message Templates (NEW — from Lovable)
message_templates (
  id, name, description, category,
  message_type [text|flex], content, flex_json JSONB,
  created_by FK→profiles, created_at, updated_at
)

-- Tags (NEW — from Lovable)
tags (
  id, name UNIQUE, description, color,
  created_at
)
```

#### Maintenance Status Enum (unified)

```
pending → acknowledged → in_progress → completed
                                     → cancelled (by student)
                                     → failed (by admin, requires failure_reason)
```

#### Schema Reconciliation Summary

| Lovable Table | Unified Table | What Changed |
|--------------|---------------|--------------|
| `students` | `profiles` | Merged — added `display_name`, `status` fields |
| `announcements` | `announcements` | Extended — added `message_type`, `flex_json`, `scheduled_at`, `expire_at`, `status`, `target_type`, `sent_at` |
| `message_templates` | `message_templates` | Added as new table |
| `tags` | `tags` | Added as new table |
| `maintenance_tickets` | `maintenance_requests` | Unified status enum, added `failure_reason`, `admin_notes` |

### 4.3 Row-Level Security (RLS)

```sql
-- Student: can only read/write own data
profiles:     SELECT/UPDATE WHERE auth.uid() = user_id
maintenance:  SELECT/INSERT WHERE requester_id = auth.uid()
notifications: SELECT/UPDATE WHERE user_id = auth.uid()
announcements: SELECT WHERE published_at IS NOT NULL

-- Admin: full access with role check
ALL TABLES:   SELECT/INSERT/UPDATE/DELETE
              WHERE get_user_role(auth.uid()) IN ('admin', 'head')

-- Committee: limited admin access
maintenance:  SELECT/UPDATE (status changes only)
announcements: SELECT/INSERT
```

### 4.4 Edge Functions

```
┌────────────────────────────────────────────────┐
│              Edge Functions (Deno)               │
│                                                  │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ send-broadcast    │  │ line-webhook         │  │
│  │                   │  │                      │  │
│  │ LINE Messaging    │  │ Receives LINE events │  │
│  │ API → broadcast   │  │ follow/unfollow      │  │
│  │ or targeted send  │  │ message events       │  │
│  └──────────────────┘  └─────────────────────┘  │
│                                                  │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ send-repair-     │  │ process-scheduled-   │  │
│  │ notification     │  │ broadcasts           │  │
│  │                   │  │                      │  │
│  │ Notify student   │  │ Cron: check due      │  │
│  │ on ticket change │  │ announcements & send  │  │
│  └──────────────────┘  └─────────────────────┘  │
│                                                  │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ sync-line-       │  │ generate-copy /      │  │
│  │ followers        │  │ generate-image       │  │
│  │                   │  │                      │  │
│  │ Sync LINE bot    │  │ AI text/image gen    │  │
│  │ follower list    │  │ for announcements    │  │
│  └──────────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## 5. Authentication & Authorization

### 5.1 Auth Flow (LINE Login — Custom Implementation)

> LINE is **not** a built-in Supabase OAuth provider. We implement a custom flow
> using Next.js API routes that exchanges LINE tokens and creates a Supabase
> session via the Admin SDK.

```
┌──────────┐      ┌──────────────┐      ┌──────────┐      ┌──────────┐
│  Student  │      │  Next.js API │      │ LINE API │      │ Supabase │
│  Browser  │      │  Routes      │      │          │      │          │
└────┬─────┘      └──────┬───────┘      └────┬─────┘      └────┬─────┘
     │                    │                   │                  │
     │ 1. Click LINE Login│                   │                  │
     │ ──────────────────>│                   │                  │
     │                    │                   │                  │
     │ 2. Redirect to     │                   │                  │
     │    LINE consent    │                   │                  │
     │<───────────────────│                   │                  │
     │                    │                   │                  │
     │ 3. User approves,  │                   │                  │
     │    redirect back   │                   │                  │
     │    with auth code  │                   │                  │
     │ ──────────────────>│                   │                  │
     │   /api/auth/       │                   │                  │
     │   callback?code=X  │                   │                  │
     │                    │ 4. Exchange code   │                  │
     │                    │   for access token │                  │
     │                    │ ─────────────────>│                  │
     │                    │                   │                  │
     │                    │ 5. Get LINE profile│                  │
     │                    │   (user_id, name)  │                  │
     │                    │ <─────────────────│                  │
     │                    │                   │                  │
     │                    │ 6. Find or create Supabase user      │
     │                    │   via Admin SDK (signUp / getUserBy)  │
     │                    │ ────────────────────────────────────>│
     │                    │                   │                  │
     │                    │ 7. Create session  │                  │
     │                    │   (set cookies)    │                  │
     │                    │ <────────────────────────────────────│
     │                    │                   │                  │
     │ 8. Set session     │                   │                  │
     │    cookies &       │                   │                  │
     │    redirect        │                   │                  │
     │<───────────────────│                   │                  │
     │                    │                   │                  │
     │ 9a. Has profile → /dashboard                              │
     │ 9b. No profile → /register → /onboarding                 │
```

**API Routes Required:**
- `GET /api/auth/line` — Redirect to LINE OAuth consent screen
- `GET /api/auth/callback` — Handle LINE callback, exchange code, create session
- `POST /api/auth/logout` — Clear session cookies

### 5.2 Role-Based Access

```
┌───────────────────────────────────────────────────────┐
│                   Role Hierarchy                       │
│                                                        │
│   head (หัวหน้าหอพัก)                                  │
│   └── admin (ผู้ดูแล/เจ้าหน้าที่)                      │
│       └── committee (กรรมการหอพัก)                      │
│           └── student (นิสิต)                           │
│                                                        │
│   Permissions:                                         │
│   ┌──────────┬─────────┬───────────┬─────────────────┐│
│   │ Feature  │ Student │ Committee │ Admin/Head      ││
│   ├──────────┼─────────┼───────────┼─────────────────┤│
│   │ Dashboard│ Student │ Student   │ Admin dashboard ││
│   │ Profile  │ Own     │ Own       │ All students    ││
│   │ แจ้งซ่อม │ Create  │ View all  │ Manage all      ││
│   │ ประกาศ   │ Read    │ Create    │ Create+Broadcast││
│   │ Students │ —       │ View      │ Full CRUD       ││
│   │ Settings │ —       │ —         │ Full access     ││
│   └──────────┴─────────┴───────────┴─────────────────┘│
└───────────────────────────────────────────────────────┘
```

### 5.3 Middleware Pipeline

```
Request
  │
  ├── next-intl middleware (locale detection & routing)
  │     └── /th/*, /en/* → set locale
  │
  ├── Supabase session refresh (update cookies)
  │
  ├── Auth check
  │     ├── Public routes: /login, /register → allow
  │     ├── No session → redirect /login
  │     └── Has session → continue
  │
  └── Role gating
        ├── /admin/* → check role ∈ {admin, head}
        ├── /(student)/* → check role ∈ {student, committee, admin, head}
        └── Unauthorized → redirect /dashboard (or /admin/dashboard)
```

---

## 6. Internationalization (i18n)

### 6.1 Architecture

```
src/
├── i18n/
│   ├── config.ts         # locales: ["th", "en"], default: "th"
│   ├── routing.ts        # next-intl routing config
│   ├── request.ts        # getRequestConfig — loads messages
│   └── navigation.ts     # Link, redirect, usePathname, useRouter
│
├── messages/
│   ├── th.json           # Thai translations (86+ keys)
│   └── en.json           # English translations
│
└── middleware.ts          # Locale detection & URL rewriting
```

### 6.2 URL Structure

```
/th/login              ← Thai (default)
/en/login              ← English
/th/dashboard          ← Student dashboard (Thai)
/th/admin/dashboard    ← Admin dashboard (Thai)
/en/admin/dashboard    ← Admin dashboard (English)
```

### 6.3 Usage Pattern

```typescript
// Server Component
import { setRequestLocale } from 'next-intl/server';

// Client Component
import { useTranslations } from 'next-intl';
const t = useTranslations('maintenance');
// t('title') → "แจ้งซ่อม" (th) or "Maintenance" (en)
```

---

## 7. LINE Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    LINE Platform                          │
│                                                           │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ LINE App  │    │ Messaging API │    │ LIFF Platform  │  │
│  │           │    │               │    │                │  │
│  │ • Login   │    │ • Push msg    │    │ • Mini app     │  │
│  │ • Chat    │    │ • Broadcast   │    │ • Auto-login   │  │
│  │ • LIFF    │    │ • Flex msg    │    │ • Deep link    │  │
│  └─────┬────┘    └───────┬───────┘    └───────┬────────┘  │
│        │                 │                     │           │
└────────┼─────────────────┼─────────────────────┼───────────┘
         │                 │                     │
    ┌────┴────┐      ┌────┴─────┐         ┌────┴────┐
    │  OAuth  │      │ Webhook  │         │  LIFF   │
    │  Flow   │      │ Handler  │         │  App    │
    │         │      │          │         │         │
    │ /api/   │      │ Edge fn: │         │ /liff   │
    │ auth/   │      │ line-    │         │         │
    │ line    │      │ webhook  │         │         │
    └─────────┘      └──────────┘         └─────────┘
```

### 7.1 Flex Message Flow

```
Admin creates announcement
  │
  ├── FlexMessageEditor (visual builder)
  │     └── Choose template / custom build
  │
  ├── FlexMessagePreview (live preview)
  │     └── Verify look & feel
  │
  ├── Select target (broadcast or tags)
  │
  ├── Schedule or send immediately
  │
  └── Edge Function: send-broadcast
        ├── Query students by tags (if targeted)
        ├── Construct LINE API payload
        ├── POST to LINE Messaging API
        └── Update announcement status (sent/failed)
```

---

## 8. Data Flow

### 8.1 Maintenance Request Flow

```
Student                    System                      Admin
  │                          │                           │
  │  1. Submit request       │                           │
  │─────────────────────────>│                           │
  │                          │  2. Insert to DB          │
  │                          │  3. Realtime event        │
  │                          │──────────────────────────>│
  │                          │                           │
  │                          │  4. Admin updates status  │
  │                          │<──────────────────────────│
  │                          │                           │
  │                          │  5. Edge fn: notify       │
  │  6. LINE notification    │     student via LINE      │
  │<─────────────────────────│                           │
  │                          │                           │
  │  7. In-app notification  │                           │
  │<─────────────────────────│  (realtime subscription)  │
```

### 8.2 Announcement Broadcasting Flow

```
Admin                      System                    Students
  │                          │                           │
  │  1. Create announcement  │                           │
  │─────────────────────────>│                           │
  │     (content, flex_json, │                           │
  │      target, schedule)   │                           │
  │                          │                           │
  │  2a. Send now            │                           │
  │─────────────────────────>│  3. Edge fn:              │
  │                          │     send-broadcast        │
  │  2b. Schedule            │─────────────────────────>│
  │─────────────────────────>│     LINE Messaging API    │
  │     (cron picks up later)│                           │
  │                          │  4. Create notifications  │
  │                          │─────────────────────────>│
  │                          │     (in-app + LINE push)  │
```

---

## 9. Integration Plan: Lovable → c-madong-product

### 9.1 What Gets Ported

```
From chula-dorm-connect (Lovable)    →    Into c-madong-product
─────────────────────────────────         ─────────────────────
React Router pages                   →    Next.js App Router pages
                                          src/app/[locale]/admin/...

FlexMessageEditor component          →    src/components/admin/
FlexMessagePreview component               flex-message-editor.tsx
AIWritingAssistant component               flex-message-preview.tsx
RecurringScheduleConfig                    ai-writing-assistant.tsx
TicketDetailModal                          recurring-schedule.tsx
ImageUploader                              ticket-detail-modal.tsx
                                           image-uploader.tsx

Supabase Edge Functions              →    supabase/functions/ (as-is)

SQL Migrations                       →    supabase/migrations/ (reconciled)

Database types                       →    src/lib/supabase/types.ts (merged)
```

### 9.2 Key Adaptations

| Aspect | Lovable (current) | c-madong (target) |
|--------|-------------------|-------------------|
| Routing | `React Router 6` | `Next.js App Router` |
| i18n | Hardcoded Thai | `next-intl` with th.json/en.json |
| Supabase client | `@supabase/supabase-js` | `@supabase/ssr` (cookie-based) |
| Styling | Tailwind v3 | Tailwind v4 (OKLCH) |
| shadcn style | default | new-york |
| Auth | React Context | Supabase SSR + middleware |
| State | useState + Context | Zustand + TanStack Query |
| TypeScript | Relaxed | Strict mode |

### 9.3 Migration Steps

1. **Schema reconciliation** — Merge Lovable DB schema into c-madong types
2. **Add new tables** — `message_templates`, `tags` migrations
3. **Extend existing tables** — Add flex_json, scheduling fields to announcements
4. **Port components** — Adapt Lovable components to Next.js + Tailwind v4
5. **Extract i18n strings** — Move Thai strings to th.json / en.json
6. **Wire up state** — Replace useState/Context with Zustand + TanStack Query
7. **Copy Edge Functions** — Move to supabase/functions/ (minimal changes)
8. **Update RLS policies** — Proper role-based policies (not permissive)

---

## 10. Project Folder Structure (Unified)

```
c-madong-product/
├── src/
│   ├── app/
│   │   ├── api/                          # Next.js API routes
│   │   │   └── auth/
│   │   │       ├── line/route.ts         # Redirect to LINE OAuth
│   │   │       ├── callback/route.ts     # Handle LINE callback → Supabase session
│   │   │       └── logout/route.ts       # Clear session
│   │   ├── [locale]/                     # i18n pages (see Route Architecture)
│   │   └── liff/page.tsx                 # LINE LIFF entry
│   ├── components/
│   │   ├── layout/                       # Shell components
│   │   ├── ui/                           # shadcn/ui
│   │   └── admin/                        # Ported from Lovable
│   │       ├── flex-message-editor.tsx
│   │       ├── flex-message-preview.tsx
│   │       ├── ai-writing-assistant.tsx
│   │       ├── recurring-schedule.tsx
│   │       ├── ticket-detail-modal.tsx
│   │       └── image-uploader.tsx
│   ├── hooks/
│   ├── stores/
│   ├── providers/
│   ├── lib/
│   │   ├── supabase/                     # Client factories + types
│   │   ├── validators/                   # Zod schemas
│   │   └── utils/                        # Helpers (cn, date, constants)
│   ├── i18n/
│   └── messages/
│
├── supabase/                             # Supabase project config
│   ├── config.toml                       # Project settings
│   ├── migrations/                       # SQL migrations (sequential)
│   │   ├── 001_create_buildings_rooms_beds.sql
│   │   ├── 002_create_profiles.sql
│   │   ├── 003_create_maintenance_requests.sql
│   │   ├── 004_create_announcements.sql
│   │   ├── 005_create_notifications.sql
│   │   ├── 006_create_tags.sql
│   │   ├── 007_create_message_templates.sql
│   │   ├── 008_create_rls_policies.sql
│   │   ├── 009_create_indexes.sql
│   │   └── 010_create_realtime_triggers.sql
│   └── functions/                        # Edge Functions (Deno)
│       ├── send-broadcast/index.ts
│       ├── line-webhook/index.ts
│       ├── send-repair-notification/index.ts
│       ├── process-scheduled-broadcasts/index.ts
│       ├── sync-line-followers/index.ts
│       ├── generate-copy/index.ts
│       └── generate-image/index.ts
│
├── docs/                                 # Project documentation
├── public/                               # Static assets
└── config files                          # next.config, tsconfig, etc.
```

---

## 11. API Routes

```
src/app/api/
├── auth/
│   ├── line/route.ts          # GET → redirect to LINE OAuth consent
│   ├── callback/route.ts      # GET → exchange LINE code, create Supabase session
│   └── logout/route.ts        # POST → clear session cookies, redirect to /login
│
└── (future)
    ├── webhooks/
    │   └── line/route.ts      # POST → LINE webhook (alt to edge fn if needed)
    └── upload/
        └── route.ts           # POST → handle file uploads to Supabase Storage
```

**Route Handler Pattern:**
```typescript
// src/app/api/auth/line/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', process.env.LINE_CHANNEL_ID!);
  lineAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);
  lineAuthUrl.searchParams.set('scope', 'profile openid');
  lineAuthUrl.searchParams.set('state', crypto.randomUUID());
  return NextResponse.redirect(lineAuthUrl);
}
```

---

## 12. Deployment Architecture

```
┌────────────────────────────────────────────┐
│                 Vercel                       │
│                                              │
│  ┌────────────┐  ┌────────────────────────┐ │
│  │ Edge Network│  │ Serverless Functions    │ │
│  │ (CDN)       │  │ (API Routes, SSR)      │ │
│  │             │  │                         │ │
│  │ Static      │  │ /api/auth/line          │ │
│  │ assets,     │  │ /api/auth/callback      │ │
│  │ ISR pages   │  │ Server Components       │ │
│  └────────────┘  └────────────────────────┘ │
└──────────────────────┬─────────────────────┘
                       │
              ┌────────┴────────┐
              │    Supabase     │
              │                 │
              │  PostgreSQL     │
              │  Auth           │
              │  Realtime WS    │
              │  Edge Functions │
              │  Storage (S3)   │
              └─────────────────┘
```

### 10.1 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LINE
LINE_CHANNEL_ID=...
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LIFF_ID=...

# App
NEXT_PUBLIC_APP_URL=https://c-madong.vercel.app
```

---

## 13. Security Considerations

| Area | Approach |
|------|----------|
| Authentication | LINE OAuth (students) + Email/Password (staff) via Supabase Auth |
| Authorization | RLS policies per role; middleware route gating |
| Data validation | Zod schemas on client + server |
| XSS prevention | React auto-escaping + CSP headers |
| CSRF | Supabase session tokens (httpOnly cookies via @supabase/ssr) |
| File uploads | Supabase Storage with size limits + type validation |
| API keys | Server-side only (env vars), never in client bundle |
| Secrets | `.env.local` (gitignored), Vercel env vars for production |

---

## 14. Error Handling Strategy

### 14.1 Client-Side

```
┌─────────────────────────────────────────────┐
│            Error Handling Layers             │
│                                              │
│  1. React Error Boundaries                   │
│     └── Catch rendering errors per section   │
│         ├── Student layout boundary          │
│         ├── Admin layout boundary            │
│         └── Per-page boundaries (forms, etc) │
│                                              │
│  2. TanStack Query Error Handling            │
│     └── onError callbacks + retry logic      │
│         ├── 1 retry (default)                │
│         ├── Toast notification on failure    │
│         └── Redirect on 401 (unauthorized)   │
│                                              │
│  3. Form Validation (Zod)                    │
│     └── Field-level + form-level errors      │
│         └── Thai error messages via i18n     │
│                                              │
│  4. Toast Notifications (Sonner)             │
│     └── Success / error / info feedback      │
└─────────────────────────────────────────────┘
```

### 14.2 Server-Side

| Layer | Strategy |
|-------|----------|
| API Routes | try/catch with structured JSON error responses |
| Edge Functions | try/catch with Supabase function error logging |
| Middleware | Graceful fallback — redirect to login on auth errors |
| Database | RLS denials return empty results (not errors) |

### 14.3 Error Response Format

```typescript
// Consistent API error response
{
  error: {
    code: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL",
    message: string,       // Human-readable (Thai or English based on locale)
    details?: unknown      // Optional field-level errors
  }
}
```

---

## 15. Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Utility functions, Zod schemas, store logic |
| Component | Vitest + Testing Library | UI components, form behavior |
| Integration | Vitest | API routes, Supabase queries (with test DB) |
| E2E | Playwright (future) | Critical flows: login, submit request, send announcement |

### Test Organization

```
src/
├── __tests__/                # or colocated with source files
│   ├── lib/
│   │   ├── validators/
│   │   │   ├── auth.test.ts
│   │   │   └── maintenance.test.ts
│   │   └── utils/
│   │       └── date.test.ts
│   ├── stores/
│   │   └── user-store.test.ts
│   └── components/
│       └── layout/
│           └── bottom-nav.test.tsx
```

### Testing Priority

1. **Zod validators** — auth, maintenance schemas (pure logic, easy to test)
2. **Utility functions** — date formatting, Buddhist year conversion
3. **Zustand stores** — state transitions, isAdmin() logic
4. **API routes** — auth flow, error responses
5. **Critical UI flows** — login, maintenance form, announcement editor

---

## 16. Monitoring & Observability (Future)

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Web vitals, page views |
| Supabase Dashboard | DB queries, auth events, function logs |
| Sentry (planned) | Error tracking & alerting |
| LINE OA Manager | Message delivery stats |
