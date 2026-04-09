# C-Madong V1 — Feature Reference

> Quick reference guide สำหรับ features ทั้งหมดใน V1.0.0
> Last Updated: 2026-04-10

---

## 🎯 Core Features Overview

| Feature | Status | Pages | API Routes | LINE Integration |
|---------|--------|-------|------------|------------------|
| Authentication | ✅ DEPLOYED | 3 | 9 | LINE Login OAuth |
| Admin Dashboard | ✅ DEPLOYED | 15 | 20+ | — |
| Billing | ✅ DEPLOYED | 2 | 3 | Flex Bill Reminder |
| Parcels | ✅ DEPLOYED | 2 | 3 | Flex Notification + Carousel |
| Maintenance | ✅ DEPLOYED | 3 | 5 | 3 Flex Designs |
| Vision AI | ✅ DEPLOYED | — | 1 | Image Analysis |
| Student Scores | ✅ DEPLOYED | 2 | 3 | Flex Score Cards |
| Chatbot | ✅ DEPLOYED | 1 | 5 | Webhook + 7 Flex |
| Knowledge Base | ✅ DEPLOYED | 1 | 8 | — |
| Live Chat | ✅ DEPLOYED | 1 | 4 | Admin Notification |
| Announcements | ✅ DEPLOYED | 2 | 3 | — |
| Emergency | ✅ DEPLOYED | 1 | — | — |
| Profile | ✅ DEPLOYED | 3 | 2 | — |
| RBAC | ✅ DEPLOYED | 1 | 2 | — |
| LIFF | ⚠️ SCAFFOLDED | — | — | SDK Init Only |

**Total**: 14 feature modules · 36 pages · 60+ API routes · 17 LINE integrations

---

## 📱 Student Features (12 Modules)

### 1. Dashboard
**Path**: `/th` (root)
**Features**:
- Welcome card with personalized greeting
- Quick stats (bills, parcels, scores, events)
- AI-generated insights (personalized recommendations)
- Notification bell (real-time badge count)
- Bottom navigation (5 tabs)

**Components**:
- `dashboard-header.tsx` (with notification bell)
- `dashboard-welcome-card.tsx`
- `dashboard-stats.tsx`
- `dashboard-insights.tsx`
- `bottom-nav.tsx`

---

### 2. Billing
**Path**: `/th/billing`
**Features**:
- Current month bill overview (rent + utilities)
- Payment status badge (paid/overdue)
- Bill history table
- Payment due date countdown

**LINE Integration**:
- ✅ Flex bill reminder (hero banner design)
- Push notification 3 days before due date

**API**:
- `GET /api/student/bills` — fetch user bills

---

### 3. Parcels
**Path**: `/th/parcels`
**Features**:
- Parcel list (pending, ready, collected)
- Tracking number search
- Status badges with color coding
- Pickup confirmation

**LINE Integration**:
- ✅ Flex notification when parcel is ready (hero banner `Inbox.jpg`)
- Chatbot parcel carousel (tracking + history)

**Chatbot Commands**:
- "พัสดุของฉัน", "parcel", "ของฉัน" → parcel list
- "เช็คพัสดุ {tracking}" → status check

**API**:
- `GET /api/student/parcels` — fetch user parcels

---

### 4. Maintenance (Repair Requests)
**Path**: `/th/maintenance/new`, `/th/maintenance/[id]`
**Features**:
- Multi-step form (category → details → photos → review)
- Photo upload (max 5 images)
- Category picker (plumbing, electrical, aircon, furniture, pest, other)
- Urgency level selection
- Optional appointment booking (date + time)
- My requests list with status filters
- Request detail view
- Cancel request (pending/acknowledged only)

**AI Vision**:
- ✅ Automatic category detection from photos
- ✅ Urgency level suggestion
- ✅ Damage assessment
- Template matching (20 seeded templates)

**LINE Integration**:
- ✅ **Ticket Created** Flex (green header, ticket number, details, 3 actions)
- ✅ **Status Tracking** Flex (timeline with technician info)
- ✅ **Repair Done** Flex (completion badge, review CTA)
- Status update push notifications

**Chatbot Flow**:
1. User: "แจ้งซ่อม" → Guide message (must include details)
2. User: "แจ้งซ่อมเครื่องปรับอากาศเย็นไม่ดี" → Category confirmation
3. User: [Sends photo] → Vision analysis → Confirm card
4. User taps "ยืนยัน" → Ticket created → Booking CTA
5. User taps "นัดวันซ่อม" → Redirect to web booking form

