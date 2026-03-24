-- ==========================================
-- SAMS DEMO ROLES SETUP (RUN AFTER SIGNUP)
-- ==========================================

-- Diqqat: Bu SQL kodini ushbu 3 ta email orqali ruyxatdan o'tgandan so'ng 
-- Supabase SQL Editor'da bir marta ishlatib yuboring.

-- 1. Admin rolini o'rnatish
UPDATE public.profiles 
SET role = 'admin'::public.user_role 
WHERE email = 'admin@smartasset.local';

-- 2. Asset Manager rolini o'rnatish
UPDATE public.profiles 
SET role = 'asset_manager'::public.user_role 
WHERE email = 'manager@smartasset.local';

-- 3. Oddiy Xodim rolini o'rnatish
UPDATE public.profiles 
SET role = 'employee'::public.user_role 
WHERE email = 'employee@smartasset.local';

-- Natijani tekshirish
SELECT email, role FROM public.profiles;
