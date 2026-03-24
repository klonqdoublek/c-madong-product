# C-Madong Service Blueprint
## End-to-End Dorm Life Journey

> **Version**: 1.0
> **Date**: 2026-03-21
> **Author**: Khaoklong
> **Purpose**: Comprehensive service blueprint for C-Madong dorm management system covering the complete student lifecycle

---

## Executive Summary

This service blueprint maps the end-to-end journey of a Chulalongkorn University student living in a dormitory, from initial registration through daily life to move-out. It identifies all touchpoints, processes, and actors involved in delivering the C-Madong digital experience.

### Key Insights

**Strengths:**
- ✅ Seamless LINE integration eliminates app download friction
- ✅ Multi-channel touchpoints (LINE chatbot, web app, admin portal) provide flexibility
- ✅ Real-time notifications keep students informed
- ✅ Digital-first approach reduces paper waste and manual processes

**Opportunities:**
- 🔄 AI vision analysis (Phase 4.5) can significantly improve maintenance request quality
- 📊 Dorm score gamification encourages positive community behavior
- 🤖 Chatbot น้องซีมะโด่ง provides 24/7 instant support
- 📱 LIFF integration (Phase 7) will further reduce context switching

**Pain Points to Address:**
- ⚠️ Initial onboarding requires multiple steps (LINE login → registration → room setup)
- ⚠️ Photo upload quality impacts AI vision analysis accuracy
- ⚠️ Notification overload risk if not properly prioritized
- ⚠️ Admin portal requires training for staff adoption

---

## Service Blueprint Overview

### Phases of Dorm Life

```
┌─────────────┐   ┌────────────┐   ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
│ Pre-Arrival │ → │ Onboarding │ → │ Daily Life  │ → │ Move-Out     │   │ Alumni/Return   │
│ (Discovery) │   │ (Week 1)   │   │ (Ongoing)   │   │ (Check-out)  │   │ (Future)        │
└─────────────┘   └────────────┘   └─────────────┘   └──────────────┘   └─────────────────┘
```

---

## Phase 1: Pre-Arrival (Discovery & Registration)

### Customer Actions
1. Learn about dorm system from orientation materials
2. Receive LINE OA QR code / invitation link
3. Follow C-Madong LINE Official Account
4. Click "เข้าสู่ระบบด้วย LINE" button
5. Authorize LINE OAuth permissions

---

### Frontstage (Visible to Student)

**LINE Chatbot น้องซีมะโด่ง:**
- Welcome message with greeting
- Quick reply menu: "เริ่มต้นใช้งาน", "เกี่ยวกับหอพัก", "ติดต่อเจ้าหน้าที่"

**Web Interface:**
- Landing page with "Login with LINE" button
- Registration form (student ID, name, CUNET email)
- Email verification required

---

### Line of Visibility
---

### Backstage (Invisible to Student)

**Staff Actions:**
- Prepare student data list (Excel → import to system)
- Configure building/room/bed inventory
- Set up LINE OA welcome messages
- Monitor new registration queue

**System Actions:**
- LINE OAuth token exchange
- Create synthetic email account (`{lineUid}@line.c-madong.app`)
- Generate short password (`ln_{uuid}`)
- Send CUNET email verification
- Queue new profile for admin approval

---

### Line of Internal Interaction
---

### Support Processes

**Technical Infrastructure:**
- Supabase Auth with LINE OAuth provider
- `profiles` table insert with role='student'
- Email service (verification link sender)
- LINE Messaging API (push welcome message)

**Business Rules:**
- Must use @student.chula.ac.th email
- Student ID must be 10 digits
- One LINE account = one profile (duplicate prevention)

---

### Physical Evidence

**Digital Artifacts:**
- LINE message notification (welcome)
- Email verification link
- Student registration record in database
- Admin dashboard notification (new student)

**Physical Touchpoints:**
- Orientation pamphlet with LINE QR code
- Dorm office phone number for support

---

## Phase 2: Onboarding (First Week)

