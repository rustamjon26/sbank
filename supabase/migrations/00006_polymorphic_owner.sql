-- 1. Create departments and branches tables for polymorphic associations

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

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for all users on departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins on deps" ON public.departments USING (true);
CREATE POLICY "Enable all access for admins on branches" ON public.branches USING (true);

-- 2. Seed initial data from existing employees and assets to ensure backward compatibility
INSERT INTO public.departments (name)
SELECT DISTINCT department FROM public.employees WHERE department IS NOT NULL AND department != '' 
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.branches (name)
SELECT DISTINCT branch FROM public.employees WHERE branch IS NOT NULL AND branch != ''
ON CONFLICT (name) DO NOTHING;