**Postback Actions**:
- `repair_track` → Show timeline
- `repair_cancel_ticket` → Cancel request
- `repair_history` → Show 5 recent tickets

**API**:
- `POST /api/maintenance` — create request (with vision AI)
- `GET /api/student/maintenance/[id]` — fetch request details
- `POST /api/student/maintenance/[id]/cancel` — cancel request

---

### 5. Student Scores
**Path**: `/th/score`
**Features**:
- Total score with breakdown (mandatory, external, internal)
- Stacked bar chart (color-coded by category)
- Score history table
- Activity category badges

**LINE Integration**:
- ✅ Flex score card (event registration confirmation)

**API**:
- `GET /api/student/score` — fetch user scores

---

### 6. Events
**Path**: `/th/events`
**Features**:
- Event list with cover images
- Event detail (date, location, organizer, score points)
- Registration button
- My registrations view

**LINE Integration**:
- Chatbot events carousel
- Registration confirmation with score info

**Chatbot Commands**:
- "กิจกรรม", "events" → upcoming events carousel

**API**:
- `GET /api/events` — fetch events
- `POST /api/events/[id]/register` — register for event

---

### 7. Announcements
**Path**: `/th/announcements`, `/th/announcements/[id]`
**Features**:
- Announcement list (cover images, category badges)
- Category filter (general, maintenance, event, emergency)
- Announcement detail view
- Bookmark toggle (heart icon)
- Event registration button (if announcement type = event)
- Read tracking (auto-mark as read)
- Document attachments (downloadable PDFs)

**Profile Integration**:
- ✅ Saved announcements section (horizontal scroll)
- ✅ Show up to 10 bookmarked items
- ✅ "ดูทั้งหมด" link if more than 10

**Database**:
- `announcement_bookmarks` — user bookmarks
- `announcement_registrations` — event registrations
- `announcement_reads` — read tracking
- `announcement_documents` — PDF attachments

**API**:
- `GET /api/announcements` — fetch announcements
- `POST /api/announcements/[id]/bookmark` — toggle bookmark
- `POST /api/announcements/[id]/register` — register for event
- `POST /api/announcements/[id]/read` — mark as read

---

### 8. Emergency Contact
**Path**: `/th/emergency`
**Features**:
- Animated hero (concentric pulse circles + phone icon)
- Phone CTA (`tel:` link to main number)
- Draggable bottom sheet (collapsed 200px / expanded 60dvh)
- 5 category tabs:
  - 🏢 หอพัก (Building2 icon)
  - 🏥 โรงพยาบาล (Hospital icon)
  - 🛡️ รปภ. (ShieldCheck icon)
  - 🏛️ ภายในมหา'ลัย (Landmark icon)
  - 📍 ภายนอก (MapPin icon)
- 19 hardcoded mock contacts
- Pink call buttons with `tel:` links

**Design**:
- Hero: GPU-composited CSS pulse animation
- Bottom sheet: Touch/mouse drag, 50px snap threshold
- Tab switching: instant, no animation

**Components**:
- `emergency-content.tsx` — main content
- Bottom nav: "ฉุกเฉิน" button → `/emergency`

---

### 9. Notifications
**Path**: `/th/notifications`
**Features**:
- Notification list with type badges
- Priority indicators (high/medium/low)
- Read/unread status
- Date grouping (today, this week, older)
- Mark as read
- Delete notification

**Real-time**:
- TanStack Query with `refetchInterval: 3000` (polling)
- Notification bell badge updates

**Notification Types** (10):
- bill, parcel, maintenance, score, event, announcement, system, chat_escalation, insight, reminder

**API**:
- `GET /api/student/notifications` — fetch notifications
- `PATCH /api/student/notifications/[id]` — mark as read

---

### 10. Profile
**Path**: `/th/profile`, `/th/profile/settings`, `/th/profile/dorm-card`
**Features**:

#### Profile Main
- Avatar (Thai display name initials)
- Full name (Thai + English)
- Room + Building info
- Faculty badge
- Stats cards (days in dorm, events attended)
- Score summary (stacked bar, 3 categories)
- Saved announcements section (horizontal scroll)
- Settings link

#### Settings
- 3 grouped sections (General, Support, Permissions)
- 3 toggle switches (notifications, LINE push, data sharing) — local state
- Logout button

