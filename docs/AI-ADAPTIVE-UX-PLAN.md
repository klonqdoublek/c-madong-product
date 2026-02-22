# AI Agentic Adaptive User Experience Layer

> **Status**: Draft (2026-02-16) — Pending review, NOT yet approved for implementation

## Context

โปรเจค C-Madong ต้องการสร้าง "AI Adaptive UX Layer" ที่วิเคราะห์ข้อมูลนิสิต (คะแนนหอพัก + กิจกรรม) แล้วแสดง UI แบบ Personalized ผ่าน AI ครอบคลุม 4 ด้าน: Dashboard insights, Smart notifications, Adaptive UX, และ AI chatbot ("น้องมาดอง")

Build บนทั้ง 2 projects: c-madong-product (student UI) + chula-dorm-connect (admin) ใช้ Supabase ร่วมกัน

---

## Phase A: Database Foundation

### New Tables (6 ตาราง)

**1. `score_categories`** — หมวดหมู่คะแนน
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name_th, name_en | text | ชื่อหมวดหมู่ |
| slug | text UNIQUE | e.g. `activity_participation` |
| description_th, description_en | text | |
| max_points_per_semester | int | เพดานคะแนนต่อเทอม |
| weight | numeric(3,2) | น้ำหนักในการคำนวณคะแนนรวม |
| icon | text | lucide icon name |
| color | text | hex color |

Seed 4 categories:
- `activity_participation` (การเข้าร่วมกิจกรรม, weight 0.40)
- `community_service` (จิตอาสา, weight 0.20)
- `rule_compliance` (ปฏิบัติตามกฎ, weight 0.25)
- `dorm_meeting` (เข้าร่วมประชุม, weight 0.15)

**2. `dorm_events`** — กิจกรรมหอพัก
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title_th, title_en | text | |
| description_th, description_en | text | |
| event_type | enum | meeting, sports, religious, safety_drill, social, community_service, workshop, other |
| event_status | enum | draft, published, ongoing, completed, cancelled |
| start_date, end_date | timestamptz | |
| location_th, location_en | text | |
| is_mandatory | boolean | |
| max_capacity | int | null = unlimited |
| score_points | int | คะแนนที่ได้รับเมื่อเข้าร่วม |
| score_category_id | uuid FK → score_categories | |
| penalty_points | int | คะแนนที่หักเมื่อขาด (mandatory events) |
| cover_image | text | |
| created_by | uuid FK → profiles | |
| building_id | uuid FK → buildings | null = all buildings |

**3. `event_attendance`** — การเข้าร่วมกิจกรรม
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| event_id | uuid FK → dorm_events | CASCADE |
| student_id | uuid FK → profiles | CASCADE |
| status | enum | registered, attended, absent, excused |
| checked_in_at, checked_out_at | timestamptz | |
| notes | text | |
| recorded_by | uuid FK → profiles | |
| UNIQUE(event_id, student_id) | | |

**4. `score_entries`** — รายการคะแนน
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK → profiles | CASCADE |
| category_id | uuid FK → score_categories | CASCADE |
| event_id | uuid FK → dorm_events | nullable, SET NULL |
| points | int | ได้ทั้งบวกและลบ |
| source | text | `event_attendance`, `manual_admin`, `university_import`, `auto_rule` |
| description_th, description_en | text | |
| academic_year | text | e.g. "2568" |
| semester | int | 1, 2, หรือ 3 (summer) |
| awarded_by | uuid FK → profiles | |

**5. `ai_insights`** — AI insights ที่ cache ไว้ต่อนิสิต
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK → profiles | CASCADE |
| type | enum | score_warning, activity_reminder, score_trend, recommendation, deadline_alert, achievement, general |
| priority | enum | low, medium, high, urgent |
| title_th, title_en | text | |
| body_th, body_en | text | |
| action_url | text | deep link e.g. `/activities/uuid` |
| action_label_th, action_label_en | text | |
| metadata | jsonb | flexible data |
| is_dismissed | boolean | |
| expires_at | timestamptz | |

