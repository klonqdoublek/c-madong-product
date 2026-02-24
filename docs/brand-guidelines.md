# C-Madong Brand Guidelines v1.0

> First-stage design system extracted from Figma UI Draft 1.
> Source: [THESIS DESIGN FILE](https://www.figma.com/design/Yt0ysSuJ3CrRD7a3YKyXfj/-THESIS--DESIGN-FILE?node-id=189-1102)

---

## 1. Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **CU Pink** | `#DD598B` | Primary brand color. Nav bar, CTA buttons, active states, section headings |
| **CU Pink Dark** | `#E54F86` | Status card header, score highlights, progress bar fill |
| **CU Pink Bright** | `#F23E7E` | Accent numbers, important counters, gradient endpoints |

### Secondary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **CU Light Pink** | `#F9E1E9` | Menu icon backgrounds, secondary nav items, inactive date boxes |
| **CU Pink Tint** | `#FFF5F8` | Tertiary backgrounds, lightest event cards, subtle hover states |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **CU Grey** | `#565655` | Primary body text, section labels, secondary UI elements |
| **Muted Grey** | `#818181` | Placeholder text, search hint text |
| **Border Light** | `#F3F3F3` | Search bar border, subtle dividers |
| **Border** | `#D7D7D7` | Card borders, container outlines |
| **Neutral** | `#D9D9D9` | Progress bar inactive segment, disabled states |
| **White** | `#FFFFFF` | Page backgrounds, card backgrounds, CTA button text on pink |
| **Black** | `#000000` | High-emphasis text (greeting, status bar) |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Destructive** | `#FF0000` | Urgent badges ("สำคัญ"), critical alerts |
| **Success** | `#22C55E` | (Proposed) Completed states, positive indicators |
| **Warning** | `#F59E0B` | (Proposed) Caution states, pending items |

### Gradient

- **Action Card**: `linear-gradient(146deg, rgba(242,62,126,0) 47%, rgba(242,62,126,0.4) 99%), linear-gradient(90deg, #DD598B 0%, #DD598B 100%)`
- Used for the main task/action card hero section

---

## 2. Typography

### Font Families

| Role | Figma Font | Web Implementation | Fallback |
|------|-----------|-------------------|----------|
| **Heading (TH)** | CHULALONGKORN | Prompt (Google Fonts) | Noto Sans Thai, system-ui |
| **Body (TH)** | ChulaCharasNew | Sarabun (Google Fonts) | Noto Sans Thai, system-ui |
| **System (EN)** | SF Pro Text | Geist Sans (next/font) | system-ui, sans-serif |
| **Monospace** | — | Geist Mono (next/font) | monospace |

> **Note**: CHULALONGKORN and ChulaCharasNew are Chulalongkorn University's proprietary fonts.
> If font files (.woff2) become available, replace Prompt/Sarabun with the official CU fonts.
> Prompt and Sarabun are chosen as close visual alternatives with excellent Thai support.

### Type Scale

| Style | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| **Heading L** | 24px | Bold (700) | 1.2 | -0.32px | Room number, large stat |
| **Heading M** | 20px | Bold (700) | 1.05 | -0.32px | Card titles, task headings |
| **Heading S** | 16px | Bold (700) | 21px | -0.32px | Event titles, announcements |
| **Body L** | 16px | Regular (400) | 21px | -0.32px | Greeting text |
| **Body M** | 14px | Bold (700) | 21px | -0.32px | Section labels, date boxes, nav labels |
| **Body S** | 12px | Regular (400) | normal | -0.32px | Descriptions, placeholder text |
| **Body S Bold** | 12px | Bold (700) | 21px | -0.32px | Menu labels, tag text, metadata |
| **Caption** | 10px | Bold (700) | 21px | -0.32px | Score legend, progress labels, footer |

### Font Weight Mapping

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, descriptions, placeholders |
| 600 | Semibold | Status bar time (iOS system) |
| 700 | Bold | Headings, labels, nav items, buttons, badges |

---

## 3. Spacing

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline gaps, icon-to-text |
| `space-2` | 8px | Menu grid gap, list item gap |
| `space-3` | 12px | Inner card padding |
| `space-4` | 16px | Page horizontal padding, container padding |
| `space-5` | 20px | — |
| `space-6` | 24px | Section vertical spacing |

### Page Layout

- **Page horizontal padding**: 16px
- **Card inner padding**: 12–16px
- **Section gap**: 13–16px between major sections
- **List item gap**: 8–11px

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 5px | Small badges, tags, score legend dots |
| `radius-md` | 8px | Cards, menu icons, date boxes, buttons |
| `radius-lg` | 10px | Action card carousel items |
| `radius-full` | 999px | Pill buttons, search bar, nav bar, avatar, badges |

---

## 5. Elevation / Shadows

| Level | Value | Usage |
|-------|-------|-------|
| **None** | — | Most elements (flat design) |
| **Subtle** | `2px 4px 10px rgba(0,0,0,0.05)` | Status card |
| **Medium** | `0px 2px 10px rgba(0,0,0,0.1)` | Bottom nav bar |

The overall approach is **minimal shadows** — the design relies on color contrast and background tints rather than elevation.

---

## 6. Iconography

- **Style**: Outlined, consistent stroke weight
- **Size**: 28px (menu grid), 24px (header actions), 18px (nav bar), 16px (inline), 12px (metadata)
- **Color**: Inherits from parent — `#565655` on light pink bg, `#FFFFFF` on pink bg, `#DD598B` for accents
- **Library**: Lucide React (already configured in shadcn)

---

## 7. Component Patterns

### Cards
- White background, `#D7D7D7` 1px border, `radius-md` (8px)
- Subtle shadow (`2px 4px 10px rgba(0,0,0,0.05)`)
- Content padding: 12px

### Buttons (CTA)
- **Primary**: White bg, `#DD598B` text, `radius-md`, full-width in cards
- **Outline**: `#DD598B` 1px border, `#DD598B` text + icon, `radius-sm` (5px)
- **Pill**: `#DD598B` bg, white text, `radius-full`, used in nav bar

### Badges
- **Urgent**: `#FF0000` bg, white text, `radius-full`, small (52px wide)
- **Deadline**: White 1px border, white text, `radius-sm`, on pink bg
- **Tag**: `#DD598B` text on `#F9E1E9` bg, or pink icon badge

### Menu Grid
- 4-column grid, 65x65px cells
- `#F9E1E9` background, `radius-md` (8px)
- Icon (28px) + label (12px bold) stacked vertically

### Bottom Navigation
- `#DD598B` pill-shaped bar, `radius-full`
- Active tab: white icon + text
- Center item: elevated circle with mascot (น้องซีมะโด่ง)
- 5 items: หน้าหลัก, ข่าวสาร, ถามน้องซี (center), ติดต่อ, บัญชีของฉัน

### Progress Bar
- Multi-segment, `radius-full` (10px), 7px height
- Segments: `#E54F86` (dorm activities), `#565655` (university), `#D9D9D9` (other)

---

## 8. Layout

### Mobile-First (393px base)
- The design targets iPhone 14 Pro (393x852 viewport)
- Full-width layout, no side margins except 16px page padding
- Sticky header (greeting + search bar)
- Bottom nav bar with center mascot action

### Content Hierarchy (Dashboard)
1. **Header**: Avatar + greeting + notification icon + search
2. **Action Cards**: Horizontal scroll carousel with task cards
3. **Status Card**: Room info + score progress
4. **Menu Grid**: 2x4 quick action grid
5. **Announcements**: Vertical list with date boxes
6. **Footer**: Building silhouette + version

---

## 9. Brand Identity

### Name
- **Product**: C-Madong (ซีมะโด่ง)
- **Chatbot**: น้องซีมะโด่ง
- **Formal**: RCU.C-MADONG

### Mascot
- น้องซีมะโด่ง — pink character in the center of bottom nav
- Appears in chatbot interface and help actions

### Tone
- Refer to `thai-ux-writing` skill for full voice & tone guidelines
- Summary: Friendly "รุ่นพี่" voice, Gen-Z Thai vocabulary, gender-neutral particles

---

## 10. CSS Variable Mapping

These are the semantic token names used in `globals.css`:

```
--primary          → CU Pink (#DD598B)
--primary-foreground → White (#FFFFFF)
--secondary        → CU Light Pink (#F9E1E9)
--secondary-foreground → CU Grey (#565655)
--accent           → CU Pink Tint (#FFF5F8)
--accent-foreground → CU Grey (#565655)
--muted            → CU Pink Tint (#FFF5F8)
--muted-foreground → Muted Grey (#818181)
--destructive      → Red (#FF0000)
--background       → White (#FFFFFF)
--foreground       → CU Grey (#565655)
--card             → White (#FFFFFF)
--card-foreground  → CU Grey (#565655)
--border           → Border (#D7D7D7)
--input            → Border Light (#F3F3F3)
--ring             → CU Pink (#DD598B)
```
