# Docs Changelog v1.1

> **Date**: 2026-02-14
> **Applies to**: PRD.md, ARCHITECTURE.md

---

## Review Analysis

After cross-referencing the PRD and Architecture docs with the actual codebases (c-madong-product + chula-dorm-connect), **8 issues** were identified across consistency, accuracy, completeness, and structural correctness.

---

## Issues Found & Fixes Applied

### Issue #1: Maintenance status enum inconsistency
**Severity**: High — data model conflict
**Location**: PRD sections 2.3.2, 2.3.3 | Architecture section 4.2

**Problem:**
Three different status enums existed across the codebase and docs:

| Source | Statuses |
|--------|----------|
| c-madong `types.ts` | `pending, acknowledged, in_progress, completed, cancelled` |
| Lovable DB | `new, received, in_progress, completed, failed` |
| PRD student view | `รอดำเนินการ → รับเรื่องแล้ว → กำลังดำเนินการ → เสร็จสิ้น/ยกเลิก` |
| PRD admin view | `new → received → in_progress → completed/failed` |

No single source of truth was defined.

**Fix:**
Created a **Unified Maintenance Status Flow** section in both PRD and Architecture:

```
pending → acknowledged → in_progress → completed
                                     → cancelled (student-initiated)
                                     → failed (admin, requires failure_reason)
```

This combines the best of both schemas:
- `pending` + `acknowledged` (from c-madong — clearer than `new/received`)
- `failed` (from Lovable — important for unresolvable issues)
- `cancelled` (from c-madong — student can cancel their own request)

Added a Thai label mapping table for i18n consistency.

---

### Issue #2: Phase 4 and Phase 7 overlap
**Severity**: Medium — project planning confusion
**Location**: PRD section 3

**Problem:**
Phase 4 (Announcements & Notifications) and Phase 7 (Broadcasting & AI) had significant overlap:
- Both mentioned broadcasting
- Both mentioned templates
- Phase 7's "scheduled broadcast processing" is integral to Phase 4's "scheduled announcements"
- AI writing assistant is embedded in Lovable's announcement editor (not separable)

Building announcements in Phase 4 without the broadcast engine would result in a half-functional feature, then Phase 7 would need to retroactively integrate into Phase 4's code.

**Fix:**
Merged Phase 4 + Phase 7 into a single **Phase 5: Announcements, Broadcasting & Notifications**. This phase now includes:
- Student-facing announcement list/detail
- Notification center
- Admin announcement CRUD + Flex editor
- Template library
- Broadcasting (send-broadcast edge function)
- Scheduling (process-scheduled-broadcasts edge function)
- AI features (generate-copy, generate-image edge functions)

---

### Issue #3: Phase dependency — tags needed before announcements
**Severity**: Medium — blocked feature at runtime
**Location**: PRD section 3

**Problem:**
Original phase order:
- Phase 4: Announcements (includes "tag-based targeting")
- Phase 5: Student Management & Tags (where tags are actually created)

You can't target announcements by tags if the tag system doesn't exist yet. Building Phase 4 first would mean either:
1. Skipping the targeting feature (rework later)
2. Building tags as part of Phase 4 (duplicating Phase 5 scope)

**Fix:**
Reordered phases:
- **Phase 4** → Student Management & Tags (create students, tags first)
- **Phase 5** → Announcements, Broadcasting & Notifications (can now use tags)
- **Phase 6** → Admin Dashboard & Analytics (uses data from phases 3-5)
- **Phase 7** → LINE LIFF Integration

Each phase now cleanly builds on the previous one.

---

### Issue #4: Missing privacy & data handling section
**Severity**: Medium — compliance gap
**Location**: PRD section 4 (Non-Functional Requirements)

**Problem:**
The PRD contained no mention of:
- How student PII (personal identifiable information) is handled
- LINE user data usage and storage boundaries
- Data retention or deletion policies
- Audit trail for admin actions
- Third-party data sharing concerns

For a university system handling student data, this is a significant gap.

**Fix:**
Added **section 4.6: Privacy & Data Handling** covering:
- Student PII protection (RLS-based access)
- LINE data scope (only display_name + UID, no chat history)
- Photo upload access control
- Data retention policy (1 academic year after move-out)
- Right to deletion (via admin request)
- Audit trail logging (status changes, broadcasts, student edits)
- Third-party boundaries (no PII sent to AI services)

---

### Issue #5: `students` table confusion in Architecture
**Severity**: High — data model contradiction
**Location**: Architecture sections 4.1, 4.2

**Problem:**
The Architecture doc was contradictory:
- Section 4.1 (DB Overview) listed `students` as a separate table: `students (from Lovable — LINE-linked records)`
- Section 4.2 (Reconciliation Plan) said to merge `students` into `profiles`
- The ER diagram showed both: `students (Lovable) ─── profiles`

This would confuse anyone implementing the integration — should there be 1 table or 2?

