-- ==========================================
-- SAMS AUTH AUTOMATION & SECURITY FIX
-- ==========================================

-- 1. Create/Update handle_new_user() function
-- SECURITY DEFINER ensures it can insert into profiles table even if RLS is tight
-- search_path is set to public for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- Count existing profiles to assign the first user as admin
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Extract username from email or use a default if email is missing
  extracted_username := COALESCE(
    SPLIT_PART(NEW.email, '@', 1),
    'user_id_' || substr(NEW.id::text, 1, 5)
  );

  -- Handle potential username duplicates (add short suffix if exists)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = extracted_username) THEN
    extracted_username := extracted_username || '_' || substr(NEW.id::text, 1, 3);
  END IF;

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

-- 2. Re-apply the trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill missing profiles for existing users
-- This ensures anyone who previously signed up but missed the trigger gets a profile
DO $$ 
DECLARE
  u record;
  user_count int;
  extracted_username text;
BEGIN
  -- Iterate through users who don't have a profile yet
  FOR u IN 
    SELECT * FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    extracted_username := COALESCE(
      SPLIT_PART(u.email, '@', 1),
      'user_id_' || substr(u.id::text, 1, 5)
    );

    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = extracted_username) THEN
      extracted_username := extracted_username || '_' || substr(u.id::text, 1, 3);
    END IF;
    
    INSERT INTO public.profiles (id, username, email, role)
    VALUES (
      u.id,
      extracted_username,
      u.email,
      CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'employee'::public.user_role END
    );
  END LOOP;
END $$;

-- 4. Fix Security Issue: public_profiles view
-- Recreate the view with security_invoker = true (supported in Postgres 15+)
-- This ensures the view respects the Row Level Security (RLS) policies 
-- of the underlying profiles table for the querying user.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
  SELECT id, username, first_name, last_name, department, branch, role FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO service_role;
