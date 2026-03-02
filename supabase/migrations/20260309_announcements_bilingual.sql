-- Add bilingual columns to announcements table (Lovable origin has title/content only)
-- Also add author_id alias, cover_image, is_pinned

-- Bilingual title/content columns
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title_th TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS content_th TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS content_en TEXT;

-- Copy existing title/content to Thai columns for existing rows
UPDATE public.announcements SET title_th = title WHERE title_th IS NULL AND title IS NOT NULL;
UPDATE public.announcements SET content_th = content WHERE content_th IS NULL AND content IS NOT NULL;

-- Set defaults for title_th NOT NULL
UPDATE public.announcements SET title_th = COALESCE(title_th, '') WHERE title_th IS NULL;
ALTER TABLE public.announcements ALTER COLUMN title_th SET NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN title_th SET DEFAULT '';

-- Set defaults for content_th
UPDATE public.announcements SET content_th = COALESCE(content_th, '') WHERE content_th IS NULL;
ALTER TABLE public.announcements ALTER COLUMN content_th SET NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN content_th SET DEFAULT '';

-- title_en defaults to empty
UPDATE public.announcements SET title_en = COALESCE(title_en, '') WHERE title_en IS NULL;
ALTER TABLE public.announcements ALTER COLUMN title_en SET NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN title_en SET DEFAULT '';

-- content_en defaults to empty
UPDATE public.announcements SET content_en = COALESCE(content_en, '') WHERE content_en IS NULL;
ALTER TABLE public.announcements ALTER COLUMN content_en SET NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN content_en SET DEFAULT '';

-- Add author_id as alias for created_by (app code uses author_id)
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE public.announcements SET author_id = created_by WHERE author_id IS NULL AND created_by IS NOT NULL;

-- Additional columns expected by the app
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add is_active to message_templates (expected by app types)
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