### Customer Actions
1. Verify CUNET email
2. Complete onboarding wizard:
   - Select building → floor → room → bed
   - Choose language preference (Thai/English)
   - Set notification preferences
3. View digital dorm card
4. Explore dashboard features

---

### Frontstage (Visible to Student)

**Onboarding Wizard (Multi-step):**
- Step 1/3: "เลือกห้องพักของคุณ" (Cascading selects: building → floor → room → bed)
- Step 2/3: "ตั้งค่าภาษา" (Thai/English radio buttons)
- Step 3/3: "การแจ้งเตือน" (Toggle switches for notification types)

**Dashboard:**
- Greeting: "สวัสดี, [ชื่อ] :)"
- Room info card (building, floor, room, bed)
- Dorm score card (initial score: 80/100)
- Quick action grid (8 tiles)

**Digital Dorm Card:**
- Student photo, name, student ID
- Room location
- QR code for check-in/check-out

---

### Line of Visibility
---

### Backstage (Invisible to Student)

**Staff Actions:**
- Verify student information matches dorm records
- Manually assign room if bed selection conflicts
- Add student tags (e.g., "ปี 1", "แพทย์", "ต่างจังหวัด")

**System Actions:**
- Update `profiles` table with room/bed foreign keys
- Check bed availability (race condition prevention)
- Set `onboarding_completed` flag
- Create initial score entry (80 points)
- Trigger welcome notification

---

### Line of Internal Interaction
---

### Support Processes

**Technical Infrastructure:**
- Transaction isolation for bed assignment
- i18n locale cookie storage
- Notification preferences stored in `profiles` table
- QR code generation (JWT with student ID)

**Business Rules:**
- One bed = one student (unique constraint)
- Cannot skip onboarding steps (sequential flow)
- Default language: Thai
- Default notifications: all enabled

---

### Physical Evidence

**Digital Artifacts:**
- Completed profile in database
- Digital dorm card (screenshot-friendly)
- LINE push notification: "ยินดีต้อนรับสู่หอพัก! 🏠"
- Dashboard personalized with student data

**Physical Touchpoints:**
- Physical key handover at office
- Orientation packet
- Room inspection checklist

---

## Phase 3: Daily Life (Ongoing)

### 3A. Receiving Announcements

#### Customer Actions
1. Receive LINE push notification (Flex message)
2. Tap notification → view announcement detail
3. Read full content in web app
4. Mark as read

#### Frontstage (Visible to Student)

**LINE:**
- Flex bubble with announcement preview
- Image/icon, title, summary, "อ่านเพิ่มเติม" button

**Web App:**
- Notification bell badge (unread count)
- Announcement list page (ประกาศ)
- Full announcement detail with rich text
- Pinned announcements at top

#### Line of Visibility
---

#### Backstage (Invisible to Student)

**Admin Actions:**
- Create announcement in admin portal
- Write content with rich text editor
- Design Flex message in visual builder
- Select target audience (all/tags)
- Schedule send time
- Click "ส่งประกาศ"

**System Actions:**
- Save announcement to database
- Generate Flex JSON from template
- Query target student LINE UIDs
- Batch push messages (50 at a time)
- Create in-app notifications
- Mark as "sent"

#### Line of Internal Interaction
---

#### Support Processes

**Technical Infrastructure:**
- LINE Messaging API push endpoint
- Flex message builder (`src/lib/line/flex-builders/`)
- Message queue for batch sending
- Real-time notification via Supabase subscriptions

**Business Rules:**
- Broadcast = all students
- Tag-based = filtered by student tags
- Scheduled messages run via cron job
- Failed sends logged for retry

#### Physical Evidence

**Digital Artifacts:**
- LINE Flex message in chat
- In-app notification badge
- Announcement record with "อ่านแล้ว" status
- Admin dashboard "sent" counter

---

### 3B. Checking Utility Bills

#### Customer Actions
1. Navigate to "ค่าหอพัก" from dashboard
2. View current bills (pending/overdue)
3. Check bill details (amount breakdown)
4. [Future] Scan QR code for payment

#### Frontstage (Visible to Student)

