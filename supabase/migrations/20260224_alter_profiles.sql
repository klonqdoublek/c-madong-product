-- Alter existing profiles table to match Phase 1 schema
-- The table was created by Lovable with a different schema

-- Add missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name_th TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name_en TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_uid TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.rooms(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.beds(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS move_in_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'th';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Copy full_name to full_name_th for existing rows if full_name exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    UPDATE public.profiles SET full_name_th = full_name WHERE full_name_th IS NULL AND full_name IS NOT NULL;
  END IF;
END $$;

-- Set full_name_th NOT NULL default for existing NULL rows
UPDATE public.profiles SET full_name_th = COALESCE(full_name_th, 'Unknown') WHERE full_name_th IS NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name_th SET NOT NULL;

-- Add role check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
    -- Update existing roles to match new enum before adding constraint
    UPDATE public.profiles SET role = 'admin' WHERE role = 'staff';
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'committee', 'admin', 'head'));
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile') THEN
    CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can read all profiles') THEN
    CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'head'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can insert profiles') THEN
    CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profiles_updated') THEN
    CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Also add gender to buildings if missing
ALTER TABLE public.buildings ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'mixed' CHECK (gender IN ('male', 'female', 'mixed'));
