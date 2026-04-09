# C-Madong V1 — Architecture Snapshot

> Technical reference snapshot ณ V1.0.0 release (2026-04-10)
> สำหรับใช้เป็น baseline เมื่อเริ่มพัฒนา V2

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     C-Madong V1 System                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Student    │      │    Admin     │                    │
│  │   Web App    │      │   Web App    │                    │
│  │ (student)/   │      │   /admin/    │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                             │
│         └─────────┬───────────┘                             │
│                   │                                         │
│         ┌─────────▼────────────┐                            │
│         │   Next.js 16 API     │                            │
│         │   60+ routes         │                            │
│         └─────────┬────────────┘                            │
│                   │                                         │
│         ┌─────────┼────────────┐                            │
│         │         │            │                            │
│    ┌────▼───┐ ┌──▼────┐  ┌────▼─────┐                      │
│    │Supabase│ │LINE   │  │ OpenAI   │                      │
│    │Postgres│ │Platform│ │ GPT-4o   │                      │
│    │+pgvector│ │       │  │ Gemini   │                      │
│    └────────┘ └───────┘  └──────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Directory Structure

```
c-madong-product/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/            # Auth route group
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── onboarding/
│   │   │   ├── (student)/         # Student route group (no URL segment)
│   │   │   │   ├── page.tsx       # Dashboard
│   │   │   │   ├── billing/
│   │   │   │   ├── parcels/
│   │   │   │   ├── maintenance/
│   │   │   │   ├── score/
│   │   │   │   ├── events/
│   │   │   │   ├── announcements/
│   │   │   │   ├── emergency/
│   │   │   │   ├── notifications/
│   │   │   │   └── profile/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── settings/
│   │   │   │       └── dorm-card/
│   │   │   ├── admin/              # Admin URL segment
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── billing/
│   │   │   │   ├── parcels/
│   │   │   │   ├── maintenance/
│   │   │   │   ├── scores/
│   │   │   │   ├── events/
│   │   │   │   ├── announcements/
│   │   │   │   ├── knowledge-base/
│   │   │   │   ├── live-chat/
│   │   │   │   ├── roles/
│   │   │   │   ├── settings/
│   │   │   │   ├── broadcast/
│   │   │   │   ├── templates/
│   │   │   │   ├── tags/
│   │   │   │   └── profile/
│   │   │   └── layout.tsx          # Locale layout (providers)
│   │   ├── api/
│   │   │   ├── auth/               # 9 routes
│   │   │   ├── student/            # 5 routes
│   │   │   ├── admin/              # 30+ routes
│   │   │   ├── chat/               # 4 routes
│   │   │   ├── chatbot/            # LINE webhook
│   │   │   ├── maintenance/
│   │   │   └── webhooks/
│   │   ├── layout.tsx              # Root layout (html + body)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/                 # 4 components
│   │   ├── student/                # 30+ components (9 dirs)
│   │   ├── admin/                  # 60+ components (17 dirs)
│   │   ├── maintenance/            # 5 components
│   │   └── ui/                     # 26 shadcn components
│   │
│   ├── lib/
│   │   ├── supabase/               # 5 files
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── line/                   # 3 files + flex-builders/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── flex-builders/      # 6 builders
│   │   ├── chatbot/                # 3 files + subdirs
│   │   │   ├── webhook-handler.ts
│   │   │   ├── intent-router.ts
│   │   │   ├── handlers/           # 8 handlers
│   │   │   ├── rag/                # 3 files
│   │   │   └── flex-builders/      # 7 builders
│   │   ├── ai/                     # 5 files + agents/
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   ├── orchestrator.ts
│   │   │   ├── settings.ts
│   │   │   └── agents/
│   │   │       └── vision-agent.ts
│   │   ├── rbac/                   # 3 files
│   │   ├── notifications/          # 4 files
│   │   ├── insights/               # 2 files
│   │   └── validators/             # 5 files
│   │
│   ├── hooks/                      # 25 hooks
│   ├── stores/                     # 6 Zustand stores
│   ├── messages/
│   │   ├── th.json                 # Thai translations
│   │   └── en.json                 # English translations
│   └── middleware.ts               # Next.js middleware
│
├── public/
│   ├── fonts/                      # Chulalongkorn + ChulaCharasNew
│   ├── line-banners/               # 6 onboarding banners
│   └── id-card-*.png               # Digital ID cards
│
├── supabase/
│   ├── migrations/                 # 24 migration files
│   └── config.toml
│
├── scripts/
│   ├── seed-repair-templates.ts
│   └── test-vision-ai.ts
│
├── docs/
│   ├── PRD.md                      # Product Requirements
│   ├── CHANGELOG_V1.md             # V1 Changelog
│   ├── V1_FEATURES.md              # V1 Feature Reference
│   └── V1_SNAPSHOT.md              # This file
│
├── .claude/                        # Claude Code memory
├── CLAUDE.md                       # Project instructions
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

---

## 🔧 Tech Stack Details

### Core Framework
```json
{
  "framework": "Next.js 16",
  "runtime": "Node.js 20+",
  "packageManager": "npm",
  "typescript": "5.x",
  "react": "19.x"
}
```

### UI & Styling
```json
{
  "styling": "Tailwind CSS v4",
  "components": "shadcn/ui (new-york)",
  "fonts": {
    "heading": "Chulalongkorn (local OTF)",
    "body": "ChulaCharasNew (local TTF)"
  }
}
```

### State Management
```json
{
  "serverState": "TanStack Query v5",
  "clientState": "Zustand v5",
  "forms": "React Hook Form v7",
  "validation": "Zod v4"
}
```

### Backend Services
```json
{
  "database": "Supabase (PostgreSQL 15)",
  "auth": "Supabase Auth + LINE Login",
  "storage": "Supabase Storage",
  "vector": "pgvector extension",
  "realtime": "Polling (3s interval)"
}
```

### AI & ML
```json
{
  "llm": {
    "chatbot": "OpenAI GPT-4o-mini",
    "vision": "OpenAI GPT-4o (primary)",
    "visionFallback": "Google Gemini 2.0 Flash"
  },
  "embeddings": "text-embedding-3-small (1536d)",
  "rag": "Custom implementation"
}
```

### LINE Platform
```json
{
  "channels": {
    "login": "LINE Login OAuth",
    "messaging": "LINE Messaging API"
  },
  "features": [
    "Flex Messages",
    "Rich Menu",
    "Quick Reply",
    "Postback Actions",
    "Push Notifications"
  ]
}
```

---

## 🗄️ Database Architecture

### Schema Organization
```
Supabase Database (PostgreSQL 15)
├── public schema
│   ├── Auth & Users (5 tables)
│   │   ├── profiles
│   │   ├── user_roles
│   │   ├── buildings
│   │   ├── rooms
│   │   └── beds
│   │
│   ├── Features (20+ tables)
│   │   ├── bills, bill_items
│   │   ├── parcels
│   │   ├── maintenance_requests
│   │   ├── student_scores
│   │   ├── events, event_registrations
│   │   ├── announcements (+ 4 related)
│   │   ├── notifications
│   │   ├── ai_chat_sessions, ai_chat_messages
│   │   ├── chat_escalations
│   │   ├── documents, knowledge_folders
│   │   ├── document_tags, document_tag_assignments
│   │   ├── repair_templates
│   │   └── app_settings
│   │
│   └── Functions (10+)
│       ├── is_admin() SECURITY DEFINER
│       ├── match_documents(vector, float, int)
│       └── ...
│
└── auth schema (Supabase Auth)
    └── users
