-- ==========================================
-- SAMS EMERGENCY PRODUCTION FIX (RLS & SCHEMA)
-- ==========================================

-- 1. Ensure departments and branches tables exist
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS and set public read policies (required for dashboard overview)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users on departments" ON public.departments;
CREATE POLICY "Enable read access for all users on departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on branches" ON public.branches;
CREATE POLICY "Enable read access for all users on branches" ON public.branches FOR SELECT USING (true);

-- 3. Fix Assets RLS (Allow employees to see all, but only managers/admins to edit)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated users can view assets" ON public.assets;
CREATE POLICY "All authenticated users can view assets" ON public.assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Managers and admins can manage assets" ON public.assets;
CREATE POLICY "Managers and admins can manage assets" ON public.assets FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'asset_manager')));

-- 4. Fix profiles RLS (Ensuring users can see their own role correctly)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Common users update own profile" ON public.profiles;
CREATE POLICY "Common users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Seed some initial data if empty
INSERT INTO public.departments (name) VALUES ('Operations'), ('IT Support'), ('Security'), ('HR') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.branches (name) VALUES ('Main Office'), ('Regional Hub'), ('Digital Branch') ON CONFLICT (name) DO NOTHING;
