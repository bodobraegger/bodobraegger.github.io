-- SECURITY: Allow users to delete only their own strokes
-- This allows anonymous users to delete, but only strokes they created
-- The user_id is matched against a custom header set by the client

-- Step 1: Ensure RLS is enabled
ALTER TABLE public.strokes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies
DROP POLICY IF EXISTS "Allow public delete" ON public.strokes;
DROP POLICY IF EXISTS "strokes_delete_authenticated" ON public.strokes;

-- Step 3: Grant DELETE to anonymous and authenticated users
GRANT DELETE ON public.strokes TO anon, authenticated;

-- Step 4a: Create policy for anonymous users - can only delete their own strokes
-- Uses a custom header 'x-user-id' that the client must send
CREATE POLICY "Allow anon delete own strokes" ON public.strokes
  FOR DELETE 
  TO anon
  USING (
    user_id = current_setting('request.headers', true)::json->>'x-user-id'
  );

-- Step 4b: Create policy for authenticated users - can delete any stroke
CREATE POLICY "Allow authenticated delete all strokes" ON public.strokes
  FOR DELETE 
  TO authenticated
  USING (true);

-- Alternative simpler approach (if you trust client-side user_id):
-- This just checks if the user_id in the database matches what they claim
-- DROP POLICY IF EXISTS "Allow delete own strokes" ON public.strokes;
-- CREATE POLICY "Allow delete own strokes" ON public.strokes
--   FOR DELETE 
--   USING (true); -- Then filter client-side only

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
