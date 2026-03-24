<div align="center">
  <!-- Replace with actual logo when available -->
  <h1>C-Madong (ซีมะโด่ง)</h1>
  <p><strong>A unified digital platform for Chulalongkorn University dormitory management</strong></p>
  <p>Connecting students and staff through LINE integration, real-time notifications, and AI-powered workflows</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/LINE-Messaging_API-00C300?logo=line" alt="LINE" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
</p>

---

## About

C-Madong is a smart dormitory management platform built for Chulalongkorn University. It replaces paper-based processes and fragmented LINE groups with a bilingual (Thai/English) web app and an AI-powered LINE chatbot named **น้องซีมะโด่ง**.

The platform serves 4 user types — students, staff, admins, and committee members — across maintenance requests, billing, parcel tracking, announcements, dorm score management, and more.

## Screenshots

> Screenshots coming soon. To add screenshots, place images in `docs/assets/screenshots/` and update this section.

| Student Dashboard | Admin Portal | LINE Chatbot |
|:-:|:-:|:-:|
| *Student mobile-first UI* | *Admin service desk* | *น้องซีมะโด่ง chatbot* |

## Features

### Student App
- LINE OAuth login with guided onboarding
- Dashboard with bill summary, dorm score, upcoming events, and announcements
- Maintenance request submission with photo upload and appointment booking
- Real-time ticket status tracking and cancellation
- Parcel pickup notifications
- Billing details and payment status
- Dorm score breakdown by activity
- In-app chat with น้องซีมะโด่ง (AI chatbot)
- Push notifications (in-app + LINE)

### Admin Portal
- KPI dashboard with real-time stats
- Maintenance service desk (Kanban board + list view + detail modal)
- Technician management and assignment
- Student directory with tags and profile editing
- Announcement management with LINE Flex Message editor
- Message template library and LINE broadcast
- Billing creation and management
- Parcel registration and tracking
- Event management with attendance tracking
- Dorm score administration
- Knowledge base with folder hierarchy, document tags, and AI Q&A (RAG)
- Role-based access control (12 roles, 80+ permissions)

### LINE Integration
- LINE Login (OAuth) for authentication
- Chatbot น้องซีมะโด่ง with intent routing (repair, billing, score, events, parcels, knowledge Q&A)
- Flex Message notifications (6 templates: bill, booking, parcel, repair tracking, repair done, score)
- Webhook handling for events and messaging
- LIFF Mini App (scaffolded)

### AI Layer
- OpenAI GPT-4o-mini for chatbot conversations and RAG
- Gemini 2.0 Flash for repair image analysis (vision)
- Multi-agent RepairOrchestrator (template matching + vision + fallback)
- pgvector for document embeddings and repair template matching
- AI-generated insights and notification triggers

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16 |
| Language | TypeScript | 5.9 |
| UI | React | 19 |
| Styling | Tailwind CSS + shadcn/ui (new-york) | v4 |
| Database | Supabase (PostgreSQL + pgvector) | — |
| Auth | Supabase Auth + LINE OAuth | — |
| Server State | TanStack React Query | 5 |
| Client State | Zustand | 5 |
| AI (Text) | OpenAI GPT-4o-mini | — |
| AI (Vision) | Google Gemini 2.0 Flash | — |
| Messaging | LINE Messaging API + Bot SDK | 10 |
| i18n | next-intl | 4 |
| Forms | React Hook Form + Zod v4 | — |
| Animation | Framer Motion | 12 |
| Deployment | Vercel | — |

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Next.js 16     │────▶│    Supabase      │────▶│   PostgreSQL     │
│   App Router     │     │   Auth + RLS     │     │   + pgvector     │
└────────┬─────────┘     └──────────────────┘     └──────────────────┘
         │
         ├──▶ LINE Messaging API (webhooks, Flex messages, push notifications)
         ├──▶ OpenAI API (chatbot, RAG, insights)
         ├──▶ Google AI API (vision analysis)
         └──▶ Vercel (hosting, serverless functions)
