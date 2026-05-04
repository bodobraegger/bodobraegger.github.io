-- Supabase Backup: Export all drawings data
-- Run this in Supabase SQL Editor and copy the results

-- 1. EXPORT AS JSON (easiest for backup/restore)
-- This exports the entire drawings table as a JSON array
SELECT json_agg(row_to_json(t)) as backup_data
FROM public.drawings t;

-- 2. EXPORT WITH FORMATTING (readable CSV)
-- Copy each drawing with all metadata
SELECT 
  id,
  canvas_id,
  strokes,
  created_at,
  updated_at
FROM public.drawings
ORDER BY created_at DESC;

-- 3. EXPORT STROKE STATISTICS (analyze what you have)
SELECT 
  id as drawing_id,
  canvas_id,
  jsonb_array_length(strokes) as total_strokes,
  (SELECT COUNT(*) FROM jsonb_array_elements(strokes) WHERE (value ->> 'isEraser')::boolean = true) as eraser_strokes,
  (SELECT COUNT(DISTINCT value ->> 'userId') FROM jsonb_array_elements(strokes)) as unique_users,
  created_at,
  updated_at
FROM public.drawings
ORDER BY updated_at DESC;

-- 4. EXPORT BY CANVAS (see which canvases have the most content)
SELECT 
  canvas_id,
  COUNT(*) as drawing_records,
  SUM(jsonb_array_length(strokes)) as total_strokes,
  MAX(updated_at) as last_updated
FROM public.drawings
GROUP BY canvas_id
ORDER BY total_strokes DESC;

-- 5. FULL BACKUP WITH CREATE TABLE STATEMENT
-- Run this to create a full SQL backup you can restore later
CREATE TABLE IF NOT EXISTS drawings_backup AS
SELECT * FROM public.drawings;

-- Then export the backup table:
-- SELECT * FROM drawings_backup;