**Web App:**
- Dashboard card: urgent bill alert with due date
- Bills page: pending bills + payment history tabs
- Bill detail: breakdown (room rent, electricity, water, deposit, fines)
- Status badges (pending/paid/overdue/cancelled)

**LINE:**
- Monthly bill reminder Flex message (due date, amount, "ชำระเลย" button)

#### Line of Visibility
---

#### Backstage (Invisible to Student)

**Admin Actions:**
- Create bill in admin portal (search student → enter amounts)
- Set billing month/year/round
- Set due date
- Add bill items (categories + amounts)
- Send reminder (single/batch)

**Finance Staff Actions:**
- Mark bill as paid after payment received
- Add payment notes
- Generate receipt

**System Actions:**
- Calculate total amount from bill items
- Auto-mark as overdue if past due date
- Send LINE reminder 3 days before due date
- Create notification on status change

#### Line of Internal Interaction
---

#### Support Processes

**Technical Infrastructure:**
- `bills` + `bill_items` tables
- Scheduled job: check due dates daily
- LINE bill reminder Flex builder
- Payment gateway integration [future]

**Business Rules:**
- Bill locked once sent (no edits)
- Overdue after due date (auto status change)
- Only admin can mark as paid
- Cannot delete paid bills

#### Physical Evidence

**Digital Artifacts:**
- LINE bill reminder Flex message
- Bill detail page with QR code [future]
- Payment receipt [future]
- In-app notification: "มียอดค่าหอพักที่ต้องชำระ"

**Physical Touchpoints:**
- Payment counter at dorm office
- Physical receipt

---

### 3C. Receiving Parcels

#### Customer Actions
1. Receive LINE notification: "📦 คุณมีพัสดุรอรับ!"
2. Tap to view parcel details (tracking number, location)
3. Go to pickup location (front desk)
4. Show student ID / digital dorm card
5. Sign for parcel pickup

#### Frontstage (Visible to Student)

**LINE:**
- Parcel notification Flex (pink header, tracking number, pickup location, hero image)
- Carousel for multiple parcels (swipe)
- "ดูพัสดุทั้งหมด" button → LIFF/web

**Web App:**
- Dashboard: parcel count badge
- Parcels page: pending parcels + pickup history
- Parcel detail: tracking, type (box/envelope), arrived date, location

#### Line of Visibility
---

#### Backstage (Invisible to Student)

**Parcel Staff Actions:**
- Parcel arrives at dorm office
- Scan/enter tracking number in admin portal
- Search student (by name/ID/room)
- Select parcel type
- Add pickup location
- Click "แจ้งเตือนนิสิต"

**System Actions:**
- Create parcel record (status: pending)
- Query student LINE UID
- Build Flex message with parcel data
- Push LINE notification
- Create in-app notification
- Update status to "notified"

#### Line of Internal Interaction
---

#### Support Processes

**Technical Infrastructure:**
- `parcels` table with tracking/status
- LINE parcel Flex builder (single/carousel)
- Notification trigger on parcel creation
- Status workflow: pending → notified → picked_up → returned

**Business Rules:**
- Notify immediately after registration
- One parcel can have multiple items (notes field)
- Parcel returned to sender after 30 days [future]
- Photo required for oversized parcels [future]

#### Physical Evidence

**Digital Artifacts:**
- LINE Flex notification with parcel details
- Web app parcel list with status
- Pickup history log
- Admin timestamp log

**Physical Touchpoints:**
- Physical parcel at office shelf
- Parcel log book (backup)
- Pickup signature

---

### 3D. Participating in Activities & Events

#### Customer Actions
1. Browse upcoming events (dashboard/events page)
2. View event details (date, location, score impact, capacity)
3. Register for event
4. Receive reminder notification
5. Attend event (QR check-in [future])
6. View updated dorm score

#### Frontstage (Visible to Student)

**Web App:**
- Dashboard: upcoming events section (3 events with "ลงทะเบียน" badges)
- Events page: tabs (upcoming/past), filters (type/mandatory)
- Event detail: full info, capacity bar, "ลงทะเบียน" button, attendance status
- Score page: composite score + 4 category breakdown + history timeline