```

> See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design document.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase CLI (for local development and migrations)
- LINE Developer Account (for messaging features)
- OpenAI API key (for chatbot and RAG)

### Installation

```bash
git clone https://github.com/klonqdoublek/c-madong-product.git
cd c-madong-product
pnpm install
```

### Environment Setup

Create a `.env.local` file with the required variables:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) for the full list.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                        # Next.js App Router (46 pages, 46 API routes)
│   ├── [locale]/               # i18n routing (th/en)
│   │   ├── (auth)/             # Login, register, onboarding
│   │   ├── (student)/          # Student-facing pages
│   │   └── admin/              # Admin portal pages
│   ├── api/                    # API routes (auth, chat, admin, student, webhooks)
│   └── liff/                   # LINE LIFF entry point
├── components/                 # 113 React components
│   ├── admin/                  # Admin components (16 directories)
│   ├── student/                # Student components
│   ├── maintenance/            # Maintenance/repair feature
│   ├── layout/                 # Shell, navigation, headers
│   └── ui/                     # 26 shadcn/ui primitives
├── hooks/                      # 23 custom React hooks
├── stores/                     # 6 Zustand stores
├── lib/
│   ├── supabase/               # DB client, server, admin, middleware, types
│   ├── line/                   # LINE client + 6 Flex message builders
│   ├── chatbot/                # Webhook handler, intent router, 8 handlers, RAG
│   ├── ai/                     # OpenAI, Gemini, orchestrator, vision agent
│   ├── rbac/                   # Permissions, roles, checks
│   └── notifications/          # In-app + LINE push notifications
├── messages/                   # i18n JSON (th.json, en.json)
└── styles/                     # Global CSS + Tailwind config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | Yes |
| `LINE_CHANNEL_ID` | LINE Messaging API channel ID | Yes |
| `LINE_CHANNEL_SECRET` | LINE Messaging API channel secret | Yes |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API access token | Yes |
| `LINE_LOGIN_CHANNEL_ID` | LINE Login channel ID (separate from Messaging) | Yes |
| `LINE_LOGIN_CHANNEL_SECRET` | LINE Login channel secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key for chatbot and RAG | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key for vision analysis | No |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for the app | Yes |

## Deployment

Deployed on **Vercel** with the following setup:

1. Connect the GitHub repository to Vercel
2. Set all environment variables in the Vercel dashboard
3. Deploy:

```bash
vercel --prod
```

> **Note:** The project uses a custom deploy workflow. See internal docs for details.

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document v2.0 |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [`docs/INFORMATION-ARCHITECTURE.md`](docs/INFORMATION-ARCHITECTURE.md) | Information architecture and navigation |
| [`docs/USER-FLOWS.md`](docs/USER-FLOWS.md) | User flow diagrams |
| [`docs/AI-ADAPTIVE-UX-PLAN.md`](docs/AI-ADAPTIVE-UX-PLAN.md) | AI/UX integration plan |
| [`docs/brand-guidelines.md`](docs/brand-guidelines.md) | Brand guidelines and design system |
| [`docs/design-system-rules.md`](docs/design-system-rules.md) | Design system rules (Figma-linked) |
| [`docs/rbac-implementation.md`](docs/rbac-implementation.md) | RBAC implementation details |
| [`docs/service-blueprint.md`](docs/service-blueprint.md) | Service blueprint |
| [`docs/cost-analysis.md`](docs/cost-analysis.md) | Infrastructure cost analysis |

## Roadmap

- [x] **Phase 0** — Project scaffold (46 pages)
- [x] **Phase 1** — Authentication (LINE OAuth + registration + onboarding)
- [x] **Phase 2** — Admin portal (15 admin pages)
- [x] **Phase 3** — Billing system
- [x] **Phase 4** — Parcel management (admin CRUD + student UI + chatbot Flex)
- [x] **Phase 5** — Dorm score tracking (DB + 21 UI files + admin CRUD)
- [x] **Phase 6** — AI UX (notifications, insights, chatbot enhancements)
- [ ] **Phase 4.5** — Vision AI for repair analysis (in progress)
- [ ] **Phase 7** — LIFF integration (scaffolded)
- [ ] **Phase 8** — Reports and analytics
- [ ] **Phase 9** — Polish and optimization
- [x] **LINE Chatbot** — น้องซีมะโด่ง (intent routing, RAG, repair flow, Flex cards)
- [x] **In-App Chat** — Chat modal with history and suggestion chips
- [x] **RBAC** — 12 roles, 80+ permissions, sidebar filtering
- [x] **Knowledge Base v3** — 2-panel layout, folder/tag CRUD, per-document AI Q&A

## Contributing

This is a private project for Chulalongkorn University dormitory management. Contributions are currently limited to the development team.

## License

All rights reserved.

---

## สรุปภาษาไทย

**C-Madong (ซีมะโด่ง)** คือแพลตฟอร์มดิจิทัลสำหรับบริหารจัดการหอพักจุฬาลงกรณ์มหาวิทยาลัย เชื่อมต่อนิสิตกับเจ้าหน้าที่ผ่านเว็บแอปและแชทบอท LINE ชื่อ "น้องซีมะโด่ง"

### ฟีเจอร์หลัก
- **นิสิต**: แจ้งซ่อม, ดูบิล, รับพัสดุ, ดูคะแนนหอ, แชทกับน้องซีมะโด่ง
- **เจ้าหน้าที่**: จัดการแจ้งซ่อม (Kanban), จัดการนิสิต, ประกาศ, บิล, พัสดุ, คลังความรู้
- **LINE**: ล็อกอินผ่าน LINE, แจ้งเตือน Flex Message, แชทบอท AI
- **AI**: RAG ตอบคำถาม, วิเคราะห์รูปแจ้งซ่อม, แจ้งเตือนอัจฉริยะ

### เริ่มต้นใช้งาน
```bash
git clone https://github.com/klonqdoublek/c-madong-product.git
cd c-madong-product
pnpm install
pnpm dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อเริ่มใช้งาน
