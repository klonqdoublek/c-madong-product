# Phase 9: UX/UI Polish & Consistency — Refined Plan

## Context
C-Madong has 8 phases deployed with 45+ pages. Rapid feature development left visual inconsistencies — hardcoded colors, mixed patterns, incomplete i18n. Phase 9 consolidates everything into a polished product.

## Audit Results (real codebase scan)
- **18 hardcoded hex colors** in components
- **200+ non-token Tailwind color classes** (bg-blue-100, border-l-red-400, etc.)
- **100+ hardcoded Thai strings** across 25+ files
- **13 toast messages** not using i18n
- **12 window.confirm/alert** instances (6 real, 6 in prototype/mock pages)
- **4 duplicate Thai month arrays**
- **3 duplicate TAG_COLORS arrays**, **5 duplicate STATUS_COLORS maps**
- **34 console.log/error** in lib code (30) + components (4)
- **0 @ts-ignore/@ts-nocheck** (already cleaned)
- **0 raw HTML buttons/inputs** in admin (all use shadcn)
- **3 student pages missing loading skeletons**
- Existing tokens: CU brand palette + ticket status + chart colors + shadow utilities + animations (no duration tokens, no reduced-motion, no semantic status tokens)

---

## WP1: Code Cleanup & Deduplication
**Goal**: Consolidate duplicate constants before other WPs reference them
**Effort**: Small (1-2 hours) | **Impact**: Foundation for WP2-WP4

**Tasks**:
1. Create `src/lib/constants/colors.ts` — single source for:
   - `TAG_COLORS` (merge 3 definitions: `src/types/tags.ts:7`, `knowledge/tag-management-dialog.tsx:16`, `organize/create-tag-dialog.tsx:20`)
   - `STATUS_COLORS` for maintenance tickets (merge: `dashboard-recent-section.tsx:17`, `repair-notification.ts:11`)
   - `ANNOUNCEMENT_STATUS_COLORS` (from `announcements-page-content.tsx:10`)
   - `DOCUMENT_STATUS_COLORS` (from `knowledge/file-table.tsx:33`)
   - `PARCEL_STATUS_COLORS` (from `parcels-page-content.tsx:10` + admin version `:17`)
   - `BILL_STATUS_COLORS` — already exported from `billing-constants.ts`, keep there
2. Create `src/lib/utils/date-format.ts` — consolidate:
   - `THAI_MONTHS_SHORT` (from `dashboard-events-section.tsx:9`, `dashboard-announcements.tsx:148`, `events-page-content.tsx:27`)
   - `THAI_MONTHS_FULL` — already in `billing-constants.ts:13`, re-export
   - `formatRelativeTime(date)` helper (from `notification-item.tsx:42-48`, `dashboard-recent-section.tsx:45-48`)
3. Create `src/lib/constants/flex-colors.ts` — centralize LINE Flex hex colors used across 6 flex-builders
4. Clean `console.log` in components (4 in `src/components/admin/roles/`). Keep `console.error` in `src/lib/` (server-side logging is fine)

**Files modified**: ~15 files (3 new constants, 12 imports updated)

---

## WP2: Design Tokens — New CSS Vars
**Goal**: Add missing semantic tokens in `globals.css` so WP3 can use them
**Effort**: Small (30 min) | **Impact**: HIGH — enables token compliance

