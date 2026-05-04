-- Supabase Queries for DrawablePen Moderation

-- 1. Find all eraser strokes across all drawings
SELECT 
  id,
  canvas_id,
  jsonb_array_elements(strokes) ->> 'userId' as user_id,
  jsonb_array_elements(strokes) ->> 'timestamp' as timestamp,
  (jsonb_array_elements(strokes) ->> 'isEraser')::boolean as is_eraser
FROM public.drawings
WHERE (jsonb_array_elements(strokes) ->> 'isEraser')::boolean = true;

-- 2. Count strokes per user (find who's drawing the most)
SELECT 
  stroke ->> 'userId' as user_id,
  COUNT(*) as stroke_count,
  SUM(CASE WHEN (stroke ->> 'isEraser')::boolean = true THEN 1 ELSE 0 END) as eraser_count,
  SUM(CASE WHEN (stroke ->> 'isEraser')::boolean != true THEN 1 ELSE 0 END) as draw_count
FROM public.drawings,
  jsonb_array_elements(strokes) as stroke
GROUP BY stroke ->> 'userId'
ORDER BY stroke_count DESC;

-- 3. Get all strokes by a specific user (replace 'user-123-abc' with actual userId)
SELECT 
  id,
  canvas_id,
  stroke ->> 'userId' as user_id,
  stroke ->> 'timestamp' as timestamp,
  stroke ->> 'color' as color,
  (stroke ->> 'isEraser')::boolean as is_eraser,
  jsonb_array_length(stroke -> 'points') as point_count
FROM public.drawings,
  jsonb_array_elements(strokes) as stroke
WHERE stroke ->> 'userId' = 'user-123-abc';

-- 4. Remove all strokes from a specific user (CAREFUL - this is permanent!)
-- Replace 'user-123-abc' with the griefer's userId
UPDATE public.drawings
SET strokes = (
  SELECT jsonb_agg(stroke)
  FROM jsonb_array_elements(strokes) as stroke
  WHERE stroke ->> 'userId' != 'user-123-abc'
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(strokes) as stroke
  WHERE stroke ->> 'userId' = 'user-123-abc'
);

-- 5. Remove only eraser strokes from a specific user
UPDATE public.drawings
SET strokes = (
  SELECT jsonb_agg(stroke)
  FROM jsonb_array_elements(strokes) as stroke
  WHERE NOT (
    stroke ->> 'userId' = 'user-123-abc' 
    AND (stroke ->> 'isEraser')::boolean = true
  )
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(strokes) as stroke
  WHERE stroke ->> 'userId' = 'user-123-abc'
    AND (stroke ->> 'isEraser')::boolean = true
);

-- 6. Get timeline of activity for a specific canvas
SELECT 
  canvas_id,
  stroke ->> 'userId' as user_id,
  to_timestamp((stroke ->> 'timestamp')::bigint / 1000) as drew_at,
  stroke ->> 'color' as color,
  (stroke ->> 'isEraser')::boolean as is_eraser,
  stroke ->> 'width' as width
FROM public.drawings,
  jsonb_array_elements(strokes) as stroke
WHERE canvas_id = '/your-canvas-path'
ORDER BY drew_at DESC;

-- 7. Find suspicious activity (users who only erase, never draw)
SELECT 
  stroke ->> 'userId' as user_id,
  COUNT(*) as total_strokes,
  SUM(CASE WHEN (stroke ->> 'isEraser')::boolean = true THEN 1 ELSE 0 END) as eraser_count
FROM public.drawings,
  jsonb_array_elements(strokes) as stroke
GROUP BY stroke ->> 'userId'
HAVING SUM(CASE WHEN (stroke ->> 'isEraser')::boolean != true THEN 1 ELSE 0 END) = 0
  AND SUM(CASE WHEN (stroke ->> 'isEraser')::boolean = true THEN 1 ELSE 0 END) > 0
ORDER BY eraser_count DESC;

-- 8. Export all strokes for forensics/backup
SELECT 
  id,
  canvas_id,
  jsonb_pretty(strokes) as strokes_formatted,
  updated_at
FROM public.drawings
WHERE canvas_id = '/your-canvas-path';
