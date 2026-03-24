-- Fix the trigger to fire on INSERT since we disabled email confirmations
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill existing auth.users who don't have a profile yet
DO $$ 
DECLARE
  u record;
  user_count int;
  extracted_username text;
BEGIN
  FOR u IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    -- Extract username from email (remove @smartasset.local)
    extracted_username := REPLACE(u.email, '@smartasset.local', '');
    
    INSERT INTO public.profiles (id, username, email, role)
    VALUES (
      u.id,
      extracted_username,
      u.email,
      CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'employee'::public.user_role END
    );
  END LOOP;
END $$;