**6. `ai_chat_messages`** — Chat history
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK → profiles | CASCADE |
| session_id | uuid | groups messages into conversations |
| role | enum | user, assistant, system |
| content | text | |
| metadata | jsonb | token usage etc. |

### DB Views & Functions

- **Materialized view `student_score_summary`**: Pre-aggregated scores per student/year/semester/category
- **Function `get_composite_score(student_id, year, semester)`**: Returns weighted composite score
- **Refresh**: pg_cron every 15 min via `REFRESH MATERIALIZED VIEW CONCURRENTLY`

### RLS Policies
- Students see own scores/attendance/insights/chat only
- Admin/head full access to all tables
- Published events visible to all authenticated users
- Students can register themselves for events

### Files to modify:
- `src/lib/supabase/types.ts` — Add all 6 new table types + new enums
- `src/lib/utils/constants.ts` — Add EVENT_TYPES, ATTENDANCE_STATUSES, SCORE_SOURCES

---

## Phase B: Seed Data (80 students, 25 events)

Create `scripts/generate-seed.ts` → outputs `supabase/seed.sql`

| Entity | Count |
|--------|-------|
| Buildings | 3 (หอพักพัฒนา 1-3) |
| Rooms | 60 (20/building, 4 floors) |
| Beds | 120 (2/room) |
| Students (profiles) | 80 (realistic Thai names, 67XXXXXXXX IDs) |
| Score Categories | 4 |
| Dorm Events | 25 (spread across 2 semesters) |
| Event Attendance | ~800 records |
| Score Entries | ~1200 records |
| AI Insights | ~160 (2/student pre-computed) |

**Score distribution**: 15% excellent (80-100), 35% good (60-79), 35% needs improvement (40-59), 15% at risk (0-39)

### Files to create:
- `scripts/generate-seed.ts`
- `supabase/seed.sql`

---

## Phase C: Score System + Events UI

### Student Pages (c-madong-product)

**New pages:**
- `src/app/[locale]/(student)/scores/page.tsx` — คะแนนหอพักของฉัน (breakdown chart + history)
- `src/app/[locale]/(student)/activities/page.tsx` — รายการกิจกรรม + ลงทะเบียน
- `src/app/[locale]/(student)/activities/[id]/page.tsx` — รายละเอียดกิจกรรม

**New components:**
- `src/components/scores/score-summary-card.tsx` — Donut chart + composite score
- `src/components/scores/score-breakdown.tsx` — Per-category progress bars
- `src/components/scores/score-history-chart.tsx` — Line chart (Recharts)
- `src/components/activities/event-card.tsx` — Event listing card
- `src/components/activities/event-detail.tsx` — Detail + register button
- `src/components/activities/attendance-badge.tsx` — Status badge

**New hooks** (follow `use-user.ts` pattern: TanStack Query + Supabase + Zustand sync):
- `src/hooks/use-scores.ts` — Query student_score_summary + get_composite_score
- `src/hooks/use-events.ts` — Query dorm_events + event_attendance

**New validator:**
- `src/lib/validators/activities.ts` — eventRegistration, scoreEntry schemas (Zod v4)

**i18n** — Add ~50 keys to `th.json`/`en.json`: `scores.*`, `activities.*`

### Admin Pages (c-madong-product)

**New pages:**
- `src/app/[locale]/admin/activities/page.tsx` — Event CRUD table
- `src/app/[locale]/admin/activities/new/page.tsx` — Create event form
- `src/app/[locale]/admin/activities/[id]/page.tsx` — Event detail + mark attendance
- `src/app/[locale]/admin/scores/page.tsx` — Score overview + manual adjust
- `src/app/[locale]/admin/scores/categories/page.tsx` — Category CRUD

**Modify:**
- `src/components/layout/admin-shell.tsx` — Add Activities + Scores nav items
- `src/components/layout/bottom-nav.tsx` — Consider adding Activities tab (or keep in dashboard)

