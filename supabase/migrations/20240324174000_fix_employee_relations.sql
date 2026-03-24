-- ==========================================
-- SAMS FINAL RELATIONSHIP FIX (EMPLOYEES & POLYMORPHIC)
-- ==========================================

-- 1. Correct the type of current_owner_id in assets (Ensure it's UUID)
-- We need to cast it while altering the column to avoid type mismatch errors
ALTER TABLE public.assets 
ALTER COLUMN current_owner_id TYPE uuid USING (current_owner_id::uuid);

-- 2. Ensure assets table has the correct foreign key for employees
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_current_owner_id_fkey;
ALTER TABLE public.assets 
ADD CONSTRAINT assets_current_owner_id_fkey 
FOREIGN KEY (current_owner_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- 3. Correct assignment history relations (owner_id in history should also be UUID if possible)
-- Note: owner_id in history is polymorphic, so we keep it as text if it holds branch/dept names, 
-- but since our system now uses UUIDs for all entities, we ensure the column can handle it.
ALTER TABLE public.asset_assignment_history 
ALTER COLUMN owner_id TYPE uuid USING (owner_id::uuid);

ALTER TABLE public.asset_assignment_history DROP CONSTRAINT IF EXISTS asset_assignment_history_asset_id_fkey;
ALTER TABLE public.asset_assignment_history 
ADD CONSTRAINT asset_assignment_history_asset_id_fkey 
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- 4. Fix profiles references
ALTER TABLE public.asset_status_history DROP CONSTRAINT IF EXISTS asset_status_history_changed_by_fkey;
ALTER TABLE public.asset_status_history 
ADD CONSTRAINT asset_status_history_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Verify RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all" ON public.employees;
CREATE POLICY "Enable read access for all" ON public.employees FOR SELECT USING (true);