```

### Key Tables & Relationships

#### `profiles` (24 columns)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  line_uid TEXT UNIQUE,
  display_name_en TEXT,
  display_name_th TEXT,
  email TEXT,
  faculty TEXT,              -- Added in V1
  role TEXT DEFAULT 'student',
  building_id UUID REFERENCES buildings(id),
  room_id UUID REFERENCES rooms(id),
  bed_id UUID REFERENCES beds(id),
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ...
);
```

#### `maintenance_requests` (15 columns + AI)
```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL,
  description TEXT,
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  building_id UUID REFERENCES buildings(id),
  room_id UUID REFERENCES rooms(id),
  assigned_to UUID REFERENCES profiles(id),
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- AI Vision fields (Phase 4.5)
  ai_confidence FLOAT,
  ai_provider TEXT,
  template_id UUID REFERENCES repair_templates(id),
  damage_details JSONB,
  ...
);
```

#### `repair_templates` (pgvector)
```sql
CREATE TABLE repair_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT,
  typical_urgency TEXT DEFAULT 'medium',
  embedding vector(1536),      -- text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX repair_templates_embedding_idx
  ON repair_templates USING ivfflat (embedding vector_cosine_ops);
```

#### `chat_escalations` (Live Chat)
```sql
CREATE TABLE chat_escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_chat_sessions(id),
  student_id UUID REFERENCES profiles(id),
  admin_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'waiting',    -- waiting | active | closed
  reason TEXT,
  claimed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Authentication Flow

### LINE Login OAuth
```
1. User clicks "เข้าสู่ระบบด้วย LINE"
2. Redirect to LINE Authorization URL
   ↓