---

## Phase D: Adaptive Dashboard

Replace current placeholder dashboard with personalized widget system.

### Architecture

```
AdaptiveDashboard
  ├── GreetingHeader (name + urgency-based styling)
  ├── ScoreSummaryCard (donut chart, color-coded border by urgency)
  ├── AIInsightsCard (dismissible insight cards, priority-sorted)
  ├── UpcomingEventsCard (next 3 events + register buttons)
  ├── QuickActionsGrid (existing, refactored to component)
  ├── MaintenanceStatusCard (active requests)
  └── AnnouncementsCard (pinned announcements)
```

**Urgency levels** (rule-based, no AI call):
- `critical` (score < 40 or urgent insights) → red border on score card, insights first
- `warning` (score < 60) → amber border, insights bumped up
- `excellent` (score >= 80) → green accent, achievement badges
- `normal` → standard blue theme

**Widget ordering**: Stored in `student_dashboard_config` table, default order with override per student. Urgency can auto-reorder (e.g. push insights to top when critical).

### New hooks:
- `src/hooks/use-ai-insights.ts` — Query active insights, dismiss mutation
- `src/hooks/use-dashboard-config.ts` — Query/update widget config

### Files to modify:
- `src/app/[locale]/(student)/dashboard/page.tsx` — Replace placeholder with AdaptiveDashboard

### New components:
- `src/components/dashboard/adaptive-dashboard.tsx`
- `src/components/dashboard/score-summary-card.tsx`
- `src/components/dashboard/ai-insights-card.tsx`
- `src/components/dashboard/upcoming-events-card.tsx`
- `src/components/dashboard/quick-actions-grid.tsx`
- `src/components/dashboard/maintenance-status-card.tsx`
- `src/components/dashboard/announcements-card.tsx`

---

## Phase E: AI Backend

### API Routes (Next.js)

**`src/app/api/ai/chat/route.ts`** — Streaming chat
- Auth via Supabase server client (cookies)
- Fetch student context: profile, scores, upcoming events, insights, maintenance
- Build Thai system prompt with context ("น้องมาดอง")
- Stream via OpenAI `gpt-4o-mini` (fast, cheap, good Thai)
- Save messages to `ai_chat_messages`
- Rate limit: 20 msg/min/student

**`src/app/api/ai/insights/route.ts`** — Generate insights for single student
- Rule-based first (score < 60 → warning, mandatory event upcoming → reminder, score up 10+ → achievement)
- Call gpt-4o-mini for nuanced recommendations
- Upsert into `ai_insights` with 24h expiry

**`src/app/api/ai/insights/batch/route.ts`** — Batch for all students
- Triggered by cron (daily 6AM) or admin manual trigger
- Process all active students
- Cost: ~$0.006/day for 80 students

**System prompt for น้องมาดอง:**
```
คุณเป็น "น้องมาดอง" ผู้ช่วยอัจฉริยะของหอพักจุฬาฯ
ช่วยนิสิตเรื่องคะแนนหอพัก กิจกรรม แจ้งซ่อม ข่าวสาร
ตอบเป็นไทย สุภาพ เป็นกันเอง
ใช้ข้อมูลนิสิตที่ให้มาเท่านั้น ห้ามเดา
```

### Dependencies to install:
- `openai` npm package

### Files to create:
- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/insights/route.ts`
- `src/app/api/ai/insights/batch/route.ts`
- `src/lib/ai/prompts.ts` — System prompt templates
- `src/lib/ai/context-builder.ts` — Build student context for AI
- `src/lib/validators/ai.ts` — Chat message schema

---

## Phase F: AI Chat Widget ("น้องมาดอง")

### UI Architecture

```
StudentShell
  ├── Header
  ├── main content
  ├── ChatWidget (floating)           ← NEW
  │   ├── ChatFAB (bottom-right, above BottomNav)
  │   └── ChatDrawer (slide-up panel)
  │       ├── ChatHeader ("น้องมาดอง" + close)
  │       ├── ChatMessageList (scrollable)
  │       │   └── ChatMessage (user/assistant bubbles)
  │       ├── ChatSuggestions (context-aware chips)
  │       └── ChatInput (text + send)
  └── BottomNav
