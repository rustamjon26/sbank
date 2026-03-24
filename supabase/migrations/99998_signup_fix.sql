-- ==========================================
-- SAMS FINAL SIGNUP FIX (RUN IN SQL EDITOR)
-- ==========================================

-- 1. Avvalgi xatoliklarni tozalash (Agar profillar qolib ketgan bo'ls)
-- Diqqat: Bu barcha mavjud profillarni o'chiradi (auth.users o'chmaydi)
TRUNCATE public.profiles CASCADE;

-- 2. Trigger funksiyasini yanada mustahkam qilish
-- Bu funksiya email'dan username ajratib oladi va birinchi foydalanuvchini ADMIN qiladi
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Email'dan username ajratish (agar email bo'lmasa, name'dan oladi)
  extracted_username := COALESCE(
    REPLACE(NEW.email, '@smartasset.local', ''),
    'user_' || substr(NEW.id::text, 1, 5)
  );
  
  -- Agar username allaqachon mavjud bo'lsa, ID qo'shib yuboramiz
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

-- 3. Triggerni qayta o'rnatish (Har bir yangi user uchun ishlaydi)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. RLS qoidalarini tekshirish (Hamma o'z profilini ko'rishi va yangilashi uchun)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 🛠 DASHBOARD'DA TEKSHIRISH (Dashboard Checklist):
-- ==========================================
-- 1. Authentication > Settings > "Confirm email" OFF bo'lishi shart.
-- 2. Authentication > Settings > "Allow new users to sign up" ON bo'lishi shart.
-- 3. Agar avval ruyxatdan o'tgan bo'lsangiz, Authentication > Users bo'limidan 
--    o'sha userlarni o'chirib tashlang (fresh start uchun).
