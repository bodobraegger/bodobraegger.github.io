-- Supabase Setup for DrawablePen
-- Run this SQL in your Supabase SQL Editor

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

-- Enable Row Level Security (optional - allows anonymous access)
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (adjust based on your needs)
CREATE POLICY "Allow public read" ON public.drawings
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.drawings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.drawings
  FOR UPDATE USING (true);
