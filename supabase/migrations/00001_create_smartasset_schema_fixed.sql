-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('employee', 'asset_manager', 'admin');

-- Create asset status enum
CREATE TYPE public.asset_status AS ENUM ('REGISTERED', 'ASSIGNED', 'IN_REPAIR', 'LOST', 'WRITTEN_OFF');

-- Create asset category enum
CREATE TYPE public.asset_category AS ENUM ('IT', 'OFFICE', 'SECURITY', 'NETWORK', 'OTHER');

-- Create audit action type enum
CREATE TYPE public.audit_action_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'RETURN', 'STATUS_CHANGE', 'REPAIR', 'VERIFY');

-- Create owner type enum
CREATE TYPE public.owner_type AS ENUM ('employee', 'department', 'branch');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text,
  phone text,
  first_name text,
  last_name text,
  department text,
  branch text,
  role public.user_role NOT NULL DEFAULT 'employee',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  branch text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  asset_type text NOT NULL,
  category public.asset_category NOT NULL,
  serial_number text UNIQUE NOT NULL,
  image_url text,
  purchase_date date NOT NULL,
  branch text NOT NULL,
  department text NOT NULL,
  status public.asset_status NOT NULL DEFAULT 'REGISTERED',
  current_owner_id uuid,
  current_owner_type public.owner_type,
  qr_code_data text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (current_owner_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create asset assignment history table
CREATE TABLE public.asset_assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  owner_type public.owner_type NOT NULL,
  owner_name text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz,
  status_during_assignment public.asset_status NOT NULL,
  reason text,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create asset status history table
CREATE TABLE public.asset_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  previous_status public.asset_status,
  new_status public.asset_status NOT NULL,
  reason text,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action_type public.audit_action_type NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_name text,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_assets_serial ON assets(serial_number);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_owner ON assets(current_owner_id);
CREATE INDEX idx_assignment_asset ON asset_assignment_history(asset_id);
CREATE INDEX idx_assignment_owner ON asset_assignment_history(owner_id);
CREATE INDEX idx_status_history_asset ON asset_status_history(asset_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Create helper function to check if user is asset manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role IN ('admin'::user_role, 'asset_manager'::user_role)
  );
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @smartasset.local)
  extracted_username := REPLACE(NEW.email, '@smartasset.local', '');
  
  -- Insert a profile synced with fields collected at signup
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'employee'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Employees policies
CREATE POLICY "Managers and admins can manage employees" ON employees
  FOR ALL TO authenticated USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "All authenticated users can view employees" ON employees
  FOR SELECT TO authenticated USING (true);

-- Assets policies
CREATE POLICY "Managers and admins can manage assets" ON assets
  FOR ALL TO authenticated USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "All authenticated users can view assets" ON assets
  FOR SELECT TO authenticated USING (true);

-- Assignment history policies
CREATE POLICY "Managers and admins can manage assignment history" ON asset_assignment_history
  FOR ALL TO authenticated USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "All authenticated users can view assignment history" ON asset_assignment_history
  FOR SELECT TO authenticated USING (true);

-- Status history policies
CREATE POLICY "Managers and admins can manage status history" ON asset_status_history
  FOR ALL TO authenticated USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "All authenticated users can view status history" ON asset_status_history
  FOR SELECT TO authenticated USING (true);

-- Audit logs policies
CREATE POLICY "Managers and admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create public view for shareable profile info
CREATE VIEW public_profiles AS
  SELECT id, username, first_name, last_name, department, branch, role FROM profiles;