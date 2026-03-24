-- ==========================================
-- SAMS HACKATHON MODE: ALLOW SELF-ROLE UPDATE
-- ==========================================

-- Relax profiles RLS to allow users to change their own role 
-- (Required for the hackathon "Quick Switcher" feature)

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: In a real production system, this would be restricted to Admins.
-- This is intentionally relaxed for hackathon demo flexibility.
