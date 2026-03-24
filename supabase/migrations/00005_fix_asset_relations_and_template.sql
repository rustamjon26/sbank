-- Fix 1: Remove foreign key constraint on current_owner_id to allow branch/department assignment
DO $$
DECLARE
    fk_name text;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.key_column_usage
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'current_owner_id';

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.assets DROP CONSTRAINT ' || fk_name;
    END IF;
END $$;

-- Change current_owner_id and owner_id columns to text
ALTER TABLE public.assets ALTER COLUMN current_owner_id TYPE text;
ALTER TABLE public.asset_assignment_history ALTER COLUMN owner_id TYPE text;

-- Fix 5: Standardize user profile trigger
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