#### Digital ID Card
- Per-user PNG card image:
  - พิชญา พูลเพียร → `id-card-pitchaya.png`
  - Others → `id-card-example.png`
- Card display: -6deg rotation + pink blur shadow
- Fullscreen lightbox (90deg landscape, `w-[90vh]`)
- Action menu: report lost, view history

**Components** (8):
- `profile-content.tsx`
- `profile-info-card.tsx`
- `profile-stats-section.tsx`
- `profile-score-section.tsx`
- `profile-saved-section.tsx` (NEW)
- `settings-content.tsx`
- `settings-menu-item.tsx`
- `dorm-card-content.tsx`

**i18n**: 30+ keys in `profile` namespace

---

### 11. In-App Chatbot (น้องซีมะโด่ง)
**Path**: Chat modal (bottom sheet, opens from bottom nav)
**Features**:
- Chat interface (85vh bottom sheet)
- Drag-to-dismiss with visual handle
- Chat history with date grouping
- Clear session button
- Suggestion chips (empty state)
- Keyboard avoidance (`visualViewport` tracking)

**Chatbot Capabilities**:
- ✅ Chitchat (small talk, greetings)
- ✅ Knowledge Q&A (RAG with vector search)
- ✅ Parcel tracking
- ✅ Score check
- ✅ Event info
- ✅ Escalate to live chat ("คุยกับทีมงาน")
- ⚠️ Repair flow → redirects to LINE (requires photo upload)

**Escalation Flow**:
1. User: "ขอคุยกับคน", "ช่วยเหลือ", "talk to human"
2. Bot: "กำลังเชื่อมต่อ..." → Waiting screen (no input, cancel only)
3. Admin claims → Active chat
4. Admin replies → Student receives messages
5. End conversation → Return to AI

**API**:
- `POST /api/chat` — send message
- `GET /api/chat/history` — fetch history
- `POST /api/chat/escalate` — escalate to human
- `GET /api/chat/messages` — fetch escalation messages

**State**:
- `chat-store.ts` — modal open state
- `use-chat.ts` — TanStack Query hooks

---

### 12. Live Chat (Student Side)
**Path**: Triggered from in-app chat modal
**Features**:
- Waiting screen (loading spinner, cancel button)
- Active chat (text input enabled, admin name shown)
- Chat history (grouped by sender)
- End conversation button ("จบการสนทนา")
- Return to AI after close

**Real-time**:
- Polling (3s refetchInterval)
- Status check: waiting → active → closed

**Notifications**:
- In-app notification when admin replies
- LINE push notification (Flex message with LIFF CTA)

---

## 👨‍💼 Admin Features (15 Modules)

### 1. Admin Dashboard
**Path**: `/admin`
**Features**:
- Stats cards (students, active tickets, pending bills, parcels)
- Recent activity feed
- Quick actions

---

### 2. Students Management
**Path**: `/admin/students`
**Features**:
- Student list table (name, room, faculty, status)
- Search and filters
- Student detail view
- Edit student info
- Tag assignment

---

### 3. Billing Management
**Path**: `/admin/billing`
**Features**:
- Create bills (bulk or individual)
- Bill list table
- Payment status tracking
- Bill detail view
- Send bill reminders (LINE Flex)

**API**:
- `POST /api/admin/bills` — create bills
- `GET /api/admin/bills` — fetch bills

---

### 4. Parcel Management
**Path**: `/admin/parcels`
**Features**:
- Add new parcel
- Parcel list table
- Status update (pending → ready → collected)
- Tracking number assignment
- Send notifications (in-app + LINE)

**API**:
- `POST /api/admin/parcels` — create parcel
- `PATCH /api/admin/parcels/[id]` — update status

---

### 5. Maintenance Management
**Path**: `/admin/maintenance`, `/admin/maintenance/[id]`
**Features**:
- Ticket list with status filters
- Ticket detail view
- Assign technician
- Update status (pending → acknowledged → in_progress → completed)
- Add internal notes
- View AI analysis (category, urgency, confidence)
- View uploaded photos

**Auto Notifications**:
- ✅ In-app notification on status change
- ✅ LINE Flex message (3 designs based on status)

**API**:
- `GET /api/admin/maintenance` — fetch tickets (with permissions)
- `PATCH /api/admin/maintenance/[id]` — update ticket + notify

---