```

- Mobile: slide-up drawer (full width, 80vh)
- Desktop: side panel (400px wide, right side)
- Animate with framer-motion (already installed)
- Streaming: display text chunk-by-chunk as it arrives

**Context-aware suggestions:**
- Default: "คะแนนฉันเท่าไหร่", "กิจกรรมอะไรที่ต้องทำ"
- If score < 60: "ทำอย่างไรให้คะแนนดีขึ้น"
- If event upcoming: "เล่าเกี่ยวกับ {event_title}"

### New store:
- `src/stores/ai-store.ts` — chatOpen, sessionId, isStreaming

### New hook:
- `src/hooks/use-ai-chat.ts` — Messages state, sendMessage (streaming fetch), session management

### Files to modify:
- `src/components/layout/student-shell.tsx` — Add ChatWidget

### Files to create:
- `src/components/ai/chat-widget.tsx`
- `src/components/ai/chat-fab.tsx`
- `src/components/ai/chat-drawer.tsx`
- `src/components/ai/chat-message.tsx`
- `src/components/ai/chat-input.tsx`
- `src/components/ai/chat-suggestions.tsx`

### i18n keys to add:
```json
"ai": {
  "chatTitle": "น้องมาดอง",
  "chatSubtitle": "ผู้ช่วยอัจฉริยะหอพัก",
  "placeholder": "พิมพ์ข้อความ...",
  "thinking": "กำลังคิด...",
  "insights": "สิ่งที่ควรรู้",
  "dismiss": "ปิด"
}
```

---

## Phase G: Smart Notifications

- Add `activity` and `score` to `NotificationType` enum
- Supabase triggers:
  - When attendance marked → auto-create score_entries
  - When composite score drops below threshold → insert notification
  - When new event published → notify building students
- Prioritization: rule-based (mandatory events = urgent, score warnings = high) displayed sorted in notification page
- Real-time via existing `useRealtime` hook

### Files to modify:
- `src/lib/supabase/types.ts` — Extend NotificationType
- `src/app/[locale]/(student)/notifications/page.tsx` — Replace placeholder with prioritized list
- `src/stores/notification-store.ts` — May need priority tracking

---

## Phase H: Admin AI Dashboard (c-madong-product)

- `src/app/[locale]/admin/ai/page.tsx` — Insight analytics, batch regeneration trigger, chat usage metrics, at-risk student alerts
- This is lowest priority — can be deferred

---

## Dependency Graph

```
Phase A (DB) ─────────┬──→ Phase B (Seed) ──→ Phase C (UI) ──→ Phase D (Dashboard)
                      │
                      └──→ Phase E (AI Backend) ──→ Phase F (Chat Widget)
                                                ──→ Phase G (Notifications)
                                                ──→ Phase H (Admin AI)
```

**A + E can run in parallel.** Critical path: A → B → C → D for student UI, A → E → F for chat.

---

## Verification Plan

1. **Phase A**: Run migrations, check tables exist with `\dt` in Supabase SQL editor
2. **Phase B**: Run seed, verify 80 students + 25 events + scores in Supabase dashboard
3. **Phase C**: Navigate to `/th/scores` and `/th/activities`, verify data renders with Thai labels
4. **Phase D**: Load dashboard, verify widgets render with urgency colors matching test student's score level
5. **Phase E**: `curl -X POST /api/ai/chat` with test message, verify streaming Thai response
6. **Phase F**: Open chat widget on mobile, ask "คะแนนฉันเท่าไหร่", verify context-aware Thai answer
7. **Phase G**: Mark attendance in admin → verify notification appears in student's notification page
8. **Build**: `npm run build` passes with no TypeScript errors
