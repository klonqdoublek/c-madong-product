-- ============================================================
-- C-Madong Chatbot Tables Migration
-- Creates tables for: chatbot sessions, chat history,
-- documents (RAG), score tracking, dorm events
-- ============================================================

-- Enable pgvector extension for RAG embeddings
create extension if not exists vector with schema extensions;

-- ============================================================
-- 1. Chatbot Sessions
-- Tracks conversation state per LINE user
-- ============================================================
create table if not exists public.chatbot_sessions (
  id uuid primary key default gen_random_uuid(),
  line_uid text not null,
  state text not null default 'idle',
  state_data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_chatbot_sessions_line_uid
  on public.chatbot_sessions (line_uid);

alter table public.chatbot_sessions enable row level security;

-- ============================================================
-- 2. AI Chat Messages
-- Stores full conversation history
-- ============================================================
create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  student_id text,
  session_id uuid references public.chatbot_sessions(id) on delete cascade,
  line_uid text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  intent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session
  on public.ai_chat_messages (session_id, created_at);
create index if not exists idx_chat_messages_line_uid
  on public.ai_chat_messages (line_uid, created_at desc);

alter table public.ai_chat_messages enable row level security;

-- ============================================================
-- 3. Documents (for RAG knowledge base)
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source text,
  metadata jsonb not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

-- ============================================================
-- 4. Document Sections (chunked + embedded for vector search)
-- ============================================================
create table if not exists public.document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  token_count integer,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_document_sections_document
  on public.document_sections (document_id);

-- HNSW index for fast vector similarity search
create index if not exists idx_document_sections_embedding
  on public.document_sections
  using hnsw (embedding vector_cosine_ops);

alter table public.document_sections enable row level security;

-- ============================================================
-- 5. Score Categories
-- ============================================================
create table if not exists public.score_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  max_score integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.score_categories enable row level security;

-- Seed default categories
insert into public.score_categories (name, slug, max_score) values
  ('กิจกรรมหอพัก', 'activities', 100),
  ('จิตอาสา', 'community-service', 100),
  ('การปฏิบัติตามกฎ', 'rules', 100),
  ('การประชุมหอพัก', 'meetings', 100)
on conflict (slug) do nothing;

-- ============================================================
-- 6. Score Entries
-- Individual score records per student per category
-- ============================================================
create table if not exists public.score_entries (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  category_id uuid not null references public.score_categories(id) on delete cascade,
  points integer not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_score_entries_student
  on public.score_entries (student_id);

alter table public.score_entries enable row level security;

-- ============================================================
-- 7. Dorm Events
-- ============================================================
create table if not exists public.dorm_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  event_status text not null default 'upcoming',
  created_at timestamptz not null default now()
);

alter table public.dorm_events enable row level security;

-- ============================================================
-- 8. Event Attendance
-- ============================================================
create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.dorm_events(id) on delete cascade,
  student_id text not null,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_event_attendance_unique
  on public.event_attendance (event_id, student_id);

alter table public.event_attendance enable row level security;

-- ============================================================
-- 9. RPC: match_documents (vector similarity search)
-- Used by RAG pipeline to find relevant document sections
-- ============================================================
create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ds.id,
    ds.document_id,
    ds.content,
    1 - (ds.embedding <=> query_embedding) as similarity
  from public.document_sections ds
  where 1 - (ds.embedding <=> query_embedding) > match_threshold
  order by ds.embedding <=> query_embedding
  limit match_count;
end;
$$;