3. LINE callback → /api/auth/callback?code={CODE}&state={STATE}
   ↓
4. Exchange code for access token
   ↓
5. Fetch LINE profile (userId, displayName, pictureUrl)
   ↓
6. Check if user exists in profiles (by line_uid)
   ├─ EXISTS → Login success → Dashboard
   └─ NOT EXISTS → Redirect to /register
      ↓
7. Registration form (fullNameEn, faculty, email)
   ↓
8. POST /api/auth/register → Create profile + auth record
   ↓
9. Redirect to /onboarding
   ↓
10. Onboarding form (building, floor, room, bed)
    ↓
11. Update profile → Set onboarding_completed = true
    ↓
12. Redirect to dashboard
```

### Dev Login (localhost only)
```
1. NEXT_PUBLIC_DEV_LOGIN=true in .env.local
2. Login page shows quick-switch buttons (Admin/Student)
3. POST /api/auth/login with dev credentials
   - Admin: dev@c-madong.app / devadmin123
   - Student: student@c-madong.app / devstudent123
4. Server validates + sets session cookie
5. Redirect to dashboard
```

---

## 🔌 API Architecture

### Route Organization
```
/api/
├── auth/                   # 9 routes (login, register, logout, etc.)
├── student/                # 5 routes (student-specific)
│   ├── bills/
│   ├── insights/
│   ├── maintenance/[id]/cancel/
│   ├── notifications/
│   └── parcels/
├── admin/                  # 30+ routes (admin-specific)
│   ├── ai/
│   ├── announcements/
│   ├── bills/
│   ├── booking/
│   ├── knowledge/          # 8 sub-routes
│   ├── live-chat/          # 4 sub-routes
│   ├── maintenance/
│   ├── parcels/
│   ├── roles/
│   ├── scores/
│   ├── settings/
│   └── students/
├── chat/                   # 4 routes (in-app chat)
│   ├── route.ts            # POST (send message)
│   ├── history/
│   ├── escalate/
│   └── messages/
├── chatbot/                # LINE webhook
├── maintenance/            # Shared create endpoint
└── webhooks/
    └── line/
```

### Permission Model
```typescript
// Admin API routes use createAdminClient() to bypass RLS
export async function GET(request: NextRequest) {
  const supabase = await createAdminClient();
  // ... admin operations
}

// Student API routes use user client (RLS enforced)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  // ... student operations (filtered by user_id in RLS)
}
```

---

## 🤖 Chatbot Architecture

### Webhook Handler Flow
```
LINE Event → POST /api/chatbot
  ↓
1. Verify LINE signature
  ↓
2. Parse event type
  ├─ message → handleMessage()
  ├─ follow → handleFollow()
  └─ postback → handlePostback()
  ↓