**LINE:**
- Event reminder: "🎉 อย่าลืม! กิจกรรม [name] พรุ่งนี้"
- Score update: "🌟 +10 คะแนน! จากกิจกรรม [name]" (green Flex card)

#### Line of Visibility
---

#### Backstage (Invisible to Student)

**Activity Staff Actions:**
- Create event in admin portal (bilingual fields)
- Set event type (social/volunteer/sports/academic/mandatory/meeting)
- Configure impact level (positive/negative/neutral)
- Set score/penalty points
- Set capacity limit
- Publish event

**Admin at Event:**
- Mark attendance for registered students
- Mark as "attended", "absent", or "excused"

**System Actions:**
- Allow registration up to capacity
- Send LINE reminder 1 day before event
- Auto-create score entry when attendance marked "attended"
- Recalculate composite score (weighted by category)
- Push LINE score update notification

#### Line of Internal Interaction
---

#### Support Processes

**Technical Infrastructure:**
- `dorm_events` + `event_attendance` + `score_entries` tables
- Materialized view: `student_score_summary`
- RPC function: `get_composite_score(student_uuid)`
- Trigger: `auto_score_from_attendance`
- Score calculation weights: Activities 40%, Community Service 20%, Rules Compliance 25%, Meetings 15%

**Business Rules:**
- Registration closes when capacity reached
- Cannot unregister after event starts
- Absent from mandatory event = negative score
- Score entry auto-created only for "attended"
- Composite score refreshed on every entry

#### Physical Evidence

**Digital Artifacts:**
- Event registration confirmation (in-app)
- LINE reminder notification
- Attendance record in database
- Score update LINE Flex message
- Updated score display in app

**Physical Touchpoints:**
- Event sign-in sheet (backup)
- Event location signage
- Committee badges

---

## Phase 4: Issue Resolution (Maintenance Requests)

### Customer Actions
1. **Notice issue** (broken AC, leaky faucet, internet down)
2. **Report via chatbot or web app**
   - Chatbot: "แจ้งซ่อม" → guide message → provide details + photos
   - Web: Multi-step form (category → details → photos → appointment → review)
3. **Receive confirmation** (LINE Flex: "✅ แจ้งซ่อมแล้ว #T001")
4. **Track status** (chatbot: "ติดตามสถานะ" → timeline Flex)
5. **Receive updates** (status change → LINE push notification)
6. **Book appointment** (optional: select date/time for technician visit)
7. **Technician arrives** (repairs issue)
8. **Receive completion notice** (LINE Flex: "🎉 ซ่อมสำเร็จ!" + review CTA)
9. **[Optional] Cancel request** (if issue resolved or no longer needed)

---

### Frontstage (Visible to Student)

**LINE Chatbot:**
- Intent detection: "แจ้งซ่อม", "ซ่อมบ้าง", "เครื่องปรับอากาศเสีย"
- Guide message for short phrases: "เริ่มแจ้งซ่อม" quick reply menu
- Repair flow with session state:
  - Collect description (text)
  - Collect photos (up to 5 images)
  - AI vision analysis (category detection, urgency, damage details)
  - Confirmation card (pink Flex with ticket preview + "ยืนยัน"/"แก้ไข" buttons)
  - Ticket created card (green Flex: "✅ แจ้งซ่อมแล้ว #T001" + track/cancel/history actions)
- Status check: "ติดตามสถานะ" → vertical timeline Flex (dots + lines, technician info)
- Cancel via chatbot: postback button → confirm dialog → cancelled

**Web App:**
- Dashboard: "แจ้งซ่อม" tile
- New request form:
  - Step 1: Category selection (9 categories with icons)
  - Step 2: Description + room confirmation
  - Step 3: Photo upload (5 max, thumbnail previews)
  - Step 4: Appointment booking (toggle + date picker + time slots)
  - Step 5: Review summary → "ส่งคำขอ"
- My tickets: list with status filters + search
- Ticket detail: full info, photo gallery, status history, technician notes, cancel button (pending/acknowledged only)

