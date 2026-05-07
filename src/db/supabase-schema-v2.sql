-- Supabase Setup for DrawablePen - Version 2
-- One stroke per row for better performance
-- Compatible with Supabase (PostgreSQL 15+)

-- Step 1: Drop old table if exists (CAUTION: this deletes data!)
-- Uncomment the next line if you want a clean slate
-- DROP TABLE IF EXISTS public.strokes CASCADE;

-- Step 2: Create strokes table (replaces old drawings table)
CREATE TABLE IF NOT EXISTS public.strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stroke_id TEXT NOT NULL UNIQUE, -- client-generated unique ID for the stroke
  canvas_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  points JSONB NOT NULL, -- array of {x, y} points
  color TEXT NOT NULL,
  width NUMERIC NOT NULL,
  eraser BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS strokes_canvas_id_created_idx ON public.strokes(canvas_id, created_at DESC);
CREATE INDEX IF NOT EXISTS strokes_user_id_idx ON public.strokes(user_id);

-- Step 4: Enable real-time for live collaboration
ALTER TABLE public.strokes REPLICA IDENTITY FULL;

-- Add table to realtime publication (suppress error if already exists)
DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.strokes;
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 5: Enable Row Level Security
ALTER TABLE public.strokes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Allow public read" ON public.strokes;
DROP POLICY IF EXISTS "Allow public insert" ON public.strokes;
DROP POLICY IF EXISTS "Allow public delete" ON public.strokes;

-- Allow public read
CREATE POLICY "Allow public read" ON public.strokes
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON public.strokes
  FOR INSERT WITH CHECK (true);

-- Allow public delete (for undo)
CREATE POLICY "Allow public delete" ON public.strokes
  FOR DELETE USING (true);

-- PREVENT updates (strokes are immutable)
-- No update policy means users cannot modify existing strokes

-- ============================================================
-- MIGRATION FROM OLD SCHEMA
-- ============================================================
-- Run this section AFTER creating the new table if you have 
-- existing data in the old 'drawings' table
-- ============================================================

-- IMPORTANT: Migration preserves the EXACT current state from drawings table
-- This migrates only the most recent version of each canvas

-- Uncomment and run this block to migrate data:
/*
DO $$ 
DECLARE
  migration_count INTEGER;
BEGIN
  -- Check if old drawings table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'drawings') THEN
    
    -- Migrate data from old drawings table to new strokes table
    -- Only migrate the LATEST state of each canvas (most recent updated_at)
    WITH latest_drawings AS (
      SELECT DISTINCT ON (canvas_id) 
        id, canvas_id, strokes, updated_at
      FROM public.drawings
      ORDER BY canvas_id, updated_at DESC
    )
    INSERT INTO public.strokes (stroke_id, canvas_id, user_id, points, color, width, eraser, created_at)
    SELECT 
      concat(canvas_id, '_', 
             (row_number() OVER (PARTITION BY canvas_id ORDER BY ordinality))::text, '_', 
             substr(md5(stroke::text), 1, 12)) as stroke_id,
      canvas_id,
      COALESCE((stroke->>'userId')::text, 'legacy') as user_id,
      stroke->'points' as points,
      COALESCE(stroke->>'color', '#111111') as color,
      COALESCE((stroke->>'width')::numeric, 2) as width,
      COALESCE((stroke->>'isEraser')::boolean, false) as eraser,
      COALESCE(updated_at, NOW()) as created_at
    FROM latest_drawings, 
         jsonb_array_elements(strokes) WITH ORDINALITY AS stroke
    ON CONFLICT (stroke_id) DO NOTHING;
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % strokes from drawings table', migration_count;
    
    -- Show what was migrated
    RAISE NOTICE 'Migrated from % unique canvases', (SELECT COUNT(DISTINCT canvas_id) FROM latest_drawings);
    
    -- Optionally drop old table after successful migration
    -- Uncomment the next line to remove the old table:
    -- DROP TABLE public.drawings;
    
  ELSE
    RAISE NOTICE 'No drawings table found, skipping migration';
  END IF;
END $$;
*/

-- ============================================================
-- VERIFICATION
-- ============================================================
-- After running this script, verify with:
-- SELECT COUNT(*) FROM public.strokes;
-- SELECT * FROM public.strokes LIMIT 5;