**New tokens in `globals.css` `@theme` block**:
```css
/* Warm background (profile pages gradient end) */
--color-cu-warm-bg: #f5f2ea;

/* Score bar colors */
--color-score-mandatory: #DD598B;
--color-score-external: #FFF3D2;
--color-score-internal: #CFFFCD;

/* Semantic status */
--color-status-success-bg: oklch(0.95 0.05 145);
--color-status-success-text: oklch(0.45 0.12 145);
--color-status-warning-bg: oklch(0.95 0.06 85);
--color-status-warning-text: oklch(0.50 0.12 85);
--color-status-error-bg: oklch(0.95 0.06 25);
--color-status-error-text: oklch(0.50 0.15 25);
--color-status-info-bg: oklch(0.95 0.04 245);
--color-status-info-text: oklch(0.45 0.12 245);

/* Duration tokens */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

**Also add** `prefers-reduced-motion` in `@layer base`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Files modified**: 1 (`globals.css`)

---

## WP3: Design Token Compliance (colors)
**Goal**: Replace hardcoded colors with tokens/CSS vars
**Effort**: Medium (2-3 hours) | **Impact**: HIGH — visual consistency

**Hardcoded hex → CSS var**:
| File | Current | New |
|------|---------|-----|
| `profile-score-section.tsx:9-11` | `#DD598B`, `#FFF3D2`, `#CFFFCD` | `var(--color-score-mandatory)` etc |
| `profile-content.tsx:27`, `settings-content.tsx:27`, `dorm-card-content.tsx:27` | `to-[#f5f2ea]` | `to-cu-warm-bg` |
| `profile-content.tsx:48`, `settings-menu-item.tsx:33`, `profile-score-section.tsx:48` | `text-[#565655]` | `text-cu-grey` (already a token!) |
| `dashboard-status-card.tsx:93,113` | `backgroundColor: cat.color \|\| "#DD598B"` | `\|\| "var(--color-cu-pink)"` or fallback to token |
| `dashboard-attendance-chart.tsx:13-15` | `#DD598B`, `#FBBF24`, `#60A5FA` | Use `chart-1`/`chart-2`/`chart-3` vars |