**LINE Notifications:**
1. **Ticket created** (chatbot Flex): green header, ticket number box, detail rows, 3 postback actions
2. **Status tracking** (on-demand): timeline with created/accepted/in-progress/completed timestamps
3. **Status update** (push): branches by status — completed shows green "ซ่อมสำเร็จ" with review CTA

---

### Line of Visibility
---

### Backstage (Invisible to Student)

**Chatbot AI Actions:**
- Intent classification (OpenAI gpt-4o-mini)
- Session state management (repair_collecting_photos → repair_confirming → repair_editing)
- Vision analysis orchestration:
  1. Template matching (pgvector search, free, <1s)
  2. Gemini 2.0 Flash (primary AI, free tier, <3s)
  3. GPT-4o (fallback for low confidence, paid, <5s)
- Extract category, urgency, damage details
- Store detection result in session

**Admin/Staff Actions (Admin Portal):**
- View all tickets in Kanban board or list view
- Filter by status/category/building/floor
- Click ticket → detail modal opens
- Change status: new → acknowledged → in_progress → completed/failed
- Assign technician from dropdown
- Add admin notes
- Mark as failed (require failure reason)
- System auto-sends LINE notification on status change

**Technician Actions:**
- Receive assignment notification (email/LINE)
- View ticket details (location, description, photos)
- Navigate to room
- Perform repair work
- Update status via mobile app [future] or report to admin

**System Actions:**
- Store ticket in `maintenance_requests` table with vision metadata
- Create in-app notification for student
- Send LINE Flex confirmation (green "แจ้งซ่อมแล้ว" card)
- On status change:
  - Update ticket status
  - Create in-app notification
  - Query student LINE UID (via admin client)
  - Build status-appropriate Flex message
  - Push LINE notification (independent error handling)
- On cancel request:
  - Verify ownership + allowed status
  - Update status to 'cancelled'
  - Store failure_reason
  - Invalidate query cache

---

### Line of Internal Interaction
---

### Support Processes

**Technical Infrastructure:**
- `maintenance_requests` table with vision metadata (ai_confidence, ai_provider, template_id, damage_details)
- `repair_templates` table with pgvector embeddings
- `technicians` table with assignment tracking
- LINE webhook handler (`/api/webhooks/line`)
- Chatbot intent router + repair handler
- Vision AI orchestrator (multi-agent)
- Supabase Storage: `maintenance-photos` bucket
- Admin API route: `PATCH /api/admin/maintenance/[id]` (triggers notifications)
- Student API route: `POST /api/student/maintenance/[id]/cancel`
- Real-time subscriptions for status updates

**AI Vision Pipeline:**
```
Photos received
    ↓
RepairOrchestrator.analyzeWithVision()
    ↓
VisionAgent.analyze()
    ↓
1. Template Match (pgvector similarity search, threshold 0.85)
   ├─ Match found → return template category + confidence
   └─ No match → proceed to step 2
    ↓
2. Gemini 2.0 Flash (vision analysis, free tier 1500 req/day)
   ├─ Confidence ≥ 0.7 → return result
   └─ Confidence < 0.7 → proceed to step 3
    ↓
3. GPT-4o Fallback (higher quality, paid)
   ├─ Confidence ≥ 0.5 → return result
   └─ Confidence < 0.5 → proceed to step 4
    ↓
4. Keyword Detection (text-only fallback)
```

**Business Rules:**
- One ticket per repair issue
- Photos optional but recommended
- AI vision only runs if `ENABLE_VISION_ANALYSIS=true` and photos exist
- Template match threshold: 0.85 (high confidence)
- Gemini confidence threshold: 0.7 (proceed to GPT-4o if below)
- Only student requester can cancel their own ticket
- Cancel only allowed for pending/acknowledged status
- Appointment booking optional (date/time stored in notes [temp] or dedicated columns [future])
- Status workflow: new → acknowledged → in_progress → completed/failed
- Admin must provide failure_reason if marking as failed
- LINE notification sent on every status change

---

### Physical Evidence

