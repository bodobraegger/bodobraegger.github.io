-- SECURITY: Require authentication for deleting strokes
-- This script uses a two-layer approach for maximum security:
-- 1. Revoke DELETE privilege from anonymous users at the database level
-- 2. Enable RLS and create a DELETE policy only for authenticated users

-- Step 1: Revoke DELETE privilege from anonymous and public roles
-- This prevents unauthenticated users from even attempting DELETE operations
REVOKE DELETE ON public.strokes FROM anon, PUBLIC;

-- Step 2: Drop the old insecure policy if it exists
DROP POLICY IF EXISTS "Allow public delete" ON public.strokes;

-- Step 3: Ensure Row Level Security is enabled
ALTER TABLE public.strokes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a DELETE policy ONLY for authenticated users
-- The "TO authenticated" clause means only authenticated role can use this policy
-- The "USING (true)" means any authenticated user can delete any stroke
CREATE POLICY "strokes_delete_authenticated"
ON public.strokes
FOR DELETE
TO authenticated
USING (true);

-- Verification queries
-- ============================================================

-- Verify the new policy is in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'strokes'
ORDER BY cmd, policyname;

-- Verify that RLS is enabled (should return true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'strokes';

-- Verify privileges (anon should NOT have DELETE)
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'strokes'
ORDER BY grantee, privilege_type;