**Non-token Tailwind → semantic or keep**: Many `bg-green-100 text-green-700` etc are **status patterns** used consistently (success=green, warning=amber, error=red, info=blue). These are standard Tailwind semantic colors — replacing them ALL with custom tokens would be over-engineering. Instead:
- **Replace** the 5 high-frequency status color combos with utility classes (see WP4 StatusBadge)
- **Keep** one-off Tailwind colors for admin dashboard icon backgrounds (they're intentionally varied)
- **Replace** only the hardcoded hex values and inline styles

**Files modified**: ~10 files

---

## WP4: Consistent Component Patterns
**Goal**: StatusBadge pattern + window.confirm → AlertDialog
**Effort**: Medium (2-3 hours) | **Impact**: HIGH — UX consistency

**Task 1: StatusBadge utility** — Create `src/components/ui/status-badge.tsx`
- Variants: `success`, `warning`, `error`, `info`, `neutral`
- Used by: billing status, parcel status, announcement status, document status, ticket status
- Maps to semantic tokens from WP2
- Replaces inline `<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">` pattern (used in 8+ files)

**Task 2: Replace window.confirm/alert** (6 real instances, skip 6 mock/prototype):
| File | Line | Replace with |
|------|------|-------------|
| `roles-list.tsx` | 45, 53 | shadcn `AlertDialog` |
| `user-roles-dialog.tsx` | 80, 85, 93 | shadcn `AlertDialog` |
| `events-page-content.tsx` | 46 | Already uses `t("deleteConfirm")` — just needs AlertDialog wrapper |
| `bill-detail-content.tsx` | 79 | Already uses `t("deleteConfirm")` — wrap in AlertDialog |

**Task 3: Standardize shadows** — 3 shadow utilities already exist (`shadow-card`, `shadow-hover`, `shadow-soft`). Audit components using custom `shadow-[...]` or inline box-shadow and replace with these utilities.

**Files modified**: ~12 files (1 new component, 11 updated)

---

## WP5: i18n Completeness
**Goal**: Zero hardcoded strings in components
**Effort**: Medium-Large (3-4 hours) | **Impact**: HIGH — user-facing text correctness

**Category 1: Time formatting** (move to i18n + shared util)
- `notification-item.tsx:42-48` — "เมื่อกี้", "นาทีที่แล้ว", "ชม.ที่แล้ว", "วันที่แล้ว"
- `dashboard-recent-section.tsx:45-48` — same pattern
- `chat-modal.tsx:31-32` — "วันนี้", "เมื่อวาน"
- → Add keys `common.time.justNow/minutesAgo/hoursAgo/daysAgo/today/yesterday` to `th.json`+`en.json`
- → Use shared `formatRelativeTime()` from WP1

**Category 2: Toast messages** (13 instances)
- `create-bill-form.tsx:166,169` — 2 toasts
- `bill-detail-content.tsx:63,65,72,74,82,85` — 6 toasts
- `billing-page-content.tsx:123,126,131` — 3 toasts
- `assign-role-dialog.tsx:98` — 1 toast
- → Add keys under `admin.billing.toast.*`, `admin.roles.toast.*`

**Category 3: Admin page hardcoded Thai** (highest volume)
- `events-page-content.tsx` — table headers, filter options, badge text (~15 strings)
- `scores-page-content.tsx` — table headers, placeholder, empty state (~10 strings)
- `add-score-dialog.tsx` — labels, placeholders, buttons (~10 strings)
- `admin-profile-content.tsx` — section titles, labels (~15 strings)
- `parcels-page-content.tsx` (admin) — status labels, filter options (~10 strings)
- `register-parcel-form.tsx` — parcel types (~6 strings)
- `attendance-page-content.tsx` — button text
- `roles-list.tsx`, `user-roles-dialog.tsx`, `assign-role-dialog.tsx` — dialog labels (~20 strings)
- `role-badge.tsx` — "ไม่มีตำแหน่ง", "เลือกตำแหน่ง", select options (~5 strings)
- `admin-shell.tsx:305,436` — "ออกจากระบบ"
- `billing-page-content.tsx:271` — "เลือกทั้งหมด"
- → Add namespaced keys to `th.json`+`en.json` under `admin.*`

**Category 4: Student page hardcoded Thai**
- `dashboard-status-card.tsx:129-133` — building names (keep as data, not i18n — from DB)
- `dashboard-events-section.tsx:53` — empty state text
- `parcels-page-content.tsx:10-14` — status labels
- → Add keys under `student.*`

**Category 5: Maintenance forms**
- `new-request-form.tsx:36-44` — 9 category titles
- → Add keys under `maintenance.categories.*`

**Files modified**: ~25 component files + `th.json` + `en.json` (~80+ new keys each)

---

## WP6: Loading, Empty & Error States
**Goal**: Consistent feedback states
**Effort**: Medium (2 hours) | **Impact**: HIGH — perceived quality

**Task 1: Shared EmptyState component** — `src/components/ui/empty-state.tsx`
- Props: `icon`, `title`, `description`, `action?: { label, onClick }`
- Replace ad-hoc empty states in: `dashboard-events-section.tsx:53`, `scores-page-content.tsx:108`, `assign-role-dialog.tsx:144`, `user-roles-dialog.tsx:150`

**Task 2: Add loading skeletons** to 3 missing pages:
- `bill-detail-content.tsx` — replace "Loading..." text with skeleton
- `settings-content.tsx` — add skeleton for toggle switches
- `dorm-card-content.tsx` — add skeleton for card image

**Task 3: Loading buttons** — Add `disabled={isPending}` + spinner to:
- `create-bill-form.tsx` submit button
- `add-score-dialog.tsx` submit button
- `register-parcel-form.tsx` submit button
- `event-form-dialog.tsx` submit button (already has "กำลังบันทึก..." text, needs spinner)
- `assign-role-dialog.tsx` submit button

**Files modified**: ~10 files (1 new component, 9 updated)

---

## WP7: Spacing & Layout
**Goal**: Uniform spacing rhythm
**Effort**: Small (1 hour) | **Impact**: MEDIUM

**Tasks**:
1. Fix `pb-28` → `pb-24` on profile pages: `profile-content.tsx`, `settings-content.tsx`, `dorm-card-content.tsx` (3 files)
2. Add `truncate` / `line-clamp-2` to long text in: notification titles (`notification-item.tsx`), ticket titles in dashboard (`dashboard-recent-section.tsx`), announcement titles
3. Verify `space-y-` consistency: student pages use `space-y-4`/`space-y-6` (both acceptable based on content density — no change needed)
4. Card padding is already consistent (`p-4` standard, `p-3` compact, `p-6` feature — intentional)

**Files modified**: ~6 files

---

## WP8: Accessibility
**Goal**: WCAG AA for interactive elements
**Effort**: Small (1 hour) | **Impact**: MEDIUM

**Tasks**:
1. Add `aria-label` to:
   - Bottom nav mascot button (`bottom-nav.tsx`)
   - Page header notification bell (`page-header.tsx`)
   - Chat modal send/close buttons (`chat-modal.tsx`)
   - Photo uploader add/remove buttons (`photo-uploader.tsx`)
2. Add `focus-visible:ring-2 focus-visible:ring-ring` to:
   - Bottom nav items
   - Category picker buttons (`category-picker.tsx`)
3. `prefers-reduced-motion` — already in WP2
4. Color contrast: `text-cu-muted` (#818181) on white = 4.07:1 ratio — **passes AA for normal text** (4.5:1 minimum is for small text <14px bold / <18px regular; our body text is 16px). No action needed.

**Files modified**: ~5 files

---

## WP9: Animation & Micro-interactions
**Goal**: Polished motion with consistent tokens
**Effort**: Small (1 hour) | **Impact**: LOW — polish feel

**Tasks**:
1. Duration tokens already defined in WP2 (`--duration-fast/normal/slow`)
2. Replace hardcoded `duration-300`, `duration-200` etc with token-based classes where used
3. Existing animations are solid (`fade-in`, `fade-in-up`, `fade-in-scale`, `gentle-bounce`, stagger delays) — no new animations needed
4. Add `transition-colors` to hover states missing it (audit during implementation)

**Files modified**: ~5 files

---

## Priority & Execution Order

| # | WP | Effort | Impact | Why this order |
|---|-----|--------|--------|----------------|
| 1 | WP1: Code Cleanup | Small | Foundation | Constants must exist before other WPs import them |
| 2 | WP2: Design Tokens | Small | HIGH | CSS vars must exist before WP3 uses them |
| 3 | WP3: Token Compliance | Medium | HIGH | Replace hardcoded colors with new tokens |
| 4 | WP4: Component Patterns | Medium | HIGH | StatusBadge + AlertDialog |
| 5 | WP5: i18n | Medium-Large | HIGH | Largest WP, most user-facing impact |
| 6 | WP6: Loading/Empty/Error | Medium | HIGH | Perceived quality |
| 7 | WP7: Spacing | Small | MEDIUM | Quick wins |
| 8 | WP8: Accessibility | Small | MEDIUM | Compliance |
| 9 | WP9: Animation | Small | LOW | Final polish |

**Total effort**: ~14-18 hours across all 9 WPs

---

## What's NOT in scope (intentional)
- **Raw HTML inputs/selects in admin** — audit found 0 instances, all already use shadcn
- **@ts-ignore/@ts-nocheck** — audit found 0 remaining
- **console.error in src/lib/** — server-side error logging is appropriate, keep it
- **Responsive polish** — merged into individual WPs where relevant; no standalone WP needed since admin tables already use responsive patterns
- **Figma-to-code pixel audit** — separate from code polish, do after Phase 9
- **Performance/SEO/Error Boundary** — separate Phase 9.5 or post-launch tasks
- **Dark mode testing** — tokens exist but no users on dark mode yet
- **Mock/prototype pages** (`announcements/organize`, `announcements/prototype`) — these use `alert()` intentionally for demo purposes

## Verification
- `next build` after each WP to catch type errors
- i18n: switch locale to `en`, verify no Thai leaks in fixed components
- Visual spot-check: profile, billing, parcels, dashboard pages
- Accessibility: browser devtools axe-core audit on student dashboard + profile