**Digital Artifacts:**
1. **Chatbot session:**
   - User message: "แอร์เสีย" + photo
   - Bot response: guide message → confirm card → created card
2. **LINE Flex messages:**
   - Ticket created (green header, pink ticket box)
   - Status timeline (vertical dots + lines)
   - Repair completed (green badge, review CTA)
3. **Web app:**
   - Ticket list with status badges
   - Ticket detail with photo gallery
   - Status history timeline
4. **Admin portal:**
   - Kanban card with ticket summary
   - Detail modal with full info
   - Technician assignment record
5. **Database records:**
   - `maintenance_requests` row with vision metadata
   - `maintenance_photos` in Supabase Storage
   - Notification records
   - Score entry if service rating given [future]

**Physical Touchpoints:**
- Technician arrives at room
- Repair work performed
- Student verbal confirmation
- Technician tool/parts
- Physical inspection notes (if severe)

---

## Phase 5: Move-Out (Check-Out Process)

### Customer Actions
1. Notify admin of move-out date (via chatbot/web form [future])
2. Pay outstanding bills
3. Clear pending maintenance tickets
4. Schedule room inspection
5. Return physical key
6. Receive check-out confirmation

---

### Frontstage (Visible to Student)

**Web App [Future]:**
- "ยื้นแจ้งย้ายออก" form (move-out date, reason)
- Move-out checklist:
  - [ ] Pay all bills
  - [ ] Clear pending tickets
  - [ ] Room inspection scheduled
  - [ ] Key returned
- Check-out status page

**LINE:**
- Move-out reminder: "ใกล้วันที่ต้องย้ายออกแล้ว! กรุณาตรวจสอบขั้นตอน"
- Confirmation: "✅ ดำเนินการย้ายออกเรียบร้อยแล้ว ขอบคุณที่อยู่หอพัก!"

---

### Line of Visibility
---

### Backstage (Invisible to Student)

**Admin Actions:**
- Receive move-out notification
- Check outstanding bills (must be paid first)
- Check pending tickets (must be closed)
- Schedule room inspection
- Conduct inspection (checklist: cleanliness, damage, furniture)
- Assess damage fees (if any)
- Mark profile as inactive
- Release bed for new student

**System Actions:**
- Update profile status to "moving_out"
- Block new service requests (maintenance, parcels)
- Generate final bill (damage fees if any)
- Archive student data
- Release bed allocation
- Send LINE goodbye message

---

### Line of Internal Interaction
---

### Support Processes

**Technical Infrastructure:**
- `profiles.status` update (active → moving_out → inactive)
- Bed release transaction
- Data archival (soft delete, retain for records)
- Final bill generation

**Business Rules:**
- Cannot move out with unpaid bills
- Cannot move out with open maintenance tickets
- Damage fees assessed by admin
- Security deposit refund calculated
- Profile inactive but data retained (PDPA compliance)

---

### Physical Evidence

**Digital Artifacts:**
- Move-out request record
- Final bill with damage assessment
- Room inspection checklist (digital form)
- Check-out confirmation LINE message
- Profile status: "inactive"

**Physical Touchpoints:**
- Room inspection walkthrough
- Key return receipt
- Refund check/transfer (if applicable)
- Exit interview (optional)

---

## Cross-Cutting Concerns

### 1. Notifications & Communication

**Channels:**
- LINE push notifications (critical/urgent)
- In-app notifications (all types)
- Email (verification, receipts)

**Triggers:**
- Maintenance status change → LINE + in-app
- New announcement → LINE + in-app
- Bill due soon (3 days) → LINE
- Parcel arrived → LINE + in-app
- Event reminder (1 day) → LINE
- Score update → LINE + in-app

**Priority Levels (AI-based):**
- Critical (red): emergency, overdue bill, mandatory event missed
- High (orange): maintenance assigned, upcoming deadline
- Medium (yellow): score update, new announcement
- Low (blue): general info, tips

---

### 2. Data Privacy & Security

**Student Data Protection:**
- Email verification required
- LINE UID ≠ public identifier (use student ID or ticket number)
- RLS policies on all tables (students can only see own data)
- No PII in LINE postback data (use IDs only, store state in session)
- Admin actions logged (audit trail)

