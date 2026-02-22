# Chula Dorm Connect - Lovable Admin Portal Analysis

**Repo**: https://github.com/klonqdoublek/chula-dorm-connect
**Built on**: Lovable (AI code gen platform)
**Purpose**: Admin/staff portal for dorm management & LINE messaging

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3 + TypeScript 5.8 + Vite 5.4 (port 8080) |
| Styling | Tailwind CSS 3.4 + shadcn/ui (60+ components) |
| Routing | React Router 6.30 |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Edge Functions) |
| Forms | React Hook Form 7.61 + Zod 3.25 |
| State | React Context (auth) + Supabase Realtime |
| Charts | Recharts 2.15 |
| Icons | Lucide React 0.462 |
| Fonts | Chulalongkorn + Noto Sans Thai + Inter |

## Pages (14 total)

| Page | Path | Description |
|---|---|---|
| Login | `/login` | Staff email/password login |
| Signup | `/signup` | Staff registration |
| Dashboard | `/dashboard` | Stats, recent announcements & tickets (realtime) |
| Announcements | `/announcements` | List all announcements (filter by status) |
| New Announcement | `/announcements/new` | Create/edit with Flex editor, scheduling, AI assist |
| Templates | `/templates` | LINE Flex message template library |
| New Template | `/templates/new` | Create message templates |
| Students | `/students` | Student directory (LINE IDs, rooms, tags) |
| Tags | `/tags` | Color-coded targeting tags |
| Service Desk | `/service-desk` | Kanban board for maintenance tickets |
| Service Desk List | `/service-desk/list` | Table view for tickets |
| Settings | `/settings` | AI API key configuration |
| Index | `/` | Redirect to dashboard |
| Not Found | `*` | 404 page |

## Database Schema (6 tables)

1. **profiles** - Staff user profiles (id, user_id, email, full_name, role, avatar_url)
2. **students** - Student records (line_user_id, student_id, display_name, tags[], status, building, floor, room_number, bed)
3. **announcements** - Messages (title, content, message_type text/flex, flex_json, scheduled_at, status draft/scheduled/sent/failed, target_type broadcast/targeted, target_tags[])
4. **message_templates** - Reusable templates (name, description, category, message_type, content, flex_json)
5. **tags** - Targeting tags (name, description, color)
6. **maintenance_tickets** - Repair requests (student_id, line_user_id, category enum, description, urgency, status enum, failure_reason, admin_notes, photo_urls[], room_number, building, floor)

### Enums
- **ticket_status**: new, received, in_progress, completed, failed
- **ticket_category**: plumbing, electrical, ac, furniture, internet, cleaning, other

### RLS
- All tables have RLS enabled
- Policies: all authenticated users can CRUD (permissive)

## Supabase Edge Functions (7)

1. **send-broadcast** - Send LINE messages (text or Flex) to broadcast or tagged students
2. **line-webhook** - Handle LINE platform callbacks (follow/unfollow/message events)
3. **send-repair-notification** - Notify students of ticket status changes via LINE
4. **process-scheduled-broadcasts** - Cron job to send due scheduled announcements
5. **sync-line-followers** - Sync LINE bot follower list to students table
6. **generate-copy** - AI Thai text generation for announcements
7. **generate-image** - AI image generation for Flex messages

## Key Components

- **DashboardLayout** - Sidebar nav, mobile menu, user info, logout
- **ProtectedRoute** - Auth guard (redirects to /login)
- **FlexMessageEditor** - Visual LINE Flex message builder with templates
- **FlexMessagePreview** - Renders Flex messages visually
- **AIWritingAssistant** - AI copy generation (uses localStorage API key)
- **RecurringScheduleConfig** - Daily/weekly/monthly scheduling
- **TicketDetailModal** - Ticket status editor with notes
- **ImageUploader** - Image upload for messages

## Key Features

- LINE Flex message visual editor + preview
- Scheduled & recurring announcements (daily/weekly/monthly)
- Tag-based targeted broadcasting
- AI-assisted Thai copy generation
- Real-time Kanban board for maintenance tickets
- Drag-and-drop ticket status changes
- Real-time dashboard statistics
- Thai language UI throughout
- Mobile-responsive design

## Project Structure

```
src/
├── pages/              # 14 page components
├── components/
│   ├── layout/         # DashboardLayout
│   ├── ui/             # shadcn/ui (60+ components)
│   ├── service-desk/   # TicketDetailModal
│   └── flex-editor/    # ImageUploader, FlexAIWritingAssistant
├── contexts/           # AuthContext
├── hooks/              # useAuth, use-toast, use-mobile
├── integrations/supabase/  # client.ts, types.ts (auto-generated)
├── types/              # maintenance.ts
└── lib/                # utils.ts (cn helper)

supabase/
├── config.toml
├── migrations/         # 6 SQL migrations
└── functions/          # 7 edge functions (Deno)
```

## Differences from c-madong-product

| Aspect | c-madong-product | chula-dorm-connect |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 18 + Vite |
| Routing | File-based (next-intl) | React Router 6 |
| i18n | next-intl v4 (th/en) | Hardcoded Thai |
| Tailwind | v4 | v3 |
| shadcn style | new-york | default |
| State | Zustand + TanStack Query | React Context |
| Supabase | @supabase/ssr | @supabase/supabase-js |
| Auth | LINE Login OAuth (planned) | Email/password |
| Target user | Students | Staff/Admin |
| TypeScript | Strict (default) | Relaxed (noImplicitAny: false) |

## Quality Notes

**Strengths**: Clean structure, comprehensive UI, proper auth guards, real-time subscriptions, good Supabase integration, all features functional.

**Issues to address for integration**:
- TypeScript strict mode disabled
- Permissive RLS (needs proper role-based policies)
- No pagination on list views
- API keys in localStorage (should use server-side)
- Large monolithic page components (Students ~35KB, NewAnnouncement ~31KB)
- Minimal test coverage
- Different tech choices from c-madong-product (Vite vs Next.js, Router vs App Router, etc.)

## Integration Considerations

When integrating into c-madong-product:
- Admin pages already have route structure at `src/app/[locale]/admin/`
- Need to port React Router pages → Next.js App Router pages
- Need to adapt to next-intl (extract Thai strings to messages files)
- Need to switch from @supabase/supabase-js to @supabase/ssr
- Supabase migrations can likely be reused/adapted
- Edge functions can be reused as-is
- shadcn/ui components mostly portable (may need new-york style adjustments)
- FlexMessageEditor, FlexMessagePreview, AIWritingAssistant are key custom components to port
- DashboardLayout → adapt to existing admin-shell pattern
- Need to reconcile database schemas (c-madong has profiles/buildings/rooms/beds planned)
