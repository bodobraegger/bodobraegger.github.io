-- View tracking for notes

-- Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_path)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views(page_path);

-- Enable RLS but allow public access
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.page_views;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.page_views;

-- Policy to allow anyone to read view counts
CREATE POLICY "Allow public read access"
  ON public.page_views
  FOR SELECT
  USING (true);

-- Policy to allow anyone to increment view counts
CREATE POLICY "Allow public insert/update"
  ON public.page_views
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_page_view(path TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the permissions of the function owner
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO public.page_views (page_path, view_count, last_viewed_at)
  VALUES (path, 1, NOW())
  ON CONFLICT (page_path)
  DO UPDATE SET
    view_count = page_views.view_count + 1,
    last_viewed_at = NOW()
  RETURNING view_count INTO current_count;
  
  RETURN current_count;
END;
$$;
