# Dorm Score & Activities — Reference Document

> Source of truth for Phase 5 implementation. Based on the Activities Impact Matrix (2026-03).

---

## 1. Activity Impact Matrix

### High Impact (ส่งผลสถานภาพ — ไม่เกี่ยว Dorm Score)

These obligations directly affect student residency status. Missing them leads to **contract termination / eviction**, not score deductions.

| # | Activity | Thai Name | Deadline Type | Consequence |
|---|----------|-----------|---------------|-------------|
| 1 | Dorm Application (ยื่นขออยู่หอ) | ยื่นคำร้องขออยู่หอพัก | Academic calendar | Loss of dorm placement |
| 2 | CR54 Registration | ลงทะเบียน CR54 | Semester start | Contract void |
| 3 | Dorm Fee Payment (จ่ายค่าหอ) | ชำระค่าธรรมเนียมหอพัก | Monthly/semester | Eviction after grace period |

### Medium Impact (ถูกตัดคะแนนหอพัก — Dorm Score)

These are **mandatory activities**. Absence results in **penalty point deduction** from Dorm Score.

| # | Activity | Thai Name | Category | Points | Penalty |
|---|----------|-----------|----------|--------|---------|
| 4 | Dorm Meeting (ประชุมหอ) | ประชุมนิสิตหอพัก | meetings | +5 | -10 |
| 5 | Shop Evaluation (ประเมินร้านค้า) | ประเมินร้านค้าหอพัก | activities | +3 | -5 |
| 6 | Fire Drill (อบรมดับเพลิง) | ฝึกอบรมดับเพลิง/ซ้อมอพยพ | activities | +5 | -8 |

### Low/No Impact (ไม่กระทบ Dorm Score)

Optional or service-type activities. No score effect.

| # | Activity | Thai Name | Notes |
|---|----------|-----------|-------|
| 7 | Maintenance Request (แจ้งซ่อม) | แจ้งซ่อมบำรุง | Service ticket, tracked separately |
| 8 | Parcel Pickup (รับพัสดุ) | รับพัสดุ | Notification only |
| 9 | Laundry Machine (เครื่องซักผ้า) | จองเครื่องซักผ้า | Booking system |
| 10 | Common Room Booking (จองห้องส่วนกลาง) | จองห้องส่วนกลาง | Booking system |
| 11 | Dorm Activities (กิจกรรมหอพัก) | กิจกรรมหอพักทั่วไป | Optional, may earn bonus points |

---

## 2. Dorm Score System

### Score Categories (4 categories)

| Category | Slug | Weight | Max Score | Description |
|----------|------|--------|-----------|-------------|
| กิจกรรมหอพัก (Activities) | `activities` | 40% | 100 | Participation in dorm events, evaluations, drills |
| บำเพ็ญประโยชน์ (Community Service) | `community_service` | 20% | 100 | Volunteer work, dorm maintenance contributions |
| ระเบียบวินัย (Rules Compliance) | `rules` | 25% | 100 | Rule adherence, no violations, curfew compliance |
| ประชุมหอพัก (Meetings) | `meetings` | 15% | 100 | Attendance at mandatory dorm meetings |

### Scoring Rules

- Each category starts at a **base score of 80** (out of 100) at the beginning of each semester
- **Positive entries**: Attending events, completing tasks → add points (capped at category max 100)
- **Negative entries**: Absence from mandatory events, rule violations → deduct points (floor at 0)
- Points are **per-event**: each mandatory event has defined `score_points` (for attendance) and `penalty_points` (for absence)

---

## 3. Activity-to-Category Mapping

| Activity | Score Category | Auto-Score? | Points | Penalty |
|----------|---------------|-------------|--------|---------|
| Dorm Meeting | `meetings` | Yes (attendance trigger) | +5 | -10 |
| Shop Evaluation | `activities` | Yes (attendance trigger) | +3 | -5 |
| Fire Drill | `activities` | Yes (attendance trigger) | +5 | -8 |
| Volunteer Events | `community_service` | Yes (attendance trigger) | +3~5 | 0 (optional) |
| Optional Activities | `activities` | Yes (attendance trigger) | +2~3 | 0 (optional) |
| Rule Violation | `rules` | No (manual admin entry) | 0 | -5~20 |
| Good Conduct Bonus | `rules` | No (manual admin entry) | +5 | 0 |

---

## 4. Composite Score Calculation

### Formula

```
composite_score = Σ (category_score × category_weight)
```

Where:
- `category_score` = base_score + Σ(positive entries) - Σ(negative entries), clamped to [0, max_score]
- `category_weight` = as defined in score_categories table

### Example

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Activities | 85 | 0.40 | 34.0 |
| Community Service | 80 | 0.20 | 16.0 |
| Rules | 95 | 0.25 | 23.75 |
| Meetings | 70 | 0.15 | 10.5 |
| **Composite** | | | **84.25** |

### Materialized View

Pre-aggregated in `student_score_summary` materialized view for fast dashboard queries. Refreshed after score changes via `refresh_score_summary()`.

---

## 5. High-Impact Obligations (Separate from Scoring)

High-impact items (Application, CR54, Fee Payment) are tracked as `event_type = 'obligation'` with `impact_level = 'high'` in `dorm_events`.

### Tracking

- Each obligation has a **deadline** (`end_datetime`)
- Students see **status warnings** when deadlines approach
- Admin can mark obligations as completed per student
- Missing an obligation → **escalation** (not score deduction)

### Notification Timeline

| Days Before Deadline | Action |
|---------------------|--------|
| 14 days | First reminder (LINE push) |
| 7 days | Second reminder (LINE push + in-app) |
| 3 days | Urgent warning (LINE push + in-app banner) |
| 0 days (deadline) | Escalation to admin |

---

## 6. Score → Renewal Impact

Low dorm scores reduce contract renewal priority:

| Composite Score | Renewal Priority | Notes |
|----------------|-----------------|-------|
| 90-100 | Priority 1 | Guaranteed renewal |
| 75-89 | Priority 2 | Standard renewal |
| 60-74 | Priority 3 | Conditional renewal (may need interview) |
| Below 60 | At Risk | Subject to review committee decision |

This mapping is advisory — final renewal decisions are made by the head registrar considering multiple factors.

---

## 7. Database Tables Involved

| Table | Purpose |
|-------|---------|
| `score_categories` | 4 scoring categories with weights |
| `dorm_events` | All events (meetings, drills, obligations, optional) |
| `event_attendance` | Per-student attendance records |
| `score_entries` | Individual score additions/deductions |
| `student_score_summary` | Materialized view for fast composite queries |

---

## 8. RBAC Permissions (Already Defined)

| Permission | Roles |
|------------|-------|
| `EVENTS_VIEW` | All authenticated |
| `EVENTS_CREATE` | activity, admin_staff, super_admin, head |
| `EVENTS_UPDATE` | activity, admin_staff, super_admin, head |
| `EVENTS_DELETE` | super_admin, head |
| `SCORES_VIEW` | All authenticated (own) / admin (all) |
| `SCORES_MANAGE` | activity, admin_staff, super_admin, head |
