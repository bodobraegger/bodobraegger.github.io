-- Supabase Setup for DrawablePen - Version 2
-- One stroke per row for better performance

-- Create strokes table (replaces old drawings table)
CREATE TABLE IF NOT EXISTS public.strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id TEXT NOT NULL,
  stroke_id TEXT NOT NULL, -- client-generated unique ID for the stroke
  user_id TEXT NOT NULL,
  points JSONB NOT NULL, -- array of {x, y} points
  color TEXT NOT NULL,
  width NUMERIC NOT NULL,
  eraser BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on stroke_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS strokes_stroke_id_idx ON public.strokes(stroke_id);

-- Create index for canvas queries (most common query pattern)
CREATE INDEX IF NOT EXISTS strokes_canvas_id_created_idx ON public.strokes(canvas_id, created_at DESC);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS strokes_user_id_idx ON public.strokes(user_id);

-- Enable real-time for live collaboration
ALTER TABLE public.strokes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.strokes;

-- Enable Row Level Security
ALTER TABLE public.strokes ENABLE ROW LEVEL SECURITY;

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

-- Migration notes:
-- To migrate from old schema to new:
-- 1. Run this schema to create the new table
-- 2. Optionally migrate existing data:
--    INSERT INTO strokes (canvas_id, stroke_id, user_id, points, color, width, eraser, created_at)
--    SELECT 
--      canvas_id,
--      gen_random_uuid()::text,
--      COALESCE((stroke->>'userId')::text, 'legacy'),
--      stroke->'points',
--      COALESCE(stroke->>'color', '#111111'),
--      COALESCE((stroke->>'width')::numeric, 2),
--      COALESCE((stroke->>'eraser')::boolean, false),
--      updated_at
--    FROM drawings, jsonb_array_elements(strokes) AS stroke;
-- 3. Update DrawablePen component to use new schema
-- 4. Drop old table: DROP TABLE drawings;