### 6. Vision AI (Admin View)
**Features**:
- View AI analysis results on tickets
- Template match info
- Confidence scores
- Provider used (OpenAI/Gemini/Keyword)
- Damage details JSON

**Settings**:
- Enable/disable vision analysis
- Confidence threshold adjustment (in AI Settings)

---

### 7. Student Scores Management
**Path**: `/admin/scores`
**Features**:
- Assign scores (student, category, points, reason)
- Score list table
- Bulk import (CSV)
- Score history view

**API**:
- `POST /api/admin/scores` — create score record
- `GET /api/admin/scores` — fetch scores

---

### 8. Events Management
**Path**: `/admin/events`
**Features**:
- Create event (title, description, date, location, score points)
- Event list table
- View registrations
- Close/open registration

---

### 9. Announcements Management
**Path**: `/admin/announcements`, `/admin/announcements/new`, `/admin/announcements/[id]`
**Features**:
- Create announcement (rich text editor)
- Upload cover image
- Category selection (general, maintenance, event, emergency)
- Target audience (all, specific buildings)
- Publish/draft status
- Schedule publishing (future date)
- Announcement list table
- Edit/delete announcement
- Attach documents (PDFs)
- View read counts
- View registrations (if type = event)

**Organize Page** (`/admin/announcements/organize`):
- Drag-and-drop reordering
- Pin to top
- Archive announcements

**Prototype Page** (`/admin/announcements/prototype`):
- Announcement prototype designs

**API**:
- `POST /api/admin/announcements` — create
- `GET /api/admin/announcements` — fetch all
- `PATCH /api/admin/announcements/[id]` — update
- `DELETE /api/admin/announcements/[id]` — delete

---

### 10. Knowledge Base
**Path**: `/admin/knowledge-base`
**Features**:
- 2-panel layout (sidebar + main content)
- Collapsible nested sidebar (280px ↔ 52px icon strip)
- Folder hierarchy (tree view with context menu)
- Folder CRUD (create, rename, move, delete)
- Document upload (PDF, TXT, MD)
- Document processing (text extraction + embedding)
- Document tags (many-to-many, 10 color presets)
- Tag CRUD (create, edit, delete)
- File table (checkbox selection, type badges, version, status)
- Bulk actions (move, delete, tag, reprocess)
- File detail view (preview + metadata)
- Per-document Q&A (RAG scoped to single doc)

**Database**:
- `documents` table with `folder_id`, `version`, `status`
- `knowledge_folders` table (hierarchical)
- `document_tags` table
- `document_tag_assignments` table (junction)

**API** (8 routes):
- `POST /api/admin/knowledge/folders` — create folder
- `GET /api/admin/knowledge/folders` — fetch folders
- `POST /api/admin/knowledge/tags` — create tag
- `GET /api/admin/knowledge/tags` — fetch tags
- `POST /api/admin/knowledge/upload` — upload document
- `GET /api/admin/knowledge/documents` — fetch documents
- `GET /api/admin/knowledge/documents/[id]` — fetch single
- `POST /api/admin/knowledge/documents/bulk` — bulk actions
- `POST /api/admin/knowledge/process` — process document
- `POST /api/admin/knowledge/query` — Q&A query

**Components** (14):
- `knowledge-sidebar.tsx`
- `folder-tree.tsx`
- `file-list.tsx`
- `file-table.tsx`
- `folder-view.tsx`
- `file-detail-view.tsx`
- `document-preview.tsx`
- `create-folder-dialog.tsx`
- `rename-folder-dialog.tsx`
- `delete-folder-dialog.tsx`
- `create-tag-dialog.tsx`
- `bulk-actions-dialog.tsx`
- `tag-assignment-dialog.tsx`
- `document-query-panel.tsx`

---

### 11. Live Chat Queue
**Path**: `/admin/live-chat`
**Features**:
- 2-panel layout (queue + conversation)
- Queue tabs (Active, History)
- Active chat list (waiting + claimed)
- Claim chat button
- Conversation view
- Text input for admin replies
- AI context card (conversation summary, suggested responses)
- Close & return to AI button
- Chat history archive (closed conversations)

**Notifications**:
- ✅ In-app notification when new escalation
- ✅ LINE push to all admins (Flex message)

**Database**:
- `chat_escalations` table (waiting → active → closed)
- `ai_chat_messages` with `sender_type` (ai/user/admin/system)

