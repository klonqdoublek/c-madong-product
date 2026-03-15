# C-Madong Design System Rules

**Version:** 1.0 (2026-03-15)
**Purpose:** Comprehensive design system reference for Figma-to-code integration, Claude AI code generation, and designer-developer collaboration.

## Table of Contents

1. [Token Definitions](#1-token-definitions)
2. [Component Library](#2-component-library)
3. [Frameworks & Libraries](#3-frameworks--libraries)
4. [Asset Management](#4-asset-management)
5. [Icon System](#5-icon-system)
6. [Styling Approach](#6-styling-approach)
7. [Project Structure](#7-project-structure)

---

## 1. Token Definitions

### 1.1 Token Architecture

**Single Source of Truth:**
- Design tokens skill: `/Users/klonqdoublek/klonqdevblek/c-madong-product/.claude/skills/c-madong-design-tokens/SKILL.md`
- Implementation: `src/app/globals.css`
- Two token tiers:
  - **Primitive tokens** — Raw hex values (CU Pink palette)
  - **Semantic tokens** — Purpose-based CSS variables (primary, secondary, muted, etc.)

### 1.2 Color Tokens

#### Brand Palette (Primitive)
Defined in `globals.css` lines 40-48:

```css
/* Direct access via bg-cu-pink, text-cu-grey, etc. */
--color-cu-pink: #DD598B;
--color-cu-pink-dark: #E5308A;
--color-cu-pink-bright: #F23E7E;
--color-cu-light-pink: #F9E1E9;
--color-cu-pink-tint: #FFF5F8;
--color-cu-grey: #565655;
--color-cu-muted: #818181;
--color-cu-neutral: #D9D9D9;
```

**Usage:** Use Tailwind classes `bg-cu-pink`, `text-cu-grey`, etc. for brand-specific contexts (LINE Flex cards, marketing materials).

#### Semantic Tokens (Light Mode)
Defined in `:root` selector, lines 78-135:

```css
/* Core */
--background: #FFFFFF;
--foreground: #565655; /* CU Grey */

/* Primary — CU Pink */
--primary: #DD598B;
--primary-foreground: #FFFFFF;

/* Secondary — CU Light Pink */
--secondary: #F9E1E9;
--secondary-foreground: #565655;

/* Muted — Pink Tint */
--muted: #FFF5F8;
--muted-foreground: #818181;

/* Destructive */
--destructive: #FF0000;
--destructive-foreground: #FFFFFF;

/* Borders & Input */
--border: #D7D7D7;
--input: #F3F3F3;
--ring: #DD598B; /* Focus ring */
```

**Usage:** Always prefer semantic tokens in UI components: `bg-primary`, `text-foreground`, `border-border`.

#### Status Colors
```css
/* Ticket status */
--color-ticket-new: #F59E0B;
--color-ticket-received: #3B82F6;
--color-ticket-progress: #8B5CF6;
--color-ticket-completed: #10B981;

/* Success — LINE green */
--color-success: #06C755;
--color-success-foreground: #FFFFFF;
```

**Usage:** `bg-ticket-new`, `bg-success`, etc.

#### Chart Colors
Lines 116-121:
```css
--chart-1: #DD598B;
--chart-2: #E54F86;
--chart-3: #F23E7E;
--chart-4: #F9E1E9;
--chart-5: #565655;
```

**Usage:** Data visualization in sequence. Extend with `blue-500`, `amber-500`, `emerald-500` for >5 series.

### 1.3 Typography Tokens

#### Font Declarations
Loaded in `src/app/[locale]/layout.tsx` lines 27-43:

```tsx
const chulalongkorn = localFont({
  variable: "--font-chulalongkorn",
  src: [
    { path: "../fonts/CHULALONGKORNReg.otf", weight: "400", style: "normal" },
    { path: "../fonts/CHULALONGKORNBold.otf", weight: "700", style: "normal" },
  ],
});

const chulaCharasNew = localFont({
  variable: "--font-chula-charas",
  src: [
    { path: "../fonts/ChulaCharasNewReg.ttf", weight: "400", style: "normal" },
    { path: "../fonts/ChulaCharasNewIta.ttf", weight: "400", style: "italic" },
    { path: "../fonts/ChulaCharasNewBold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/ChulaCharasNewBoldIta.ttf", weight: "700", style: "italic" },
  ],
});
```

Applied to `<body>`:
```tsx
className={`${geistSans.variable} ${geistMono.variable} ${chulalongkorn.variable} ${chulaCharasNew.variable} font-sans antialiased`}
```

#### Font CSS Variables
Defined in `globals.css` lines 69-75 using `@theme inline` (required for Next.js runtime font loading):

```css
@theme inline {
  --font-sans: var(--font-chula-charas), var(--font-geist-sans), "Noto Sans Thai", system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
  --font-heading: var(--font-chulalongkorn), var(--font-geist-sans), "Noto Sans Thai", system-ui, sans-serif;
  --font-body: var(--font-chula-charas), var(--font-geist-sans), "Noto Sans Thai", system-ui, sans-serif;
}
```

**Tailwind Classes:**
- `font-heading` → Chulalongkorn (headings, card titles, nav labels)
- `font-sans` / `font-body` → ChulaCharasNew (body text, forms, labels)
- `font-mono` → Geist Mono (code, ticket IDs)

#### Thai Line Height Rules
Lines 97-103 in design tokens skill:

| Context | Tailwind | Value | Notes |
|---------|----------|-------|-------|
| Body text | `leading-relaxed` | 1.625 | Minimum for Thai readability |
| Long paragraphs | `leading-loose` | 2.0 | Best for dense Thai text |
| Headings | `leading-tight` | 1.25 | OK for short Chulalongkorn headings |
| Labels/badges | `leading-none` | 1.0 | Only for single-line Latin or short text |
| Nav labels | `leading-tight` | 1.25 | Bottom nav, sidebar items |

**Critical:** Never use `leading-none` or `leading-tight` for multi-line Thai body text — diacritics/tone marks will clip.

#### Body Letter-Spacing
Line 189 in `globals.css`:
```css
body {
  letter-spacing: -0.32px;
}
```

### 1.4 Spacing Tokens

Use Tailwind's default spacing scale (4px base unit):
- `p-4` = 16px (mobile card padding)
- `p-6` = 24px (desktop card padding)
- `gap-2` = 8px (flex/grid gaps)
- `space-y-4` = 16px (vertical stack spacing)

**Layout Constants:**
- Bottom nav height: ~60px (`py-2` + content)
- Bottom nav clearance: `pb-20` on student page content
- Header height: ~56px (`py-3 px-4`)
- Student page container: `max-w-md mx-auto px-4 py-6 pb-20`
- Admin page container: `max-w-7xl mx-auto p-4 md:p-6`

### 1.5 Border Radius Tokens

Line 123-124 in `globals.css`:
```css
--radius: 0.5rem; /* 8px */
```

Mapped to:
- `rounded-md` = 6px (buttons, badges)
- `rounded-lg` = 8px (cards, default)
- `rounded-xl` = 12px (large cards, modals)
- `rounded-full` = pill (bottom nav, avatars, tags)

### 1.6 Shadow Tokens

Lines 193-208 in `globals.css`:

```css
.shadow-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}
.shadow-hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
}
.shadow-soft {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
```

**Usage:**
- `shadow-card` — Default cards
- `shadow-hover` — Card hover state (combine with `transition-shadow hover:shadow-hover`)
- `shadow-soft` — Subtle elevation

### 1.7 Motion Tokens

#### Durations
- **Fast:** `duration-150` (150ms) — Hover color changes, small toggles
- **Normal:** `duration-200` (200ms) — Button state, dialog fade
- **Slow:** `duration-300` (300ms) — Sidebar slide, page transitions
- **Entrance:** 0.4s (`animate-fade-in`)

#### Easing
- **Default:** `ease-out` — Entrances, fade-in
- **Interaction:** `ease-in-out` — Hover, toggle

#### Custom Animations
Lines 210-243 in `globals.css`:

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out both;
}

@keyframes fade-in-scale {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in-scale {
  animation: fade-in-scale 0.5s ease-out both;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-gentle-bounce {
  animation: gentle-bounce 3s ease-in-out infinite;
}

/* Staggered animation delays */
.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-500 { animation-delay: 0.5s; }
.animation-delay-700 { animation-delay: 0.7s; }
```

**Usage:** Staggered entrance animations:
```tsx
<div className="animate-fade-in-up animation-delay-100">...</div>
<div className="animate-fade-in-up animation-delay-200">...</div>
<div className="animate-fade-in-up animation-delay-300">...</div>
```

**Important:** `prefers-reduced-motion` not yet implemented. When adding, disable animations for accessibility.

### 1.8 Z-Index Scale

From design tokens skill:

| Layer | z-index | Elements |
|-------|---------|----------|
| Dropdown/autocomplete | `z-10` | Select popover, autocomplete list |
| Admin mobile header | `z-30` | Sticky admin topbar |
| Header | `z-40` | Student sticky header, mobile overlay backdrop |
| Overlay content | `z-50` | Bottom nav, dialog, sheet, modal, tooltip |

**Rule:** Never use arbitrary z-values. Pick from this scale. If a new layer is needed, slot it between existing tiers.

### 1.9 Responsive Breakpoints

Mobile-first approach. Default styles target mobile (<768px), scale up with breakpoints.

| Breakpoint | Width | Key changes |
|------------|-------|-------------|
| (default) | <768px | Bottom nav visible, single column, `max-w-md` |
| `md` | 768px | Bottom nav hidden, 2-col grids, admin topbar |
| `lg` | 1024px | Admin sidebar always visible, wider content |
| `xl` | 1280px | Admin `max-w-7xl` content area |

---

## 2. Component Library

### 2.1 Component Architecture

**Location:** `src/components/ui/`
**Pattern:** shadcn/ui components (new-york style) customized for C-Madong brand
**Variant Management:** `class-variance-authority` (CVA)

### 2.2 Core Components

#### Button
File: `src/components/ui/button.tsx`

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

**Usage:**
```tsx
<Button variant="default" size="lg">บันทึก</Button>
<Button variant="outline" size="icon"><Plus /></Button>
```

#### Card
File: `src/components/ui/card.tsx`

```tsx
<Card className="shadow-card">
  <CardHeader>
    <CardTitle>หอพักของฉัน</CardTitle>
    <CardDescription>ข้อมูลห้องพักและอาคาร</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

**Default classes:**
- `rounded-xl border py-6 shadow-sm` (Card)
- `px-6` (CardContent, CardHeader, CardFooter)

**Pattern:** Add `shadow-card` class for C-Madong shadow style, `transition-shadow hover:shadow-hover` for hover effect.

#### Badge
File: `src/components/ui/badge.tsx`

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border-border text-foreground",
        ghost: "...",
        link: "text-primary underline-offset-4",
      },
    },
  }
)
```

**Usage:**
```tsx
<Badge variant="secondary">รอดำเนินการ</Badge>
<Badge className="bg-ticket-new">ใหม่</Badge>
```

### 2.3 Layout Shells

#### Student Shell
File: `src/components/layout/student-shell.tsx`

```tsx
<div className="flex min-h-dvh flex-col">
  <Header />
  <main className="flex-1 pb-24 md:pb-0">
    {children}
  </main>
  <BottomNav />
</div>
```

**Pattern:**
- Mobile: Bottom nav visible, `pb-24` on `<main>` for clearance
- Desktop: Bottom nav hidden (`md:hidden`), no bottom padding

#### Bottom Nav
File: `src/components/layout/bottom-nav.tsx`

```tsx
<nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-2 pt-1 md:hidden">
  <div className="relative flex items-center justify-around rounded-full bg-primary px-2 py-2 shadow-lg">
    {/* NavItems */}
    {/* Center chatbot button — elevated with -mt-5 */}
  </div>
</nav>
```

**Pattern:**
- Pink pill (`rounded-full bg-primary`)
- 5 items: 2 left, 1 center (chatbot elevated), 2 right
- Icons: inline SVG (from lucide-react), white text
- `font-heading text-[10px] font-bold` for labels

### 2.4 Component Patterns

**KPI Card:**
```tsx
<div className="rounded-lg border p-4 shadow-card">
  <p className="text-sm text-muted-foreground">จำนวนนักศึกษา</p>
  <p className="text-3xl font-heading font-bold">1,234</p>
  <p className="text-xs text-muted-foreground">+12 เดือนนี้</p>
</div>
```

**Status Badge:**
```tsx
<Badge className="rounded-full px-2 py-0.5 text-xs font-medium bg-ticket-new text-white">
  ใหม่
</Badge>
```

**Empty State:**
```tsx
<div className="text-center py-12 text-muted-foreground">
  <FileX className="mx-auto h-12 w-12 mb-4 opacity-50" />
  <p>ไม่พบข้อมูล</p>
</div>
```

**Card Hover:**
```tsx
<Card className="shadow-card transition-shadow hover:shadow-hover cursor-pointer">
  {/* ... */}
</Card>
```

---

## 3. Frameworks & Libraries

### 3.1 Core Stack

| Layer | Library | Version | Notes |
|-------|---------|---------|-------|
| Framework | Next.js | 16.1.6 | App Router, TypeScript, Turbopack |
| React | React | 19.2.4 | Server Components + Client Components |
| Styling | Tailwind CSS | 4.1.18 | PostCSS plugin (`@tailwindcss/postcss`) |
| UI Components | shadcn/ui | — | new-york style, Radix UI primitives |
| Component Variants | class-variance-authority | 0.7.1 | CVA for type-safe variant management |
| CSS Utilities | clsx + tailwind-merge | — | `cn()` helper in `@/lib/utils/cn` |

### 3.2 Tailwind CSS v4 Configuration

**PostCSS Config:** `postcss.config.mjs`
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**No `tailwind.config.ts`** — Tailwind v4 uses CSS-based configuration via `@theme` directive in `globals.css`.

**Critical Gotcha:** Font CSS variables use `@theme inline` (not `@theme`) because Next.js sets them at runtime on `<body>`. `@theme` resolves `var()` at build time, causing undefined variables for fonts.

### 3.3 TypeScript Configuration

**Path Alias:** `@/*` → `./src/*`
File: `tsconfig.json` lines 25-29:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

**Usage:**
```tsx
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
```

### 3.4 Internationalization (i18n)

**Library:** next-intl v4
**Locales:** `th` (default), `en`
**Routing:** `[locale]` dynamic segment in `src/app/[locale]/`

**Pattern:**
```tsx
import { useTranslations } from "next-intl";

function Component() {
  const t = useTranslations("dashboard");
  return <h1>{t("title")}</h1>;
}
```

**Messages:** `src/messages/th.json`, `src/messages/en.json`

### 3.5 State Management

| Tool | Use |
|------|-----|
| TanStack Query v5 | Server state (API calls, caching) |
| Zustand | Client state (user store, UI store) |
| React Context | Supabase provider, theme provider |

### 3.6 Forms & Validation

| Library | Use |
|---------|-----|
| react-hook-form | Form state management |
| Zod v4 | Schema validation |
| @hookform/resolvers | Zod + react-hook-form integration |

**Zod v4 Import:**
```tsx
import { z } from "zod/v4"; // NOT "zod"
```

### 3.7 Icons

**Library:** lucide-react v0.563.0
**Usage:**
```tsx
import { Home, User, Plus } from "lucide-react";

<Home className="h-4 w-4" />
<Button size="icon"><Plus /></Button>
```

**Note:** Bottom nav uses inline SVG (not lucide-react imports) for size optimization.

---

## 4. Asset Management

### 4.1 Static Assets Location

**Directory:** `public/images/`

**Assets:**
- `dorm-bg.png` — Login page hero background
- `mascot.svg` — น้องซีมะโด่ง mascot character
- `mascot-bg.svg` — Mascot with background decoration
- `line-icon.svg` — LINE logo for login button

### 4.2 Asset Usage Pattern

**Import in components:**
```tsx
import Image from "next/image";

<Image
  src="/images/mascot.svg"
  alt="น้องซีมะโด่ง"
  width={120}
  height={120}
  className="animate-gentle-bounce"
/>
```

**Background images (CSS):**
```tsx
<div className="bg-[url('/images/dorm-bg.png')] bg-cover bg-center">
  {/* ... */}
</div>
```

### 4.3 Font Assets

**Location:** `src/app/fonts/`

**Files:**
- `CHULALONGKORNReg.otf` (400)
- `CHULALONGKORNBold.otf` (700)
- `ChulaCharasNewReg.ttf` (400)
- `ChulaCharasNewIta.ttf` (400 italic)
- `ChulaCharasNewBold.ttf` (700)
- `ChulaCharasNewBoldIta.ttf` (700 italic)

**Loading:** `next/font/local` in `src/app/[locale]/layout.tsx` (see Section 1.3)

### 4.4 Image Optimization

**Next.js Image Component:**
- Use `next/image` for automatic optimization
- Always provide `width` and `height` for static images
- Use `fill` for responsive containers with `object-fit`

**Example:**
```tsx
<div className="relative w-full h-64">
  <Image
    src="/images/dorm-bg.png"
    alt="Dormitory background"
    fill
    className="object-cover"
  />
</div>
```

---

## 5. Icon System

### 5.1 Icon Library

**Primary:** lucide-react (0.563.0)
**Fallback:** Inline SVG for critical paths (bottom nav)

### 5.2 Icon Sizing Conventions

| Context | Tailwind Class | Size |
|---------|----------------|------|
| Button default | `size-4` | 16px |
| Button large | `size-5` | 20px |
| Nav labels | `size-5` | 20px |
| KPI card icon | `size-4` inside `size-9` container | 16px in 36px square |
| Empty state | `size-12` | 48px |

**Auto-sizing in components:** Button and Badge apply `[&_svg]:size-4` to child icons automatically.

### 5.3 Icon Usage Patterns

**With button:**
```tsx
<Button>
  <Plus className="size-4" />
  เพิ่มข้อมูล
</Button>
```

**KPI card icon container:**
```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
  <Trophy className="h-4 w-4" />
</div>
```

**Inline SVG (bottom nav example):**
```tsx
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
};
```

### 5.4 Iconography Principles

- Use lucide-react for consistency (same stroke width, style)
- Always use `currentColor` for `stroke`/`fill` to inherit text color
- Prefer outlined style (stroke) over filled icons
- Use semantic color classes: `text-primary`, `text-muted-foreground`, `text-destructive`

---

## 6. Styling Approach

### 6.1 CSS Methodology

**Utility-First:** Tailwind CSS classes compose all styles
**No CSS Modules:** All styling via Tailwind + global classes in `globals.css`
**Component Variants:** CVA for type-safe variant management in reusable components

### 6.2 Global Styles

**File:** `src/app/globals.css`

**Structure:**
1. `@import "tailwindcss"` (line 1)
2. `@custom-variant dark` (line 3)
3. `@theme` block — static token resolution (lines 5-67)
4. `@theme inline` block — runtime token resolution (lines 69-75)
5. `:root` — light mode CSS variables (lines 78-135)
6. `.dark` — dark mode CSS variables (lines 137-181)
7. `@layer base` — base element styles (lines 183-191)
8. Custom utility classes — gradients, shadows (lines 193-208)
9. `@keyframes` + animation classes (lines 210-243)

### 6.3 Class Composition Pattern

**Helper:** `cn()` function from `@/lib/utils/cn`
File: `src/lib/utils/cn.ts`

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```tsx
<div className={cn(
  "rounded-lg border p-4", // Base classes
  isActive && "bg-primary text-white", // Conditional
  className // Prop override
)}>
  {children}
</div>
```

**Why:** `twMerge` resolves Tailwind class conflicts (e.g., `p-4` overridden by `p-6`). `clsx` handles conditional classes.

### 6.4 Responsive Design Patterns

**Mobile-First:**
```tsx
<div className="
  max-w-md mx-auto px-4 py-6 pb-20  // Mobile: narrow container, bottom nav clearance
  md:max-w-7xl md:pb-0               // Desktop: wider, no bottom nav
">
  {children}
</div>
```

**Grid Layouts:**
```tsx
<div className="
  grid grid-cols-1 gap-4   // Mobile: single column
  md:grid-cols-2           // Tablet: 2 columns
  lg:grid-cols-3           // Desktop: 3 columns
">
  {items.map(...)}
</div>
```

**Visibility Toggle:**
```tsx
<BottomNav className="md:hidden" />         // Mobile only
<Sidebar className="hidden lg:block" />     // Desktop only
```

### 6.5 Dark Mode

**Implementation:** `.dark` class on `<html>` (next-themes)
**Token Override:** All semantic tokens redefined in `.dark` selector (lines 137-181 in `globals.css`)

**Usage:**
```tsx
<div className="bg-background text-foreground border-border">
  {/* Automatically adapts to light/dark */}
</div>
```

**Direct dark mode styles:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Explicit dark mode override */}
</div>
```

### 6.6 Accessibility Patterns

**Focus Rings:**
```css
/* Applied to all interactive components via CVA */
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

**ARIA Attributes:**
```tsx
<Button aria-label="ปิด" aria-invalid={hasError}>
  <X />
</Button>
```

**Color Contrast:**
- Body text: `text-cu-grey` (#565655) on white = 7.2:1 (WCAG AAA)
- Primary button: `bg-cu-pink` (#DD598B) with `text-white` = 4.6:1 (WCAG AA large text)
- Links: Always use `text-primary` with underline on hover

**Reduced Motion:** Not yet implemented (see Section 1.7 for future pattern).

---

## 7. Project Structure

### 7.1 Directory Tree

```
c-madong-product/
├── .claude/
│   ├── agent-memory/design-system-manager/  # Persistent agent memory
│   └── skills/
│       └── c-madong-design-tokens/          # Design token single source of truth
│           └── SKILL.md
├── docs/
│   ├── PRD.md                                # Product requirements
│   └── design-system-rules.md               # This document
├── public/
│   └── images/                               # Static assets (SVG, PNG)
├── src/
│   ├── app/
│   │   ├── fonts/                            # Local font files (OTF, TTF)
│   │   ├── globals.css                       # Design tokens + global styles
│   │   ├── [locale]/                         # i18n routing root
│   │   │   ├── layout.tsx                    # Root layout (fonts, providers)
│   │   │   ├── (auth)/                       # Auth route group (login, register, onboarding)
│   │   │   ├── (student)/                    # Student route group (dashboard, maintenance, billing, score, events)
│   │   │   ├── admin/                        # Admin routes (NOT in route group)
│   │   │   └── liff/                         # LINE LIFF pages
│   │   └── api/                              # API routes (auth, webhooks, admin)
│   ├── components/
│   │   ├── ui/                               # shadcn/ui primitives (button, card, badge, etc.)
│   │   ├── layout/                           # Layout shells (student-shell, admin-shell, header, bottom-nav)
│   │   ├── student/                          # Student-specific components (dashboard cards, score, events)
│   │   ├── admin/                            # Admin-specific components (roles, knowledge, events, scores)
│   │   └── rbac/                             # RBAC components (PermissionGuard, RoleBadge, etc.)
│   ├── lib/
│   │   ├── utils/
│   │   │   ├── cn.ts                         # Class name composition helper
│   │   │   ├── index.ts                      # General utilities
│   │   │   ├── billing-constants.ts          # Billing token constants
│   │   │   └── score-constants.ts            # Score tier constants
│   │   ├── supabase/                         # Supabase clients (client, server, admin, middleware, types)
│   │   ├── line/                             # LINE Messaging API (client, flex-builders)
│   │   ├── liff/                             # LIFF SDK initialization
│   │   ├── rbac/                             # RBAC system (permissions, roles, checks)
│   │   ├── chatbot/                          # Chatbot logic (intent-router, handlers, RAG)
│   │   ├── ai/                               # AI clients (openai, gemini)
│   │   └── validators/                       # Zod schemas
│   ├── hooks/                                # Custom React hooks (use-user, use-permissions, use-events, use-score)
│   ├── stores/                               # Zustand stores (user-store, ui-store, notification-store)
│   ├── providers/                            # React context providers (Supabase, Query, combined)
│   ├── i18n/                                 # next-intl config (config, routing, request, navigation)
│   └── messages/                             # Translation files (th.json, en.json)
├── supabase/
│   └── migrations/                           # Database migrations (SQL)
├── next.config.ts                            # Next.js config (next-intl plugin)
├── postcss.config.mjs                        # PostCSS config (Tailwind v4)
├── tsconfig.json                             # TypeScript config (@/* alias)
└── package.json                              # Dependencies
```

### 7.2 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case.tsx | `student-shell.tsx`, `bottom-nav.tsx` |
| Pages (App Router) | kebab-case | `[locale]/dashboard/page.tsx` |
| API routes | route.ts | `api/auth/login/route.ts` |
| Utilities | kebab-case.ts | `cn.ts`, `billing-constants.ts` |
| Hooks | use-*.ts | `use-user.ts`, `use-permissions.ts` |
| Stores | *-store.ts | `user-store.ts`, `ui-store.ts` |
| Types | types.ts | `supabase/types.ts`, `line/types.ts` |

### 7.3 Import Patterns

**Absolute imports via `@/*` alias:**
```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/use-user";
import { Link } from "@/i18n/navigation"; // NOT next/link
```

**Barrel exports (index.ts):**
```tsx
// @/lib/line/index.ts
export * from "./client";
export * from "./types";
export * from "./flex-builders/bill-reminder";

// Usage:
import { pushFlexMessage, buildBillReminderFlex } from "@/lib/line";
```

### 7.4 Component Co-location

**Pattern:** Feature-specific components live in domain directories.

```
src/components/
├── ui/                    # Shared primitives (button, card, badge)
├── layout/                # Shared layout shells
├── student/               # Student-specific components
│   ├── dashboard-bill-card.tsx
│   ├── dashboard-score-card.tsx
│   └── events/            # Nested feature directory
│       ├── event-list.tsx
│       └── event-card.tsx
└── admin/                 # Admin-specific components
    ├── roles/
    ├── knowledge/
    └── events/
```

### 7.5 Route Organization

**Route Groups:** Use `(group)` for layout grouping without URL segment.

```
src/app/[locale]/
├── (auth)/                # Auth pages — no /auth in URL
│   ├── layout.tsx         # Auth layout (no header/nav)
│   ├── login/page.tsx     # /th/login
│   └── register/page.tsx  # /th/register
├── (student)/             # Student pages — no /student in URL
│   ├── layout.tsx         # Student shell (header + bottom nav)
│   ├── dashboard/page.tsx # /th/dashboard
│   └── profile/page.tsx   # /th/profile
└── admin/                 # Admin pages — /admin in URL
    ├── layout.tsx         # Admin shell (sidebar)
    ├── page.tsx           # /th/admin
    └── roles/page.tsx     # /th/admin/roles
```

**Why:** `(student)` avoids `/student/dashboard` URL, admin needs `/admin` segment to avoid path conflicts.

### 7.6 API Route Organization

```
src/app/api/
├── auth/
│   ├── line/route.ts              # LINE OAuth initiation
│   ├── callback/route.ts          # LINE OAuth callback
│   ├── register/route.ts          # User registration
│   └── liff/route.ts              # LIFF auth bridge
├── webhooks/
│   └── line/route.ts              # LINE chatbot webhook
├── admin/
│   ├── roles/route.ts             # RBAC role management
│   └── knowledge/
│       ├── upload/route.ts        # Document upload
│       ├── process/route.ts       # Embedding generation
│       └── query/route.ts         # RAG query
└── flex/
    └── bill-reminder/route.ts     # LINE Flex bill reminder
```

---

## 8. Usage Guidelines for Figma-to-Code

### 8.1 Design Handoff Checklist

When converting Figma designs to code:

1. **Colors:** Map Figma color styles to semantic tokens (`primary`, `muted`, `destructive`) or brand tokens (`cu-pink`, `cu-grey`)
2. **Typography:** Use `font-heading` for titles, `font-sans` for body. Set `leading-relaxed` minimum for Thai text
3. **Spacing:** Use Tailwind spacing scale (multiples of 4px). Reference layout constants (Section 1.4)
4. **Components:** Check `src/components/ui/` for existing shadcn components before building custom
5. **Icons:** Use lucide-react. Match icon size to context (Section 5.2)
6. **Animations:** Use custom animation classes (`animate-fade-in-up`) + delay classes for staggered entrance
7. **Responsive:** Mobile-first. Test bottom nav clearance (`pb-20`) on student pages

### 8.2 Token Mapping Reference

| Figma Layer | Code Implementation |
|-------------|---------------------|
| Fill: Primary Pink | `bg-primary` or `bg-cu-pink` |
| Text: Body | `text-foreground font-sans leading-relaxed` |
| Text: Heading | `font-heading text-2xl font-bold` |
| Border: Divider | `border-border` |
| Shadow: Card | `shadow-card` (custom class) |
| Radius: 8px | `rounded-lg` |
| Spacing: 16px | `p-4` or `gap-4` |

### 8.3 Component Selection Guide

| Figma Component | Code Component | File |
|-----------------|----------------|------|
| Button (primary) | `<Button variant="default">` | `ui/button.tsx` |
| Button (outlined) | `<Button variant="outline">` | `ui/button.tsx` |
| Card | `<Card><CardHeader><CardTitle>` | `ui/card.tsx` |
| Badge | `<Badge variant="secondary">` | `ui/badge.tsx` |
| Input field | `<Input>` + `<Label>` | `ui/input.tsx`, `ui/label.tsx` |
| Dialog/Modal | `<Dialog><DialogContent>` | `ui/dialog.tsx` |
| Bottom sheet | `<Sheet>` | `ui/sheet.tsx` |

### 8.4 Common Patterns

**Student Page Container:**
```tsx
<div className="max-w-md mx-auto px-4 py-6 pb-20">
  {/* Content */}
</div>
```

**Admin Page Container:**
```tsx
<div className="max-w-7xl mx-auto p-4 md:p-6">
  {/* Content */}
</div>
```

**2-Column Grid (Responsive):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Items */}
</div>
```

**Staggered Entrance Animation:**
```tsx
<div className="space-y-4">
  <Card className="animate-fade-in-up animation-delay-100">Card 1</Card>
  <Card className="animate-fade-in-up animation-delay-200">Card 2</Card>
  <Card className="animate-fade-in-up animation-delay-300">Card 3</Card>
</div>
```

---

## 9. Appendix

### 9.1 Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Design tokens (docs) | `.claude/skills/c-madong-design-tokens/SKILL.md` |
| Design tokens (impl) | `src/app/globals.css` |
| Font loading | `src/app/[locale]/layout.tsx` |
| Class composition helper | `src/lib/utils/cn.ts` |
| Button component | `src/components/ui/button.tsx` |
| Card component | `src/components/ui/card.tsx` |
| Student layout shell | `src/components/layout/student-shell.tsx` |
| Bottom nav | `src/components/layout/bottom-nav.tsx` |

### 9.2 External Resources

- shadcn/ui documentation: https://ui.shadcn.com/
- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- lucide-react icons: https://lucide.dev/icons
- next-intl docs: https://next-intl-docs.vercel.app/

### 9.3 Critical Gotchas

1. **Thai Line Height:** Always use `leading-relaxed` (1.625) or higher for multi-line Thai text. Never `leading-tight` or `leading-none`.
2. **Font CSS Variables:** Must use `@theme inline` in `globals.css` for fonts, not `@theme` (Next.js runtime loading issue).
3. **Bottom Nav Clearance:** Add `pb-20` to student page content containers (mobile only).
4. **No Hardcoded Colors:** Always use semantic tokens (`bg-primary`) or brand tokens (`bg-cu-pink`), never raw hex in className.
5. **Zod v4 Import:** `import { z } from "zod/v4"` not `"zod"`.
6. **shadcn CVA Dependency:** Install `class-variance-authority` manually if missing (shadcn CLI may skip it).
7. **Z-Index Scale:** Use predefined layers (10/30/40/50), never arbitrary values.

---

**Document Status:** Active
**Last Updated:** 2026-03-15
**Maintainer:** Design System Manager Agent
**Contact:** See CLAUDE.md for project lead
