-- Allow all authenticated users to read audit logs for transparency
-- This ensures employees can see the history of assets assigned to them
DROP POLICY IF EXISTS "Managers and admins can view audit logs" ON audit_logs;

CREATE POLICY "All authenticated users can view audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (true);
