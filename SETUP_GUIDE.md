# SmartAsset AI - Complete Setup Guide

## Step 1: Supabase Project Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note down your project URL and anon key from Settings > API

## Step 2: Database Schema Setup

Run the following SQL in your Supabase SQL Editor:

```sql
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
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

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
  FOR INSERT TO authenticated USING (true);

-- Create public view for shareable profile info
CREATE VIEW public_profiles AS
  SELECT id, username, first_name, last_name, department, branch, role FROM profiles;
```

## Step 3: Seed Data (Optional)

Run this SQL to add sample data:

```sql
-- Insert seed employees
INSERT INTO public.employees (first_name, last_name, email, department, branch) VALUES
('John', 'Smith', 'john.smith@bank.com', 'IT', 'Headquarters'),
('Sarah', 'Johnson', 'sarah.johnson@bank.com', 'Finance', 'Branch A'),
('Michael', 'Brown', 'michael.brown@bank.com', 'Operations', 'Branch B'),
('Emily', 'Davis', 'emily.davis@bank.com', 'HR', 'Headquarters'),
('David', 'Wilson', 'david.wilson@bank.com', 'Security', 'Branch A');

-- Insert seed assets
INSERT INTO public.assets (name, asset_type, category, serial_number, purchase_date, branch, department, status, qr_code_data) VALUES
('Dell Laptop XPS 15', 'Laptop', 'IT', 'SN-LAPTOP-001', '2023-01-15', 'Headquarters', 'IT', 'REGISTERED', 'ASSET-SN-LAPTOP-001'),
('HP Printer LaserJet', 'Printer', 'OFFICE', 'SN-PRINTER-001', '2022-06-20', 'Branch A', 'Operations', 'REGISTERED', 'ASSET-SN-PRINTER-001'),
('Cisco Router 2900', 'Router', 'NETWORK', 'SN-ROUTER-001', '2021-03-10', 'Headquarters', 'IT', 'REGISTERED', 'ASSET-SN-ROUTER-001'),
('Security Camera HD', 'Camera', 'SECURITY', 'SN-CAMERA-001', '2022-09-05', 'Branch A', 'Security', 'REGISTERED', 'ASSET-SN-CAMERA-001'),
('Office Desk Standard', 'Desk', 'OFFICE', 'SN-DESK-001', '2020-11-12', 'Branch B', 'Operations', 'REGISTERED', 'ASSET-SN-DESK-001');
```

## Step 4: Storage Bucket Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named: `app-aat6qq6efrpd_assets_images`
3. Set the bucket to **Public**
4. Add the following policy for uploads:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-aat6qq6efrpd_assets_images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-aat6qq6efrpd_assets_images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-aat6qq6efrpd_assets_images');
```

## Step 5: Disable Email Confirmation

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Disable "Enable email confirmations"
3. This allows users to login immediately after signup

## Step 6: Application Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
pnpm dev
```

## Step 7: First User Registration

1. Open the application
2. Click "Sign Up"
3. Enter a username and password
4. The first user will automatically become an admin
5. You can now access the Admin panel to manage other users

## Verification Checklist

- [x] Database tables created successfully
- [x] RLS policies enabled
- [x] Foreign keys linked (Employees connected)
- [x] Storage bucket created and configured
- [x] Email confirmation disabled
- [x] Environment variables configured
- [x] Application starts without errors
- [x] Can register first user
- [x] First user has admin role
- [x] Demo roles correctly assigned
- [x] SQL Fixes applied (99998, 99999)

## Troubleshooting

### Issue: Cannot create assets

- Check that you're logged in as admin or asset_manager
- Verify RLS policies are correctly set

### Issue: Image upload fails

- Verify storage bucket exists
- Check bucket policies allow uploads
- Ensure bucket name matches in code

### Issue: First user not admin

- Check the trigger `on_auth_user_confirmed` exists
- Verify the `handle_new_user` function is correct

### Issue: Cannot see other users' data

- This is expected - RLS policies restrict access
- Admins and managers have broader access

## Support

For issues or questions, refer to:

- Supabase Documentation: https://supabase.com/docs
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
