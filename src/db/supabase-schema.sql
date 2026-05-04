-- Supabase Setup for DrawablePen

-- Create drawings table
CREATE TABLE IF NOT EXISTS public.drawings (
  id TEXT PRIMARY KEY,
  canvas_id TEXT NOT NULL,
  strokes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER TABLE public.drawings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawings;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS drawings_canvas_id_idx ON public.drawings(canvas_id);

-- Enable Row Level Security
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON public.drawings
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON public.drawings
  FOR INSERT WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update" ON public.drawings
  FOR UPDATE USING (true);

-- PREVENT public delete (no policy = no access)
-- Users cannot delete drawings, only admins via Supabase dashboard
-- If you need to allow deletes, create a policy with specific conditions