**Fix:**
- Removed `students` from section 4.1 database listing
- Added clear note in ER diagram: _"Lovable's `students` table is **merged into `profiles`**"_
- Replaced split schema (c-madong tables + Lovable tables) with a single **Unified Database Schema** showing the final merged state
- Added `display_name` and `status` fields to `profiles` (from Lovable's students table)
- Added `failure_reason`, `admin_notes` to `maintenance_requests`
- Added Lovable fields to `announcements` (flex_json, scheduling, etc.)
- Kept reconciliation table as a summary reference

---

### Issue #6: LINE OAuth flow oversimplified
**Severity**: High — incorrect implementation guidance
**Location**: Architecture section 5.1

**Problem:**
The auth flow diagram showed LINE OAuth flowing through a generic "LINE OAuth Provider" box to "Supabase Auth", implying Supabase handles LINE as a native OAuth provider.

**Reality:** Supabase does NOT have a built-in LINE OAuth provider. LINE Login requires a **custom implementation** using:
1. Next.js API route redirects user to LINE consent screen
2. LINE redirects back with auth code to our callback URL
3. Our callback route exchanges the code for a LINE access token
4. Our callback route gets the LINE profile (user_id, display_name)
5. Our callback route uses Supabase Admin SDK to find/create a user and create a session
6. Session cookies are set, user is redirected

The original diagram would lead a developer to try configuring LINE as a Supabase provider (which doesn't exist) and waste time.

**Fix:**
Replaced with a detailed 4-party sequence diagram showing:
- Student Browser → Next.js API Routes → LINE API → Supabase
- Each step numbered with clear data flow
- Added note: _"LINE is **not** a built-in Supabase OAuth provider"_
- Listed required API routes: `/api/auth/line`, `/api/auth/callback`, `/api/auth/logout`

---

### Issue #7: Missing `supabase/` folder and API routes structure
**Severity**: Medium — incomplete architecture
**Location**: Architecture (missing sections)

**Problem:**
The architecture doc described Edge Functions and database schema but never showed:
- Where `supabase/` directory lives in the unified project
- How SQL migrations are organized
- The `src/app/api/` route structure
- How the Lovable edge functions map to the unified project

A developer picking up this project wouldn't know where to put things.

**Fix:**
Added two new sections:

**Section 10: Project Folder Structure (Unified)** — Complete tree showing:
- `src/app/api/auth/` routes
- `src/components/admin/` for ported Lovable components
- `supabase/migrations/` with numbered migration files
- `supabase/functions/` with all 7 edge functions
- `docs/` folder

**Section 11: API Routes** — Detailed breakdown of:
- Auth routes (line, callback, logout)
- Future routes (webhooks, upload)
- Example route handler code pattern

---

### Issue #8: No testing or error handling strategy
**Severity**: Medium — operational gap
**Location**: Architecture (missing sections)

**Problem:**
The architecture doc had no guidance on:
- How errors are handled (client-side and server-side)
- What happens when API calls fail
- Error boundary placement
- Testing approach, tools, or priority
- Test file organization

**Fix:**
Added two new sections:

**Section 14: Error Handling Strategy** covering:
- Client-side: Error Boundaries (per layout), TanStack Query error callbacks, Zod validation errors, Toast notifications
- Server-side: API route try/catch, Edge Function error logging, middleware fallbacks
- Consistent error response format with `code`, `message`, `details`

**Section 15: Testing Strategy** covering:
- Tool choices: Vitest (unit/component/integration), Playwright (e2e future)
- Test organization (colocated or `__tests__/` directory)
- Testing priority order: validators → utils → stores → API routes → UI flows

---

## Summary of Changes

### PRD.md (v1.0 → v1.1)

| Section | Change |
|---------|--------|
| Header | Version 1.0 → 1.1, added changelog link |
| 2.3 | Added "Unified Maintenance Status Flow" with status table |
| 2.3.2 | Updated to reference unified status, added cancel capability |
| 2.3.3 | Updated to reference unified status |
| 3 (Phases) | Reordered: Phase 4→Students/Tags, Phase 5→Announcements+Broadcasting (merged 4+7), Phase 6→Analytics, Phase 7→LIFF |
| 4.6 | NEW: Privacy & Data Handling section |

### ARCHITECTURE.md (v1.0 → v1.1)

| Section | Change |
|---------|--------|
| Header | Version 1.0 → 1.1, added changelog link |
| 4.1 | Removed `students` table, clarified existing tables |
| 4.2 ER | Added merge note, removed `students (Lovable)` reference |
| 4.2 Schema | Replaced split schemas with single Unified Database Schema |
| 4.2 | Added Maintenance Status Enum section |
| 5.1 | Replaced simplified OAuth diagram with detailed 4-party custom flow |
| 5.1 | Added required API routes list |
| 10 | NEW: Project Folder Structure (Unified) |
| 11 | NEW: API Routes section with code example |
| 14 | NEW: Error Handling Strategy |
| 15 | NEW: Testing Strategy |
| 12→13 | Section renumbered (Deployment → 12) |
| 13 | Section renumbered (Security → 13) |
| 16 | Section renumbered (Monitoring → 16) |

### Files Modified
- `docs/PRD.md` — 6 edits
- `docs/ARCHITECTURE.md` — 9 edits
- `docs/CHANGELOG-v1.1.md` — Created (this file)