**Access Control:**
- Students: read own data, create requests, cancel own tickets
- Technicians: view assigned tickets, update status
- Staff: manage students, events, announcements
- Admins: full access

---

### 3. Error Handling & Resilience

**Graceful Degradation:**
- Vision AI fails → fallback to keyword detection
- LINE push fails → in-app notification still created
- Supabase down → queue actions for retry
- Image upload fails → allow text-only submission

**User Feedback:**
- Clear error messages in Thai
- "ลองใหม่อีกครั้ง" buttons
- Chatbot fallback: "ขอโทษนะคะ ระบบขัดข้อง กรุณาติดต่อเจ้าหน้าที่"
- Admin alerts for critical failures

---

## Pain Points & Opportunities Analysis

### Pain Points Identified

| # | Pain Point | Phase | Impact | Current State |
|---|------------|-------|--------|---------------|
| 1 | **Multi-step onboarding friction** | Onboarding | Medium | Required: LINE login → email verify → room select → prefs |
| 2 | **Photo quality affects AI accuracy** | Maintenance | High | Low-res/dark photos → incorrect category → manual fix by admin |
| 3 | **Notification fatigue risk** | Daily Life | Medium | Multiple channels (LINE + in-app) → potential overload |
| 4 | **No proactive issue detection** | Maintenance | Low | Students must report — no predictive maintenance |
| 5 | **Limited payment options** | Billing | High | No QR payment yet — must pay at office |
| 6 | **Manual attendance tracking** | Events | Medium | Admin marks attendance manually — time-consuming for large events |
| 7 | **Context switching (LINE ↔ Web)** | All phases | Medium | LIFF not yet implemented (Phase 7) |
| 8 | **Staff training required** | Admin adoption | Medium | Complex admin portal — onboarding needed |

---

### Opportunities for Improvement

| # | Opportunity | Phase | Expected Impact | Implementation |
|---|-------------|-------|-----------------|----------------|
| 1 | **Social onboarding** | Onboarding | 🔥 High | Auto-suggest roommate matching based on preferences, show nearby residents |
| 2 | **Smart photo guidance** | Maintenance | 🔥 High | Real-time tips: "📸 ถ่ายใกล้ขึ้น", "💡 เปิดไฟเพิ่ม", "✅ ภาพชัดแล้ว!" |
| 3 | **Adaptive notification priority** | Daily Life | 🔥 High | AI learns user behavior → only push truly urgent items to LINE, rest in-app |
| 4 | **Predictive maintenance** | Maintenance | 🌟 Medium | Detect patterns (e.g., AC issues spike in summer) → proactive reminders |
| 5 | **PromptPay QR payment** | Billing | 🔥 High | One-tap payment in app → instant confirmation |
| 6 | **QR check-in for events** | Events | 🌟 Medium | Students scan QR at venue → auto-mark attended → real-time score update |
| 7 | **LIFF mini app** | All phases | 🔥 High | Eliminate LINE ↔ Web switching → seamless in-LINE experience |
| 8 | **Gamified score system** | Daily Life | 🌟 Medium | Leaderboards, badges, milestone rewards → encourage participation |
| 9 | **Chatbot personality enhancement** | All phases | 💡 Low | Make น้องซีมะโด่ง more conversational, add humor, Gen-Z slang |
| 10 | **Multi-language RAG** | Daily Life | 💡 Low | Support English knowledge base for international students |

---

## Recommendations

### Short-term (Next 1-2 Months)

1. **Complete Phase 4.5 Vision AI rollout**
   - Expand template library to 50+ images
   - Monitor accuracy metrics (target: 85%+)
   - Implement admin feedback loop (flag incorrect categories)

2. **Launch LIFF mini app (Phase 7)**
   - Eliminate LINE ↔ Web context switching
   - Deep linking from all Flex message buttons
   - Auto-login from LINE identity