**API**:
- `GET /api/admin/live-chat` — fetch queue
- `POST /api/admin/live-chat/[id]/claim` — claim chat
- `POST /api/admin/live-chat/[id]/reply` — send message
- `POST /api/admin/live-chat/[id]/close` — close chat

**Components** (5):
- `queue-panel.tsx`
- `conversation-panel.tsx`
- `ai-context-card.tsx`
- `chat-message.tsx`
- `admin-input.tsx`

---

### 12. AI Settings
**Path**: `/admin/settings` (AI tab)
**Features**:
- Model selection (gpt-4o-mini / gpt-4o)
- Temperature slider (0.0 - 2.0)
- 3 temperature presets (Focused 0.3, Balanced 0.7, Creative 1.2)
- Response length (brief, standard, detailed)
- Vision AI toggle
- Vision confidence threshold slider (0.0 - 1.0)
- Tone presets (Professional, Friendly, Casual)
- Custom instructions textarea
- Live preview mini-chat
- Intent threshold slider (0.0 - 1.0)
- Auto-escalate toggle
- Escalation threshold slider (0.0 - 1.0)
- Mock AI cost dashboard (฿245.50/mo, breakdown by model, sparkline)
- Save button

**Dynamic System Prompt**:
- ✅ Tone applied to chatbot responses
- ✅ Custom instructions appended
- ✅ Profile context injected (name, room, building)

**Database**:
- `app_settings` table (key-value JSONB)
- Server-side cache (5 min TTL)

**API**:
- `GET /api/admin/settings` — fetch settings
- `POST /api/admin/settings` — save settings
- `POST /api/admin/settings/preview` — preview tone

**Components** (3):
- `ai-settings-section.tsx`
- `tone-settings-section.tsx`
- `ai-cost-section.tsx`

**State**:
- `use-ai-settings.ts` — TanStack Query hooks

---

### 13. Roles & Permissions (RBAC)
**Path**: `/admin/roles`
**Features**:
- Role list table (12 roles)
- Role assignment to users
- Building scope assignment
- Permission matrix view
- User list with assigned roles
- Remove role assignment

**Roles** (12):
- super_admin, admin_staff, dorm_manager, resident_assistant, technician, front_desk, accounting, security_guard, maintenance_supervisor, event_coordinator, student_affairs, cleaning_staff

**Permissions** (80+):
- Grouped by resource (students, bills, tickets, parcels, etc.)
- Actions: view, create, edit, delete, manage

**Admin Sidebar**:
- ✅ Permission-based filtering (items hidden if no permission)

**Legacy Mapping**:
- `profiles.role` "admin" → "super_admin"
- `profiles.role` "staff" → "admin_staff"

**API**:
- `GET /api/admin/roles` — fetch user roles
- `POST /api/admin/roles` — assign role
- `DELETE /api/admin/roles` — remove role

**State**:
- `use-permissions.ts` — permission checks
- `use-role-management.ts` — role CRUD

---

### 14. Broadcast
**Path**: `/admin/broadcast`
**Features**:
- Send LINE broadcast messages
- Target audience selection (all, specific building, specific floor)
- Message preview
- Flex message builder integration

---

### 15. Settings
**Path**: `/admin/settings`
**Features**:
- 5 tabs (General, AI, Notifications, Students, Technicians)
- General: dorm info, contact details
- AI: (see AI Settings above)
- Notifications: notification triggers, priority rules
- Students: student list, tag management
- Technicians: technician list, assignment rules

---

## 🤖 LINE Chatbot (น้องซีมะโด่ง)

### Webhook
**Endpoint**: `POST /api/chatbot`
**Events**: message, follow, postback

### Follow Event
- New user → Welcome bubble + default Menu A
- Registered user → Welcome back bubble + Menu B swap

### Message Event
**Intent Router** (8 handlers):
1. **Chitchat** — small talk, greetings, general conversation (GPT-4o-mini)
2. **Knowledge** — Q&A about dorm rules, policies, procedures (RAG)
3. **Repair** — maintenance request flow (category → photo → confirm → create)
4. **Parcel** — parcel tracking and history
5. **Score** — score check and breakdown
6. **Events** — upcoming events carousel
7. **Escalation** — escalate to live chat ("ขอคุยกับคน", "ช่วยเหลือ")
8. **Postback** — handle Flex button actions

### Session State
- `repair_collecting_category` — waiting for category confirmation
- `repair_collecting_photos` — waiting for photo upload
- `repair_confirming` — waiting for confirm/edit action
- `repair_editing` — user wants to edit details

