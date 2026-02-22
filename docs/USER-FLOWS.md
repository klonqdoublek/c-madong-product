# C-Madong User Flows

> **Version**: 1.0
> **Last Updated**: 2026-02-14
> **Scope**: All major flows with edge cases and error states

---

## Table of Contents

1. [Authentication (LINE Login)](#1-authentication-line-login)
2. [Registration & Email Verification](#2-registration--email-verification)
3. [Onboarding](#3-onboarding)
4. [Admin Staff Login](#4-admin-staff-login)
5. [Maintenance Request — Submit (Student)](#5-maintenance-request--submit-student)
6. [Maintenance Request — Track (Student)](#6-maintenance-request--track-student)
7. [Maintenance Ticket — Manage (Admin)](#7-maintenance-ticket--manage-admin)
8. [Announcement — Create & Broadcast (Admin)](#8-announcement--create--broadcast-admin)
9. [Announcement — View (Student)](#9-announcement--view-student)
10. [Notification Flow](#10-notification-flow)
11. [Student Management (Admin)](#11-student-management-admin)
12. [Profile & Dorm Card (Student)](#12-profile--dorm-card-student)
13. [Session Lifecycle & Auth Edge Cases](#13-session-lifecycle--auth-edge-cases)

---

## 1. Authentication (LINE Login)

### Happy Path

```
User                    App                     LINE API              Supabase
 │                       │                        │                      │
 │  1. Open /login       │                        │                      │
 │──────────────────────>│                        │                      │
 │                       │                        │                      │
 │  2. See login page    │                        │                      │
 │<──────────────────────│                        │                      │
 │                       │                        │                      │
 │  3. Tap LINE button   │                        │                      │
 │──────────────────────>│                        │                      │
 │                       │  4. Redirect to        │                      │
 │                       │     LINE consent       │                      │
 │<──────────────────────│──────────────────────>│                      │
 │                       │                        │                      │
 │  5. Approve consent   │                        │                      │
 │──────────────────────────────────────────────>│                      │
 │                       │                        │                      │
 │  6. Redirect back     │  7. Exchange code      │                      │
 │     with auth code    │     for token          │                      │
 │──────────────────────>│──────────────────────>│                      │
 │                       │                        │                      │
 │                       │  8. Get LINE profile   │                      │
 │                       │<──────────────────────│                      │
 │                       │                        │                      │
 │                       │  9. Find/create user                          │
 │                       │─────────────────────────────────────────────>│
 │                       │                        │                      │
 │                       │  10. Set session cookies                      │
 │                       │<─────────────────────────────────────────────│
 │                       │                        │                      │
 │                       │  11. Check profile exists                     │
 │                       │─────────────────────────────────────────────>│
 │                       │                        │                      │
 │  12a. Has profile     │                        │                      │
 │       → /dashboard    │                        │                      │
 │  12b. No profile      │                        │                      │
 │       → /register     │                        │                      │
 │<──────────────────────│                        │                      │
```

### Edge Cases

#### E1.1: User denies LINE consent
```
User taps LINE button → LINE consent screen → User taps "ยกเลิก"
  │
  ▼
LINE redirects back to /api/auth/callback with error parameter
  │
  ├── App detects: ?error=access_denied
  ├── Redirect to /login
  └── Show toast: "การเข้าสู่ระบบถูกยกเลิก กรุณาลองใหม่อีกครั้ง"
```

#### E1.2: LINE access token expired during exchange
```
LINE callback with auth code → /api/auth/callback
  │
  ├── Exchange code for token → LINE API returns 400
  │   (code expired — user took too long on consent screen)
  │
  ├── Redirect to /login
  └── Show toast: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
```

#### E1.3: LINE account already linked to another Supabase user
```
Exchange code → Get LINE profile (line_uid: "U1234")
  │
  ├── Search profiles WHERE line_uid = "U1234"
  ├── Found profile with different auth user
  │
  ├── Option A: Auto-login as existing user (recommended)
  │   └── Create session for the existing user
  │
  └── Option B: Show error
      └── "บัญชี LINE นี้เชื่อมต่อกับบัญชีอื่นแล้ว กรุณาติดต่อเจ้าหน้าที่"
```

#### E1.4: Opening from LINE LIFF vs external browser
```
┌─────────────────────────────────────────────────┐
│  From LIFF (LINE in-app browser)                 │
│  ├── LIFF SDK available                          │
│  ├── Auto-detect LINE user via liff.getProfile() │
│  ├── Skip consent screen (already authorized)    │
│  └── Direct to /api/auth/callback with token     │
│                                                  │
│  From external browser (Chrome/Safari)           │
│  ├── LIFF SDK not available                      │
│  ├── Full LINE OAuth redirect flow               │
│  └── Standard consent → callback → session       │
└─────────────────────────────────────────────────┘
```

#### E1.5: Network error during auth callback
```
/api/auth/callback → Exchange code with LINE API
  │
  ├── Network timeout / DNS failure
  │
  ├── Redirect to /login
  └── Show toast: "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่"
```

### Error States Summary

| Error | Trigger | User Sees | Recovery |
|-------|---------|-----------|----------|
| Consent denied | User taps cancel on LINE | Toast + login page | Tap LINE button again |
| Code expired | Slow consent (>10 min) | Toast + login page | Tap LINE button again |
| Duplicate LINE | LINE UID already linked | Toast or auto-login | Contact admin |
| Network error | No internet / API down | Toast + login page | Check connection, retry |
| Supabase down | Auth service unavailable | Toast + login page | Wait and retry |
| Invalid state | CSRF state mismatch | Toast + login page | Tap LINE button again |

---

## 2. Registration & Email Verification

### Happy Path

```
/register
  │
  ├── 1. Fill form:
  │   ├── Student ID: 6430000021
  │   ├── ชื่อ-นามสกุล (ไทย): สมชาย ใจดี
  │   ├── Full Name (EN): Somchai Jaidee
  │   ├── Email: somchai.j@student.chula.ac.th
  │   └── Phone: 0812345678 (optional)
  │
  ├── 2. Tap "ลงทะเบียน"
  │
  ├── 3. Client-side validation passes (Zod)
  │
  ├── 4. Insert to profiles table
  │
  ├── 5. Send verification email to CUNET
  │
  ├── 6. Show verification screen:
  │   "ส่งอีเมลยืนยันไปที่ somchai.j@student.chula.ac.th
  │    กรุณาตรวจสอบอีเมลและกดลิงก์ยืนยัน"
  │
  ├── 7. User opens email, clicks verify link
  │
  ├── 8. Email verified → redirect to /onboarding
  │
  └── 9. Continue to onboarding flow
```

### Edge Cases

#### E2.1: Invalid student ID format
```
User types: "643ABC"
  │
  ├── Zod validation: z.string().regex(/^\d{10}$/)
  ├── Real-time field error (before submit)
  └── Show: "รหัสนิสิตต้องเป็นตัวเลข 10 หลัก"
```

#### E2.2: Non-CUNET email
```
User types: somchai@gmail.com
  │
  ├── Zod validation: z.string().email().refine(endsWith @student.chula.ac.th)
  └── Show: "กรุณาใช้อีเมล @student.chula.ac.th เท่านั้น"
```

#### E2.3: Student ID already registered
```
User submits form with student_id: "6430000021"
  │
  ├── Supabase insert → unique constraint violation
  ├── API returns: { error: { code: "DUPLICATE_STUDENT_ID" } }
  └── Show: "รหัสนิสิตนี้ลงทะเบียนแล้ว กรุณาติดต่อเจ้าหน้าที่หากมีปัญหา"
```

#### E2.4: Email already registered (different LINE account)
```
User submits with email: somchai.j@student.chula.ac.th
  │
  ├── Supabase insert → email already exists
  └── Show: "อีเมลนี้ถูกใช้งานแล้ว กรุณาติดต่อเจ้าหน้าที่"
```

#### E2.5: Verification email not received
```
User waits on verification screen
  │
  ├── After 60 seconds: show "ส่งอีเมลอีกครั้ง" button (with cooldown)
  │
  ├── Tap resend → Supabase resend verification
  │   ├── Success: "ส่งอีเมลยืนยันอีกครั้งแล้ว"
  │   └── Rate limited: "กรุณารอ X วินาทีก่อนส่งใหม่"
  │
  └── Show help text: "ตรวจสอบโฟลเดอร์ Spam หรือ Junk Mail"
```

#### E2.6: Verification link expired
```
User clicks verify link after 24 hours
  │
  ├── Supabase returns: token expired
  ├── Redirect to /register with message
  └── Show: "ลิงก์ยืนยันหมดอายุ กรุณาลงทะเบียนใหม่อีกครั้ง"
      └── Pre-fill form with previous data (if session exists)
```

#### E2.7: User refreshes or navigates away during registration
```
User fills form → navigates away → comes back
  │
  ├── Form state is lost (no persistence)
  ├── If session exists + profile incomplete:
  │   └── Redirect back to /register with empty form
  │
  └── If session exists + email unverified:
      └── Show verification screen again (email already sent)
```

### Error States Summary

| Error | Trigger | User Sees | Recovery |
|-------|---------|-----------|----------|
| Invalid student ID | Non-numeric or wrong length | Inline field error | Fix input |
| Non-CUNET email | Wrong email domain | Inline field error | Use @student.chula.ac.th |
| Duplicate student ID | Already registered | Toast error | Contact admin |
| Duplicate email | Email taken | Toast error | Contact admin |
| Verification timeout | Email not received | Resend button (60s cooldown) | Check spam, resend |
| Link expired | Clicked after 24h | Redirect + message | Re-register |
| Network error | No connection on submit | Toast error | Check connection, retry |
| Server error | Supabase insert fails | Toast error | Retry |

---

## 3. Onboarding

### Happy Path

```
/onboarding
  │
  ├── Step 1: ข้อมูลส่วนตัว ──────────────────────────────
  │   ├── Confirm name (pre-filled from registration)
  │   ├── Upload profile photo (optional)
  │   └── Tap "ถัดไป"
  │
  ├── Step 2: เลือกห้องพัก ────────────────────────────────
  │   ├── Select ตึก (dropdown, loaded from buildings table)
  │   ├── Select ชั้น (dropdown, filtered by selected ตึก)
  │   ├── Select ห้อง (dropdown, filtered by selected ชั้น)
  │   ├── Select เตียง (dropdown, filtered by selected ห้อง)
  │   └── Tap "ถัดไป"
  │
  ├── Step 3: ตั้งค่า ─────────────────────────────────────
  │   ├── Select ภาษา: ไทย / English
  │   ├── Notification preferences (toggles)
  │   └── Tap "เสร็จสิ้น"
  │
  ├── Update profile in Supabase
  │
  └── Redirect to /dashboard
```

### Edge Cases

#### E3.1: Selected bed is already occupied
```
User selects ตึก → ชั้น → ห้อง → เตียง A
  │
  ├── Submit onboarding → Supabase update
  ├── beds table: is_occupied = true for bed A
  │
  ├── Option A (prevent): Bed dropdown only shows available beds
  │   └── Occupied beds disabled with "(ไม่ว่าง)" label
  │
  └── Option B (race condition): Two users select same bed simultaneously
      ├── First submit wins (unique constraint on bed_id in profiles)
      ├── Second submit fails
      └── Show: "เตียงนี้ถูกเลือกแล้ว กรุณาเลือกเตียงอื่น"
          └── Re-fetch available beds
```

#### E3.2: No buildings/rooms data loaded
```
Step 2: Dropdown shows loading...
  │
  ├── buildings table is empty or fetch failed
  │
  ├── Show: "ไม่สามารถโหลดข้อมูลตึกได้ กรุณาลองใหม่"
  │   └── "ลองใหม่" button → refetch
  │
  └── If persistent: "กรุณาติดต่อเจ้าหน้าที่หอพัก"
```

#### E3.3: User navigates back between steps
```
Step 2 → tap "กลับ" → Step 1
  │
  ├── Previous selections preserved (local state)
  ├── User can edit Step 1 data
  └── Tap "ถัดไป" → Step 2 with previous selections still intact
```

#### E3.4: User closes app mid-onboarding
```
User completes Step 1 → closes app → reopens
  │
  ├── Profile exists but building_id/room_id/bed_id are null
  ├── Middleware detects: profile incomplete (no room)
  └── Redirect to /onboarding (restart from Step 1)
      └── Step 1 data may be pre-filled from partial profile
```

#### E3.5: Photo upload fails
```
Step 1: User selects photo → upload to Supabase Storage
  │
  ├── File too large (>5MB)
  │   └── Show: "ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่มีขนาดไม่เกิน 5MB"
  │
  ├── Invalid file type (not image)
  │   └── Show: "กรุณาเลือกไฟล์รูปภาพ (.jpg, .png)"
  │
  ├── Upload network error
  │   └── Show: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่"
  │       └── User can skip (photo is optional) → continue to Step 2
  │
  └── Storage quota exceeded
      └── Show: "ไม่สามารถอัปโหลดได้ กรุณาติดต่อเจ้าหน้าที่"
```

---

## 4. Admin Staff Login

### Happy Path

```
/login
  │
  ├── 1. Enter email + password
  ├── 2. Tap "เข้าสู่ระบบ"
  │
  ├── 3. Supabase signInWithPassword()
  │
  ├── 4. Success → fetch profile
  │   ├── role = "admin" or "head" → /admin/dashboard
  │   ├── role = "committee" → /admin/dashboard (limited)
  │   └── role = "student" → /dashboard
  │
  └── 5. Set session cookies
```

### Edge Cases

#### E4.1: Wrong email or password
```
User enters wrong credentials → Supabase returns error
  │
  └── Show: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      ├── Do NOT specify which one is wrong (security)
      ├── Clear password field
      └── Focus on password input
```

#### E4.2: Account not verified
```
Staff tries to login → Supabase returns: email not confirmed
  │
  └── Show: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
      └── "ส่งอีเมลยืนยันอีกครั้ง" link
```

#### E4.3: Account disabled / deleted
```
Staff tries to login → Supabase returns: user banned
  │
  └── Show: "บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ"
```

#### E4.4: Rate limiting (too many attempts)
```
5+ failed login attempts in 5 minutes
  │
  ├── Supabase rate limits the request
  └── Show: "คุณลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ X นาทีแล้วลองใหม่"
      └── Disable login button with countdown timer
```

---

## 5. Maintenance Request — Submit (Student)

### Happy Path

```
/maintenance/new
  │
  ├── 1. Select category: แอร์ (air_conditioning)
  │
  ├── 2. Enter title: "แอร์ไม่เย็น"
  │
  ├── 3. Enter description: "แอร์เปิดแล้วไม่เย็น ลมออกปกติ
  │      แต่อุณหภูมิไม่ลด ลองปรับ 18 องศาแล้วก็ยังไม่เย็น"
  │
  ├── 4. Attach photos (2 photos of AC unit)
  │
  ├── 5. Select appointment: 2026-02-17, 10:00
  │
  ├── 6. Tap "ส่งคำขอ"
  │
  ├── 7. Zod validation passes
  │
  ├── 8. Upload photos to Supabase Storage
  │
  ├── 9. Insert maintenance_request to DB
  │
  ├── 10. Show success toast: "ส่งคำขอแจ้งซ่อมเรียบร้อย"
  │
  └── 11. Redirect to /maintenance (see new request in list)
```

### Edge Cases

#### E5.1: Validation errors (multiple fields)
```
User taps "ส่งคำขอ" without filling required fields
  │
  ├── category: null
  │   └── Error: "กรุณาเลือกประเภท"
  │
  ├── title: "" (empty)
  │   └── Error: "กรุณาระบุหัวข้อ"
  │
  ├── description: "สั้น" (< 10 chars)
  │   └── Error: "กรุณาอธิบายรายละเอียดอย่างน้อย 10 ตัวอักษร"
  │
  ├── description: (> 2000 chars)
  │   └── Error: "รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร"
  │       └── Show character count: "1,847 / 2,000"
  │
  └── All errors shown inline under each field
      └── Scroll to first error field
```

#### E5.2: Photo upload failures
```
User attaches photos
  │
  ├── More than 5 photos
  │   └── Disable add button + show: "แนบรูปได้สูงสุด 5 รูป"
  │
  ├── Single photo > 10MB
  │   └── Show under photo: "ไฟล์ใหญ่เกินไป (สูงสุด 10MB)"
  │       └── Remove failed photo from list
  │
  ├── Non-image file
  │   └── Show: "รองรับเฉพาะไฟล์รูปภาพ (.jpg, .png, .heic)"
  │
  ├── Upload succeeds for 2/3 photos, 1 fails (network)
  │   ├── Show error on failed photo: "อัปโหลดไม่สำเร็จ"
  │   ├── "ลองใหม่" button on failed photo
  │   └── User can still submit with 2 successful photos
  │
  └── All uploads fail
      ├── Show: "ไม่สามารถอัปโหลดรูปได้"
      └── User can submit without photos (photos optional)
```

#### E5.3: Appointment date in the past
```
User selects date: 2026-02-10 (already passed)
  │
  ├── Date picker: disable past dates (preventive)
  │
  └── If somehow submitted:
      └── Server validation rejects
          └── Error: "กรุณาเลือกวันนัดหมายในอนาคต"
```

#### E5.4: Appointment on weekend / holiday
```
User selects Saturday
  │
  ├── Option A: Allow with warning
  │   └── Show: "วันที่เลือกเป็นวันหยุด ช่างอาจไม่สามารถมาได้ตามนัด"
  │
  └── Option B: Disable weekends in date picker
```

#### E5.5: Network error during submission
```
User taps "ส่งคำขอ" → photos uploaded → DB insert fails
  │
  ├── Show: "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่"
  ├── Keep form data intact (don't clear)
  ├── Already-uploaded photos: reuse URLs (don't re-upload)
  └── "ลองใหม่" button → retry DB insert only
```

#### E5.6: Duplicate request (same category + room, recent)
```
User submits AC repair → success
User submits another AC repair 5 minutes later
  │
  ├── Option A: Allow (might be different issue)
  │
  └── Option B: Show confirmation dialog
      └── "คุณเพิ่งส่งคำขอแจ้งซ่อมแอร์เมื่อ 5 นาทีที่แล้ว
           ต้องการส่งคำขอใหม่หรือไม่?"
      ├── "ส่งคำขอใหม่" → proceed
      └── "ดูคำขอเดิม" → navigate to existing request
```

#### E5.7: Session expired during form filling
```
User fills form for 30+ minutes → session expires
  │
  ├── Tap "ส่งคำขอ" → API returns 401
  │
  ├── Option A: Auto-refresh session (silent)
  │   └── Retry submission with new session
  │
  └── Option B: Session unrecoverable
      ├── Show: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
      ├── Save form data to sessionStorage
      ├── Redirect to /login
      └── After login → restore form data → show form again
```

---

## 6. Maintenance Request — Track (Student)

### Happy Path

```
/maintenance
  │
  ├── See list of own requests (newest first)
  │   ├── Card 1: "แอร์ไม่เย็น" — status: กำลังดำเนินการ 🟡
  │   ├── Card 2: "ก๊อกน้ำรั่ว" — status: เสร็จสิ้น ✅
  │   └── Card 3: "ไฟกระพริบ"  — status: รอดำเนินการ 🔵
  │
  ├── Tap on Card 1
  │
  ▼
/maintenance/[id]
  │
  ├── Status timeline:
  │   ├── ✅ ส่งคำขอ — 14 ก.พ. 2569, 09:30
  │   ├── ✅ รับเรื่องแล้ว — 14 ก.พ. 2569, 10:15
  │   ├── 🟡 กำลังดำเนินการ — 14 ก.พ. 2569, 14:00
  │   ├── ⬜ เสร็จสิ้น
  │   └── (waiting)
  │
  ├── Admin notes: "ช่างจะเข้าซ่อมวันจันทร์ 17 ก.พ. เวลา 10:00"
  │
  └── Request details (read-only)
```

### Edge Cases

#### E6.1: No requests yet
```
/maintenance
  │
  ├── Empty state:
  │   ├── Illustration / icon
  │   ├── "ยังไม่มีรายการแจ้งซ่อม"
  │   └── CTA button: "+ แจ้งซ่อมใหม่" → /maintenance/new
```

#### E6.2: Student tries to cancel a non-pending request
```
/maintenance/[id] — status: กำลังดำเนินการ
  │
  ├── "ยกเลิกคำขอ" button → disabled or hidden
  └── Only visible/enabled when status = "pending"
      └── If status changed while viewing (realtime):
          └── Button disappears, toast: "สถานะเปลี่ยนแล้ว"
```

#### E6.3: Cancel confirmation
```
/maintenance/[id] — status: รอดำเนินการ
  │
  ├── Tap "ยกเลิกคำขอ"
  │
  ├── Confirmation dialog:
  │   "ต้องการยกเลิกคำขอแจ้งซ่อมนี้หรือไม่?"
  │   ├── "ยืนยัน" → update status to "cancelled"
  │   │   └── Toast: "ยกเลิกคำขอเรียบร้อย"
  │   └── "ไม่" → close dialog
```

#### E6.4: Request deleted by admin while student is viewing
```
Student is on /maintenance/[id]
  │
  ├── Admin deletes the request (rare, but possible)
  │
  ├── Realtime subscription detects DELETE event
  │
  ├── Show: "คำขอแจ้งซ่อมนี้ถูกลบแล้ว"
  └── Redirect to /maintenance after 3 seconds
```

#### E6.5: Realtime status update while viewing
```
Student is on /maintenance/[id] — status: รอดำเนินการ
  │
  ├── Admin changes status to "รับเรื่องแล้ว"
  │
  ├── Realtime subscription fires
  ├── Status timeline animates new step
  ├── Admin notes appear (if added)
  └── Toast: "สถานะอัปเดต: รับเรื่องแล้ว"
```

---

## 7. Maintenance Ticket — Manage (Admin)

### Happy Path (Kanban)

```
/admin/maintenance
  │
  ├── Kanban board with 5 columns:
  │
  │   [รอดำเนินการ]  [รับเรื่องแล้ว]  [กำลังดำเนินการ]  [เสร็จสิ้น]  [ไม่สำเร็จ]
  │   ┌──────────┐   ┌──────────┐    ┌──────────────┐  ┌────────┐  ┌────────┐
  │   │ Ticket A │   │ Ticket C │    │ Ticket D     │  │Ticket E│  │Ticket F│
  │   │ Ticket B │   │          │    │              │  │        │  │        │
  │   └──────────┘   └──────────┘    └──────────────┘  └────────┘  └────────┘
  │
  ├── Drag Ticket A from "รอดำเนินการ" → "รับเรื่องแล้ว"
  │   ├── Optimistic UI: card moves immediately
  │   ├── API: update status → acknowledged
  │   ├── Realtime: all admin clients see the move
  │   └── Edge fn: send notification to student via LINE
  │
  └── Tap on Ticket C → open detail modal
```

### Edge Cases

#### E7.1: Invalid status transition (drag)
```
Admin drags ticket from "เสร็จสิ้น" → "รอดำเนินการ"
  │
  ├── Valid transitions:
  │   pending → acknowledged → in_progress → completed
  │                                        → failed
  │   pending → cancelled (student only)
  │
  ├── Invalid: completed → pending (going backwards)
  │
  ├── Reject drop: card snaps back to original column
  └── Toast: "ไม่สามารถเปลี่ยนสถานะกลับได้"
```

#### E7.2: Mark as failed without reason
```
Admin drags to "ไม่สำเร็จ" or selects failed in dropdown
  │
  ├── Modal opens: "ระบุเหตุผลที่ซ่อมไม่สำเร็จ"
  │   ├── Textarea: failure_reason (required)
  │   ├── "ยืนยัน" → update status + reason
  │   └── "ยกเลิก" → card snaps back
  │
  └── If reason is empty:
      └── Error: "กรุณาระบุเหตุผล"
```

#### E7.3: Concurrent edit (two admins editing same ticket)
```
Admin A opens ticket detail     Admin B opens same ticket
  │                                │
  ├── Admin A changes status       │
  │   to "รับเรื่องแล้ว"           │
  │                                │
  │   ◄── Realtime update ────────►│
  │                                │
  │                                ├── Admin B sees status changed
  │                                │   (modal refreshes)
  │                                │
  │                                ├── Admin B tries to change
  │                                │   status to "รับเรื่องแล้ว" (same)
  │                                └── No-op (already that status)
  │
  ├── Admin A adds notes           │
  │                                ├── Admin B also adds notes
  │                                │
  │                                └── Both notes saved
  │                                    (append, not overwrite)
```

#### E7.4: Large number of tickets (performance)
```
500+ tickets across all statuses
  │
  ├── Kanban: only show latest 50 per column
  │   └── "แสดงเพิ่มเติม" button at bottom of each column
  │
  ├── List view: paginated (20 per page)
  │   └── Page navigation at bottom
  │
  └── Filters reduce visible set:
      └── Category + status + building + floor
```

#### E7.5: Ticket notification fails to send via LINE
```
Admin changes status → trigger send-repair-notification
  │
  ├── Student has no line_uid (not linked)
  │   └── Skip LINE notification, in-app notification only
  │       └── Show warning icon on ticket: "ไม่สามารถส่ง LINE ได้"
  │
  ├── LINE API returns error (rate limit / invalid token)
  │   ├── In-app notification still created
  │   ├── Log error in edge function
  │   └── Admin sees: "ส่ง LINE ไม่สำเร็จ แจ้งเตือนในแอปเท่านั้น"
  │
  └── Student blocked the LINE OA
      └── LINE API returns: user has blocked the bot
          └── Update profile: line_status = "blocked"
```

---

## 8. Announcement — Create & Broadcast (Admin)

### Happy Path

```
/admin/announcements/new
  │
  ├── 1. Enter title: "ปิดน้ำชั่วคราว ชั้น 3-5"
  │
  ├── 2. Choose editor: Flex Message
  │   ├── Select template: "Maintenance Notice"
  │   ├── Edit content in visual builder
  │   └── Preview: looks good ✅
  │
  ├── 3. Target: เลือกกลุ่ม → tags: ["ชั้น3", "ชั้น4", "ชั้น5"]
  │
  ├── 4. Schedule: ส่งทันที
  │
  ├── 5. Tap "ส่ง"
  │
  ├── 6. Confirmation dialog:
  │   "ส่งประกาศถึง 45 คน ตอนนี้เลย?"
  │   ├── "ยืนยัน"
  │   └── "ยกเลิก"
  │
  ├── 7. Invoke send-broadcast edge function
  │
  ├── 8. LINE API: push to 45 students
  │
  ├── 9. Create in-app notifications
  │
  ├── 10. Update announcement status: "sent"
  │
  └── 11. Redirect to /admin/announcements
      └── Toast: "ส่งประกาศเรียบร้อย (45 คน)"
```

### Edge Cases

#### E8.1: No students match selected tags
```
Admin selects tags: ["ชั้น17"]
  │
  ├── Query students with tag "ชั้น17" → 0 results
  │
  ├── Show warning before send:
  │   "ไม่มีนิสิตในกลุ่มที่เลือก ไม่สามารถส่งประกาศได้"
  │
  └── Disable "ส่ง" button
      └── Suggest: "กรุณาเลือกกลุ่มอื่น หรือเลือก 'ส่งถึงทุกคน'"
```

#### E8.2: Empty content
```
Admin taps "ส่ง" with empty content
  │
  ├── Text mode: content_th is empty
  │   └── Error: "กรุณาเพิ่มเนื้อหาประกาศ"
  │
  ├── Flex mode: flex_json is null/empty
  │   └── Error: "กรุณาสร้าง Flex Message ก่อนส่ง"
  │
  └── No title
      └── Error: "กรุณาระบุหัวข้อประกาศ"
```

#### E8.3: Flex message JSON invalid
```
Admin switches to JSON editor, edits raw JSON
  │
  ├── Syntax error (missing bracket)
  │   └── JSON editor highlights error line
  │       └── "ส่ง" button disabled until valid JSON
  │
  ├── Valid JSON but not LINE Flex spec
  │   └── Preview shows: "ไม่สามารถแสดงตัวอย่างได้"
  │       └── Warning: "โครงสร้าง Flex Message อาจไม่ถูกต้อง"
  │
  └── JSON too large (>50KB LINE limit)
      └── Error: "Flex Message มีขนาดใหญ่เกินไป กรุณาลดเนื้อหา"
```

#### E8.4: Partial delivery failure
```
send-broadcast to 100 students
  │
  ├── 95 sent successfully
  ├── 3 failed (students blocked bot)
  ├── 2 failed (invalid LINE UID)
  │
  ├── Announcement status: "sent" (not "failed")
  │
  ├── Delivery summary on announcement detail:
  │   ├── ✅ ส่งสำเร็จ: 95
  │   ├── ❌ ไม่สำเร็จ: 5
  │   └── Details: list failed recipients + reasons
  │
  └── In-app notifications still created for all 100
```

#### E8.5: Broadcast API rate limit (LINE)
```
Admin sends broadcast to 1000+ students
  │
  ├── LINE API rate limit: 500 messages/request
  │
  ├── Edge function: batch into 500-message chunks
  │   ├── Batch 1: send 500 → success
  │   ├── Wait 1 second (rate limit cooldown)
  │   ├── Batch 2: send 500 → success
  │   └── Total: 1000 sent
  │
  └── If rate limited mid-batch:
      ├── Retry after cooldown
      ├── Max 3 retries per batch
      └── If still failing: mark remaining as failed
          └── Admin can "ส่งใหม่เฉพาะที่ไม่สำเร็จ" (resend failed)
```

#### E8.6: Scheduled announcement — LINE token expired before send time
```
Admin schedules announcement for next week
  │
  ├── Cron: process-scheduled-broadcasts runs
  ├── Invokes send-broadcast
  ├── LINE API returns: 401 (invalid token)
  │
  ├── Announcement status: "failed"
  ├── Error logged: "LINE Channel Access Token expired"
  │
  ├── Admin notification:
  │   "ส่งประกาศตามกำหนดไม่สำเร็จ: LINE token หมดอายุ
  │    กรุณาอัปเดต token ในหน้าตั้งค่า แล้วส่งประกาศใหม่"
  │
  └── Admin can: fix token → resend from announcement detail page
```

#### E8.7: Save as draft → edit later → send
```
Admin creates announcement → saves as draft
  │
  ▼
/admin/announcements — status: "draft" badge
  │
  ├── Tap to edit → /admin/announcements/[id]
  ├── Edit content, change target
  ├── Options: "อัปเดตแบบร่าง" / "ส่ง" / "ตั้งเวลา"
  │
  └── Edge case: another admin deletes the draft
      ├── When this admin saves: 404
      └── Show: "ประกาศนี้ถูกลบแล้ว"
          └── Offer: "สร้างใหม่จากเนื้อหานี้" (carry over content)
```

#### E8.8: Recurring schedule edge cases
```
Admin sets recurring: ทุกวันจันทร์ เวลา 09:00
  │
  ├── Cron runs every Monday 09:00
  │   └── Creates new announcement copy + sends
  │
  ├── Edge case: Monday is a holiday
  │   └── Still sends (no holiday awareness)
  │       └── Future: add holiday calendar skip option
  │
  ├── Edge case: Admin deletes the original
  │   └── Recurring stops (no source to copy from)
  │       └── Admin notification: "ประกาศซ้ำหยุดทำงาน เนื่องจากประกาศต้นฉบับถูกลบ"
  │
  └── Edge case: Tag has no members anymore
      └── Recurring runs but sends to 0 people
          └── Log warning, don't mark as failed
```

---

## 9. Announcement — View (Student)

### Happy Path

```
/announcements
  │
  ├── Pinned section (top):
  │   └── [📌 ปิดน้ำชั่วคราว ชั้น 3-5]
  │
  ├── All announcements (newest first):
  │   ├── [ประชุมนิสิตหอพัก — 12 ก.พ. 2569] (unread dot 🔵)
  │   ├── [ค่าน้ำค่าไฟเดือน ม.ค. — 10 ก.พ. 2569]
  │   └── [กิจกรรม Welcome — 5 ก.พ. 2569]
  │
  ├── Tap on announcement
  │
  ▼
/announcements/[id]
  │
  ├── Full content displayed
  ├── Auto-mark as read (on view)
  └── Back to list (unread dot removed)
```

### Edge Cases

#### E9.1: No announcements
```
/announcements
  │
  ├── Empty state:
  │   ├── Illustration
  │   └── "ยังไม่มีประกาศ"
```

#### E9.2: Announcement expired
```
Student opens /announcements/[id] → announcement has expire_at < now
  │
  ├── Option A: Still show but with banner
  │   └── "ประกาศนี้หมดอายุแล้ว"
  │
  └── Option B: Hide from list entirely
      └── Direct URL shows 404: "ไม่พบประกาศนี้"
```

#### E9.3: Announcement deleted by admin while student is viewing
```
Student is reading /announcements/[id]
  │
  ├── Admin deletes announcement
  ├── (No realtime for announcements — student won't know until refresh)
  │
  └── If student navigates away and back:
      └── Announcement gone from list
```

---

## 10. Notification Flow

### Happy Path

```
Event triggers notification:
  │
  ├── Maintenance status change → notification type: "maintenance"
  ├── New announcement published → notification type: "announcement"
  ├── Bill generated → notification type: "bill"
  ├── Parcel arrived → notification type: "parcel"
  │
  ├── System creates notification record in DB
  │
  ├── Delivery channels:
  │   ├── In-app: notification appears in /notifications
  │   │   └── Unread count badge updates (header bell)
  │   │
  │   └── LINE push: send via LINE Messaging API
  │       └── Student sees push notification on phone
  │
  └── Student opens /notifications → sees notification
      └── Tap → mark as read + navigate to related page
```

### Edge Cases

#### E10.1: Student has LINE notifications disabled (phone settings)
```
LINE push sent → phone doesn't show notification
  │
  ├── Not detectable by our system
  ├── In-app notification still visible
  └── No action needed (phone setting, not our control)
```

#### E10.2: Many notifications at once (e.g., bulk announcement)
```
Admin sends broadcast → 1 announcement notification per student
  │
  ├── If student has multiple: show newest first
  ├── Group by type if many (future):
  │   └── "3 ประกาศใหม่" (collapsed)
  │
  └── Badge shows count (capped at "99+")
```

#### E10.3: Mark all as read
```
Student taps "อ่านทั้งหมด" button
  │
  ├── Batch update: SET is_read = true WHERE user_id = me AND is_read = false
  ├── Badge count → 0
  └── All dots removed from list
```

#### E10.4: Notification for deleted content
```
Student receives notification: "แจ้งซ่อมของคุณเสร็จสิ้น"
  │
  ├── Taps notification → navigate to /maintenance/[id]
  │
  ├── But the request was deleted
  │
  └── Show: "ไม่พบรายการแจ้งซ่อมนี้"
      └── Back button → /notifications
```

---

## 11. Student Management (Admin)

### Happy Path

```
/admin/students
  │
  ├── View table of all students
  ├── Search by name or student ID
  ├── Filter by building, floor, tags
  │
  ├── Tap "+ เพิ่มนิสิต"
  │   ├── Fill form (name, student ID, room, LINE UID)
  │   ├── Assign tags
  │   └── Save → new row in table
  │
  ├── Tap on student row → /admin/students/[id]
  │   ├── View full profile
  │   ├── Edit info
  │   ├── View maintenance history
  │   └── Manage tags
  │
  └── Sync LINE followers
      ├── Invoke sync-line-followers edge function
      ├── Match LINE UIDs with existing profiles
      └── Toast: "ซิงค์เรียบร้อย — 3 บัญชีใหม่, 1 บัญชีถูกบล็อค"
```

### Edge Cases

#### E11.1: Import CSV with errors
```
Admin uploads CSV file
  │
  ├── Parse CSV
  │
  ├── Row 15: student_id is empty
  │   └── Skip row, add to error report
  │
  ├── Row 23: duplicate student_id (already in DB)
  │   └── Skip row, add to error report
  │
  ├── Row 45: building "ตึก99" doesn't exist
  │   └── Skip row, add to error report
  │
  ├── Import result dialog:
  │   ├── ✅ นำเข้าสำเร็จ: 42 คน
  │   ├── ❌ ข้อผิดพลาด: 3 รายการ
  │   │   ├── แถว 15: ไม่มีรหัสนิสิต
  │   │   ├── แถว 23: รหัสนิสิตซ้ำ (6430000021)
  │   │   └── แถว 45: ไม่พบตึก "ตึก99"
  │   └── "ดาวน์โหลดรายงานข้อผิดพลาด" (CSV)
```

#### E11.2: Delete student with active requests
```
Admin tries to delete student who has pending maintenance requests
  │
  ├── Confirmation dialog:
  │   "นิสิตคนนี้มีคำขอแจ้งซ่อมค้าง 2 รายการ
  │    ต้องการลบนิสิตและยกเลิกคำขอทั้งหมดหรือไม่?"
  │   ├── "ลบ" → soft delete (status: inactive), cancel pending requests
  │   └── "ยกเลิก"
```

#### E11.3: LINE follower sync — new followers
```
sync-line-followers edge function
  │
  ├── Get follower list from LINE API
  ├── Compare with profiles.line_uid
  │
  ├── New follower (UID not in profiles):
  │   └── Cannot auto-create profile (no student_id)
  │       └── Add to "unlinked followers" list for admin to match manually
  │
  ├── Existing follower unfollowed:
  │   └── Update profile: line_status = "unfollowed"
  │       └── Can no longer send LINE messages to this student
  │
  └── Summary toast: "ซิงค์สำเร็จ — 5 ใหม่, 2 ยกเลิกติดตาม"
```

---

## 12. Profile & Dorm Card (Student)

### Happy Path

```
/profile
  │
  ├── Digital Dorm Card (visual card):
  │   ├── Photo, name, student ID
  │   ├── Building, floor, room, bed
  │   └── QR Code
  │
  ├── Personal info section
  │
  ├── Settings:
  │   ├── Change language → UI switches immediately
  │   └── Notification preferences
  │
  └── Logout button
```

### Edge Cases

#### E12.1: Change language
```
Student on Thai UI → taps "English"
  │
  ├── Update profile.language = "en"
  ├── Update locale cookie
  ├── Redirect: /th/profile → /en/profile
  └── All UI switches to English
```

#### E12.2: Profile photo update fails
```
Student taps profile photo → select new photo
  │
  ├── Upload to Supabase Storage → fails
  ├── Show: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่"
  └── Keep old photo (don't remove existing)
```

#### E12.3: QR Code screenshot
```
Student takes screenshot of dorm card
  │
  ├── QR contains: encrypted student_id + timestamp
  ├── QR is valid for check-in (Phase 8)
  └── Static QR: valid indefinitely (or until room change)
```

#### E12.4: Logout confirmation
```
Student taps "ออกจากระบบ"
  │
  ├── Confirmation dialog:
  │   "ต้องการออกจากระบบหรือไม่?"
  │   ├── "ออกจากระบบ" → clear session → /login
  │   └── "ยกเลิก" → stay
```

---

## 13. Session Lifecycle & Auth Edge Cases

### E13.1: Session expired — passive detection

```
Student browses app → session cookie expires (default: 1 hour)
  │
  ├── Next API call returns 401
  │
  ├── TanStack Query onError handler detects 401
  │   ├── Attempt silent refresh (Supabase auto-refresh)
  │   │   ├── Refresh token valid → new session → retry request
  │   │   └── Refresh token expired → redirect to /login
  │   │
  │   └── Show toast: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
  │
  └── Redirect to /login (preserve intended URL)
      └── After login → redirect back to original page
```

### E13.2: Role changed while logged in

```
Student is logged in
  │
  ├── Admin promotes student to "committee" role
  │
  ├── Student's next API call:
  │   ├── Middleware checks role → now "committee"
  │   ├── Profile refetch → user-store updates
  │   └── UI adapts (may show additional features)
  │
  └── Student navigates to /admin/dashboard
      ├── Middleware: role = "committee" → allowed (limited)
      └── Admin sidebar appears with limited items
```

### E13.3: Account deleted while logged in

```
Student is using the app
  │
  ├── Admin deletes student account
  │
  ├── Student's next API call:
  │   ├── Supabase returns: user not found
  │   ├── Session invalidated
  │   └── Redirect to /login
  │
  └── Show: "บัญชีของคุณถูกระงับ กรุณาติดต่อเจ้าหน้าที่หอพัก"
```

### E13.4: Concurrent sessions (multiple devices)

```
Student logged in on phone + laptop
  │
  ├── Both sessions are valid independently
  │
  ├── Logout on phone:
  │   ├── Phone session cleared
  │   └── Laptop session remains active
  │       (Supabase sessions are device-independent)
  │
  └── Password change / account disable:
      └── All sessions invalidated on next API call
```

### E13.5: Accessing protected page while logged out

```
User opens direct URL: /th/maintenance/new (not logged in)
  │
  ├── Middleware: no session
  ├── Redirect to /th/login?redirect=/th/maintenance/new
  │
  ├── User logs in successfully
  └── Redirect to /th/maintenance/new (original intent)
```

### E13.6: Student tries to access admin pages

```
Student navigates to /th/admin/dashboard
  │
  ├── Middleware: session exists, role = "student"
  ├── Role check fails: student ∉ {admin, head, committee}
  │
  ├── Redirect to /th/dashboard (student dashboard)
  └── Toast: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
```

### E13.7: Admin tries to access student pages

```
Admin navigates to /th/dashboard (student dashboard)
  │
  ├── Middleware: session exists, role = "admin"
  │
  ├── Option A: Allow (admin can see student view)
  │   └── Show banner: "คุณกำลังดูในมุมมองนิสิต"
  │
  └── Option B: Redirect to admin dashboard
      └── Redirect to /th/admin/dashboard
```

---

## Appendix: Error Message Reference

### Thai Error Messages (i18n keys)

```json
{
  "errors": {
    "network": "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
    "sessionExpired": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    "unauthorized": "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    "notFound": "ไม่พบข้อมูลที่ค้นหา",
    "serverError": "เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง",
    "validationError": "กรุณาตรวจสอบข้อมูลที่กรอก",
    "fileTooLarge": "ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน {max}MB",
    "invalidFileType": "รองรับเฉพาะไฟล์ {types}",
    "uploadFailed": "อัปโหลดไม่สำเร็จ กรุณาลองใหม่",
    "duplicateEntry": "ข้อมูลนี้มีอยู่ในระบบแล้ว",
    "accountDisabled": "บัญชีถูกระงับ กรุณาติดต่อเจ้าหน้าที่",
    "rateLimited": "คุณลองหลายครั้งเกินไป กรุณารอ {minutes} นาทีแล้วลองใหม่",
    "loginFailed": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "lineAuthCancelled": "การเข้าสู่ระบบถูกยกเลิก กรุณาลองใหม่อีกครั้ง",
    "lineAuthExpired": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    "lineSendFailed": "ส่ง LINE ไม่สำเร็จ แจ้งเตือนในแอปเท่านั้น",
    "flexTooLarge": "Flex Message มีขนาดใหญ่เกินไป กรุณาลดเนื้อหา",
    "noTargetStudents": "ไม่มีนิสิตในกลุ่มที่เลือก",
    "tokenExpired": "LINE token หมดอายุ กรุณาอัปเดตในหน้าตั้งค่า",
    "bedOccupied": "เตียงนี้ถูกเลือกแล้ว กรุณาเลือกเตียงอื่น",
    "verificationExpired": "ลิงก์ยืนยันหมดอายุ กรุณาลงทะเบียนใหม่",
    "statusChangeInvalid": "ไม่สามารถเปลี่ยนสถานะกลับได้",
    "failureReasonRequired": "กรุณาระบุเหตุผลที่ซ่อมไม่สำเร็จ",
    "contentDeleted": "เนื้อหานี้ถูกลบแล้ว"
  }
}
```

### Error State UI Patterns

```
┌─────────────────────────────────────────────────────┐
│  INLINE FIELD ERROR                                  │
│                                                      │
│  ┌─────────────────────────────┐                    │
│  │ รหัสนิสิต                    │                    │
│  │ [643ABC          ]          │                    │
│  │ ⚠️ รหัสนิสิตต้องเป็นตัวเลข 10 หลัก              │
│  └─────────────────────────────┘                    │
│                                                      │
│  TOAST NOTIFICATION (bottom)                         │
│                                                      │
│  ┌─────────────────────────────────────┐            │
│  │ ❌ ส่งคำขอไม่สำเร็จ กรุณาลองใหม่     │            │
│  └─────────────────────────────────────┘            │
│                                                      │
│  EMPTY STATE (center of page)                        │
│                                                      │
│       [illustration]                                 │
│    ยังไม่มีรายการแจ้งซ่อม                              │
│    [+ แจ้งซ่อมใหม่]                                   │
│                                                      │
│  FULL PAGE ERROR (rare)                              │
│                                                      │
│       [error illustration]                           │
│    เกิดข้อผิดพลาด                                     │
│    ไม่สามารถโหลดข้อมูลได้                              │
│    [ลองใหม่]  [กลับหน้าหลัก]                          │
│                                                      │
│  CONFIRMATION DIALOG                                 │
│                                                      │
│  ┌─────────────────────────────────┐                │
│  │  ต้องการยกเลิกคำขอนี้หรือไม่?    │                │
│  │                                  │                │
│  │  [ยกเลิก]  [ยืนยัน]              │                │
│  └─────────────────────────────────┘                │
│                                                      │
│  LOADING STATE                                       │
│                                                      │
│       [spinner]                                      │
│    กำลังโหลด...                                       │
│                                                      │
│  BANNER WARNING (top of content)                     │
│                                                      │
│  ┌─────────────────────────────────────┐            │
│  │ ⚠️ ประกาศนี้หมดอายุแล้ว              │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Valid Status Transitions Reference

```
MAINTENANCE REQUEST STATUS MACHINE
═══════════════════════════════════

                    ┌─────────────┐
                    │   pending   │ (initial)
                    └──────┬──────┘
                           │
              student      │      admin
             cancels       │     acknowledges
                 │         │         │
                 ▼         ▼         ▼
          ┌──────────┐  ┌──────────────┐
          │cancelled │  │ acknowledged │
          └──────────┘  └──────┬───────┘
              (final)          │
                               │ admin starts work
                               ▼
                        ┌──────────────┐
                        │ in_progress  │
                        └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │                     │
                    ▼                     ▼
             ┌──────────┐         ┌──────────┐
             │completed │         │  failed  │
             └──────────┘         └──────────┘
               (final)         (final, requires
                                failure_reason)


ANNOUNCEMENT STATUS MACHINE
════════════════════════════

          ┌────────┐
          │ draft  │ (initial)
          └───┬────┘
              │
    ┌─────────┼──────────┐
    │                     │
    ▼                     ▼
┌──────────┐      ┌───────────┐
│   sent   │      │ scheduled │
└──────────┘      └─────┬─────┘
  (final)               │
                        │ cron triggers
                        ▼
               ┌──────────────┐
               │ sent / failed│
               └──────────────┘
                  (final)
```