3. **Implement PromptPay QR payment (Phase 3 enhancement)**
   - Integrate with Thai bank APIs
   - Show QR code in bill detail
   - Auto-mark paid on payment webhook

4. **Smart notification priority**
   - Implement AI priority scoring (Phase 6 enhancement)
   - User behavior tracking (open rates, click rates)
   - Adaptive push vs in-app decision

---

### Mid-term (Next 3-6 Months)

5. **QR-based event check-in**
   - Generate unique QR code per event
   - Students scan at venue
   - Auto-mark attended + instant score update

6. **Predictive maintenance dashboard**
   - Admin view: upcoming seasonal patterns
   - Proactive reminders to students
   - Technician workload forecasting

7. **Gamified score enhancements**
   - Leaderboards (opt-in, privacy-safe)
   - Badges for milestones ("Perfect Attendance", "Helpful Neighbor")
   - Tier perks (Gold tier → early event registration)

8. **Enhanced chatbot personality**
   - More conversational tone (less robotic)
   - Humor and Gen-Z slang
   - Proactive check-ins ("สบายดีมั้ยคะ? มีอะไรให้น้องช่วยบ้าง?")

---

### Long-term (6+ Months)

9. **Roommate matching algorithm**
   - Preference survey (sleep schedule, cleanliness, noise tolerance)
   - AI-powered matching
   - Opt-in introduction messages

10. **International student support**
    - English RAG knowledge base
    - Bilingual chatbot responses
    - Cultural adaptation (holidays, dietary needs)

11. **Alumni engagement**
    - Alumni portal (read-only access to old memories)
    - Reunion event invitations
    - Networking features

12. **Analytics & BI dashboard**
    - Maintenance response time trends
    - Student satisfaction metrics
    - Financial reporting (bills collected)
    - Predictive occupancy planning

---

## Success Metrics

| Metric | Baseline | Target (6 months) | Measurement |
|--------|----------|-------------------|-------------|
| **Student adoption rate** | 0% | 80%+ | Active users / total dorm residents |
| **Maintenance avg response time** | 48h | <24h | Time from `new` → `acknowledged` |
| **Notification read rate** | — | 70%+ | Read count / total sent |
| **LINE engagement rate** | — | 60%+ | Chatbot interactions / active users |
| **Bill payment on-time rate** | — | 85%+ | Paid before due date / total bills |
| **Event attendance rate** | — | 75%+ | Attended / registered |
| **Student satisfaction (NPS)** | — | 4.0+/5.0 | In-app survey |
| **Staff time savings** | — | 50% | Ticket processing time reduction |
| **AI vision accuracy** | — | 85%+ | Correct category / total analyzed |

---

## Appendix

### Key Technologies

- **Frontend**: Next.js 16, React, TypeScript, Tailwind v4, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **AI/ML**: OpenAI (gpt-4o-mini), Google Gemini (2.0 Flash), pgvector
- **Messaging**: LINE Messaging API, LINE Login OAuth, LINE LIFF
- **Infrastructure**: Vercel (hosting), GitHub (version control)
- **Analytics**: [TBD — Mixpanel/Amplitude recommended]

---

### Glossary

- **LIFF**: LINE Front-end Framework (mini app inside LINE)
- **RLS**: Row Level Security (Supabase database security)
- **Flex Message**: LINE's rich message format (JSON-based UI)
- **RAG**: Retrieval-Augmented Generation (AI with knowledge base)
- **NPS**: Net Promoter Score (satisfaction metric)
- **CUNET**: Chulalongkorn University Network (student email)

---

### References

- [NN/G Service Blueprints Definition](https://www.nngroup.com/articles/service-blueprints-definition/)
- [IxDF Service Blueprints](https://ixdf.org/literature/topics/service-blueprint)
- [C-Madong PRD v1.8](./PRD.md)
- [C-Madong CLAUDE.md](../CLAUDE.md)
- [LINE Messaging API Docs](https://developers.line.biz/en/docs/messaging-api/)

---

**Document Control:**
- Next review: 2026-04-21
- Owner: Khaoklong (Product Designer)
- Stakeholders: Dev team, Admin staff, Committee