### Postback Actions
- `repair_confirm` — create ticket
- `repair_edit` — edit description/urgency
- `repair_book` — redirect to booking page
- `repair_track` — show timeline
- `repair_cancel_ticket` — cancel request
- `repair_history` — show 5 recent tickets
- `parcel_track` — track parcel
- `event_register` — register for event

### Flex Messages (7 builders)
1. **Response** (`response.ts`) — generic text response with avatar
2. **Events** (`events.ts`) — upcoming events carousel (max 10)
3. **Parcel** (`parcel.ts`) — parcel tracking carousel
4. **Repair Confirm** (`repair-confirm.ts`) — repair confirmation card (hero banner `New_Request.jpg`)
5. **Repair Status** (`repair-status.ts`) — 2 designs (creating ticket + status tracking)
6. **Score** (`score.ts`) — score breakdown card
7. **Greeting Carousel** (`greeting-carousel.ts`) — welcome bubble + 6-bubble onboarding

### Quick Reply Menus
- **Menu A** (default): แจ้งซ่อม, พัสดุ, คะแนน, กิจกรรม, ถาม/ตอบ
- **Menu B** (registered): แจ้งซ่อม, พัสดุ, คะแนน, กิจกรรม, คุยกับทีมงาน, เว็บไซต์

### Keywords
**Repair**:
- Triggers: "แจ้งซ่อม", "ซ่อม", "repair", "broken", "fix"
- Guide triggers: "แจ้งซ่อม" (only) → guide message
- Status check: "ติดตามสถานะ", "เช็คสถานะ", "track", "status"

**Parcel**:
- "พัสดุ", "parcel", "ของฉัน", "เช็คพัสดุ"

**Score**:
- "คะแนน", "score", "แต้ม"

**Events**:
- "กิจกรรม", "events", "งาน"

**Escalation**:
- "ขอคุยกับคน", "ช่วยเหลือ", "talk to human", "คุยกับทีมงาน"

**Guide**:
- "ดูคู่มือการใช้งานน้องซีมะโด่ง", "ดูคู่มือ", "คู่มือการใช้งาน"

---

## 🗄️ Database Schema (V1)

### Auth & Users (5 tables)
- `profiles` — user profiles (24 columns)
- `user_roles` — RBAC role assignments
- `buildings` — 5 buildings (ชวนชม, รุ่งนภา, พรประภา, ชีพประภา, เพชรประภา)
- `rooms` — 680 rooms (5 buildings × 17 floors × 8 rooms)
- `beds` — 2,448 beds (A-D labels, capacity-based)

### Features (20+ tables)
- `bills`, `bill_items`
- `parcels`
- `maintenance_requests`
- `student_scores`
- `events`, `event_registrations`
- `announcements`, `announcement_bookmarks`, `announcement_registrations`, `announcement_reads`, `announcement_documents`
- `notifications`
- `ai_chat_sessions`, `ai_chat_messages`, `chat_escalations`
- `documents`, `knowledge_folders`, `document_tags`, `document_tag_assignments`
- `repair_templates`
- `app_settings`

### Extensions
- `pgvector` — vector similarity search
- `uuid-ossp` — UUID generation

---

## 🔌 API Routes (60+)

### Auth (`/api/auth/`) — 9 routes
- `POST /callback` — LINE OAuth callback
- `POST /login` — dev login
- `POST /logout` — logout
- `POST /register` — registration
- `GET /session` — session check
- `POST /refresh` — refresh session
- `GET /user` — get user info
- `POST /verify-email` — email verification
- `POST /reset-password` — password reset

### Student (`/api/student/`) — 5 routes
- `GET /bills` — fetch bills
- `GET /insights` — AI insights
- `POST /maintenance/[id]/cancel` — cancel ticket
- `GET /notifications` — fetch notifications
- `GET /parcels` — fetch parcels

### Admin (`/api/admin/`) — 30+ routes
- AI: `GET /ai`, `POST /ai/chat`
- Announcements: `GET /`, `POST /`, `GET /[id]`, `PATCH /[id]`, `DELETE /[id]`
- Bills: `GET /bills`, `POST /bills`
- Booking: `POST /booking/[id]`
- Knowledge: 8 sub-routes (folders, tags, upload, process, query, documents, bulk)
- Live Chat: `GET /live-chat`, `POST /live-chat/[id]/claim`, `POST /live-chat/[id]/reply`, `POST /live-chat/[id]/close`
- Maintenance: `GET /maintenance`, `PATCH /maintenance/[id]`
- Parcels: `POST /parcels`, `PATCH /parcels/[id]`
- Roles: `GET /roles`, `POST /roles`, `DELETE /roles`
- Scores: `GET /scores`, `POST /scores`
- Settings: `GET /settings`, `POST /settings`, `POST /settings/preview`
- Students: `GET /students`, `PATCH /students/[id]`