3. handleMessage() → Intent Router
  ├─ Check session state first
  │  ├─ repair_confirming → handleRepair()
  │  ├─ repair_editing → handleRepair()
  │  └─ repair_collecting_photos → handleRepair()
  │
  ├─ Check keywords
  │  ├─ isRepairStatusCheck() → handleRepair (history)
  │  ├─ isRepairTrigger() → handleRepair (new)
  │  ├─ isParcelTrigger() → handleParcel()
  │  ├─ isScoreTrigger() → handleScore()
  │  ├─ isEventTrigger() → handleEvents()
  │  └─ isEscalationTrigger() → handleEscalation()
  │
  └─ Default → handleChitchat() or handleKnowledge()
  ↓
4. Handler builds response
  ↓
5. Reply via LINE API
   ├─ Text message
   ├─ Flex message
   └─ Quick reply menu
```

### RAG (Knowledge Base)
```typescript
// Query flow
1. User asks question → "หอพักเปิดถึงกี่โมง?"
   ↓
2. Generate embedding (text-embedding-3-small)
   ↓
3. Vector search in documents table
   SELECT *, 1 - (embedding <=> query_vector) as similarity
   FROM documents
   WHERE 1 - (embedding <=> query_vector) > 0.7
   ORDER BY similarity DESC
   LIMIT 5
   ↓
4. Retrieve matched chunks
   ↓
5. Build context prompt
   ↓
6. GPT-4o-mini generates answer
   ↓
7. Reply to user
```

---

## 🎨 Component Patterns

### Page Structure (Next.js 16)
```typescript
// app/[locale]/(student)/dashboard/page.tsx
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DashboardContent />;
}

// Content component (hooks + client-side logic)
"use client";
export function DashboardContent() {
  const { user } = useUser();
  const { data: stats } = useDashboardStats();
  // ...
  return <div>...</div>;
}
```

### State Management Pattern
```typescript
// Zustand store (global client state)
// src/stores/user-store.ts
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// TanStack Query hook (server state)
// src/hooks/use-user.ts
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
}
```

### Layout Pattern
```typescript
// Root layout (html + body)
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${chulalongkorn.variable} ${chulaCharas.variable}`}>
        {children}
      </body>
    </html>
  );
}

// Locale layout (providers only)
// app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
```

---

## 🔒 Security Patterns

### RLS Policies
```sql
-- Student can only view their own bills
CREATE POLICY "Students can view own bills"
ON bills FOR SELECT
USING (student_id = auth.uid());

-- Admins bypass RLS via is_admin() function
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'head', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all bills"
ON bills FOR SELECT
USING (is_admin());
```

### Admin Client Pattern
```typescript
// Admin API route bypasses RLS
const supabase = await createAdminClient();

// Student API route uses RLS-enforced client
const supabase = await createClient();
```

