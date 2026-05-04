-- SECURITY: Prevent public deletion of drawings

-- First, drop any existing delete policy (if it exists)
DROP POLICY IF EXISTS "Allow public delete" ON public.drawings;

-- Verify no delete policy exists (should return 0 rows for DELETE)
SELECT * FROM pg_policies 
WHERE tablename = 'drawings' 
AND cmd = 'DELETE';

-- Optional: Create an admin-only delete policy
-- Uncomment if you want only authenticated admins to delete
-- CREATE POLICY "Admin only delete" ON public.drawings
--   FOR DELETE 
--   USING (auth.uid() IN (
--     SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
--   ));

-- Test that delete is blocked (should fail with permission error)
-- DELETE FROM public.drawings WHERE id = 'test';

-- Verify current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'drawings';