### Shared (`/api/`) — 10 routes
- Chat: `POST /chat`, `GET /chat/history`, `POST /chat/escalate`, `GET /chat/messages`
- Chatbot: `POST /chatbot` (LINE webhook)
- Flex: `POST /flex` (preview Flex JSON)
- Maintenance: `POST /maintenance` (create request)
- Webhooks: `POST /webhooks/line` (LINE events)

---

## 🎨 Design System (V1)

### Colors
**CU Pink Palette**:
- Primary: `#DD598B`
- Light Pink: `#FCE4EC`
- Dark Pink: `#C2185B`

**Status Colors**:
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error: `#F44336`
- Info: `#2196F3`

**Score Categories**:
- Mandatory: `#DD598B` (CU Pink)
- External: `#FFF3D2` (Yellow)
- Internal: `#CFFFCD` (Green)

### Typography
- **Heading**: Chulalongkorn (local OTF, `font-heading`)
- **Body**: ChulaCharasNew (local TTF, `font-sans`)

### Spacing Scale
- Base: 4px
- Scale: 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32

### Shadows
- sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- md: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- lg: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

---

## 📊 Analytics & Metrics (V1)

### Database Metrics
- 40+ tables
- 24 migrations
- 2,448 beds across 680 rooms
- 20 repair templates with embeddings

### Feature Metrics
- 36 pages (student + admin)
- 60+ API routes
- 17 LINE integrations (Flex + webhook)
- 25 TanStack Query hooks
- 6 Zustand stores

### LINE Assets
- 9 Flex message builders
- 6 onboarding carousel banners (684KB total)
- 2 hero banners (Inbox.jpg, New_Request.jpg)

---

## ⚙️ Technical Specifications

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (new-york variant)
- **State**: TanStack Query + Zustand
- **i18n**: next-intl v4
- **Validation**: Zod v4

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Auth**: Supabase Auth + LINE Login OAuth
- **Storage**: Supabase Storage (images, documents)
- **Vector DB**: pgvector extension

### AI & ML
- **LLM**: OpenAI GPT-4o-mini (chatbot), GPT-4o (vision)
- **Vision**: OpenAI GPT-4o (primary), Gemini 2.0 Flash (fallback)
- **Embeddings**: text-embedding-3-small (1536 dimensions)
- **RAG**: Custom implementation with Supabase vector search

### LINE Platform
- **Channels**: LINE Login (OAuth) + Messaging API (chatbot)
- **Features**: Flex Messages, Rich Menu, Quick Reply, Postback Actions
- **Webhook**: `POST /api/chatbot`

### Deployment
- **Platform**: Vercel (production)
- **Build**: Turbopack
- **Regions**: Auto (global CDN)

---

## 🐛 Known Issues & Limitations (V1)

### Technical Debt
- Polling-based real-time (not WebSockets) — 3s refetchInterval
- AI settings cached 5 min (not instant invalidation)
- Some RLS policies require `createAdminClient()` bypass
- New tables not in generated types (require `as any` cast)

### UX Limitations
- Digital ID card: PNG-based (not code-rendered, except in `feat/digital-dorm-card` branch)
- Emergency contacts: hardcoded mock data (not DB-driven)
- Toggle switches in settings: local state only (not persisted)

### Pending Features
- LIFF Mini App (scaffolded only)
- Phase 8: Reports (not started)
- Phase 9: Polish (not started)
- WebSocket real-time updates
- Push notifications (web + mobile)

---

## 📚 Related Documentation

- **PRD**: `docs/PRD.md` — Product Requirements Document
- **Changelog**: `docs/CHANGELOG_V1.md` — Detailed changelog
- **CLAUDE.md**: Project instructions for AI assistant
- **MEMORY.md**: Auto memory reference (`.claude/projects/.../memory/MEMORY.md`)

---

**Last Updated**: 2026-04-10
**Version**: 1.0.0
**Status**: Production Release ✅