### Middleware Protection
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getUser();

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect student routes
  if (!PUBLIC_ROUTES.includes(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
```

---

## 📊 Performance Considerations

### Caching Strategy
- **AI Settings**: 5-min server-side cache (invalidate on admin save)
- **TanStack Query**: staleTime = 5min, cacheTime = 10min
- **Static Assets**: Next.js automatic optimization + Vercel CDN

### Real-time Updates
- **V1 Approach**: Polling (3s refetchInterval on TanStack Query)
- **Limitation**: Not true real-time, 3-second delay
- **V2 Consideration**: WebSockets or Supabase Realtime

### Image Optimization
- **Banner Images**: JPEG q75, resized to 1040×1040 (from 1800×1800)
- **Total Size**: 684KB for 6 onboarding banners (was 4.6MB)
- **Next.js Image**: Automatic optimization for other images

---

## 🌐 i18n Strategy

### Locales
- `th` (Thai) — default
- `en` (English) — fallback

### Message Organization
```json
// src/messages/th.json
{
  "auth": { ... },
  "dashboard": { ... },
  "billing": { ... },
  "parcels": { ... },
  "maintenance": { ... },
  "score": { ... },
  "events": { ... },
  "announcements": { ... },
  "emergency": { ... },
  "profile": { ... },
  "notifications": { ... },
  "chat": { ... },
  ...
}
```

### Usage Pattern
```typescript
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("dashboard");
  return <h1>{t("welcome")}</h1>;
}
```

---

## 🚀 Deployment

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["auto"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "LINE_CHANNEL_ID": "@line-channel-id",
    "LINE_CHANNEL_SECRET": "@line-channel-secret",
    "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN": "@line-messaging-token",
    "OPENAI_API_KEY": "@openai-api-key",
    "GEMINI_API_KEY": "@gemini-api-key",
    ...
  }
}
```

### Environment Variables (36 total)
**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**LINE**:
- `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET` (Login)
- `LINE_MESSAGING_CHANNEL_ID`, `LINE_MESSAGING_CHANNEL_SECRET`, `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` (Messaging API)
- `LIFF_ID` (LIFF, scaffolded)

**AI**:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ENABLE_VISION_ANALYSIS` (feature flag)

**App**:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEV_LOGIN` (localhost only)

---

## 📦 Dependencies Summary

### Production Dependencies (30+)
```json
{
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.47.10",
  "@tanstack/react-query": "^5.62.7",
  "next": "^16.0.0",
  "next-intl": "^4.0.0",
  "openai": "^4.73.0",
  "react": "^19.0.0",
  "react-hook-form": "^7.54.2",
  "zod": "^4.0.0-beta.2",
  "zustand": "^5.0.2",
  "@lineapi/line-bot-sdk": "^9.4.0",
  ...
}
```

### Dev Dependencies
```json
{
  "@types/node": "^22.10.2",
  "@types/react": "^19.0.6",
  "typescript": "^5.7.2",
  "tailwindcss": "^4.0.0",
  ...
}
```

---

## 🐛 Gotchas & Workarounds

### 1. Supabase Type Generation
**Issue**: New tables not in generated types → `never` type
**Workaround**: Cast to `any` until `supabase gen types` is rerun
```typescript
const { data } = await (supabase as any)
  .from("new_table")
  .select("*");
```

### 2. RLS Infinite Recursion
**Issue**: Policy on `profiles` querying `profiles` → infinite loop
**Workaround**: Use `is_admin()` SECURITY DEFINER function
```sql
CREATE POLICY "..." ON profiles
USING (is_admin() OR id = auth.uid());
```

### 3. Next.js 16 Layout Requirements
**Issue**: Build fails without `<html>` + `<body>` in root layout
**Workaround**: Root layout = html/body, locale layout = providers only

### 4. LINE Flex backgroundColor
**Issue**: Flex rejects `rgba()` colors silently
**Workaround**: Use hex only (`#RRGGBB` or `#RRGGBBAA`)

### 5. iOS Safari Modal Scroll-Lock
**Issue**: `overflow: hidden` on body breaks iOS Safari
**Workaround**: Never use body overflow hidden, use modal-specific scroll-lock

---

## 📈 V2 Planning Considerations

### Technical Debt to Address
1. Replace polling with WebSockets (Supabase Realtime)
2. Regenerate Supabase types after all V1 tables finalized
3. Migrate legacy role mapping to RBAC-only
4. Consolidate admin API routes (too many duplicates)
5. Code-render digital ID card (remove PNG dependency)

### Feature Gaps
1. Phase 8: Reports & Analytics
2. Phase 9: UX Polish & Accessibility
3. LIFF Mini App (full integration)
4. Push notifications (web + mobile)
5. Advanced AI (sentiment, predictive maintenance)

### Architecture Improvements
1. Monorepo split (web app + LINE bot)
2. Microservices for AI/Vision (separate deployment)
3. Edge functions for real-time features
4. GraphQL layer for complex queries
5. E2E testing suite (Playwright)

---

**Snapshot Date**: 2026-04-10
**Version**: 1.0.0
**Next Version**: 2.0.0 (TBD)
