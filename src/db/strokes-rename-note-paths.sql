-- The notes were renamed to the short date form, and a drawing is stored under
-- the path of the page it was drawn on, so every stroke on a renamed note lost
-- its page. page_views was already moved; strokes was not.
--
-- Run once in the Supabase SQL editor. It is safe to run again: the second run
-- matches nothing.

begin;

update strokes set canvas_id = '/notes/2605-canvas'
 where canvas_id = '/notes/2026-05-03_canvas';                       -- 696 strokes

update strokes set canvas_id = '/notes/2605-arte-digital-canvas'
 where canvas_id = '/notes/2026-05-14_arte_digital_canvas';          -- 202 strokes

update strokes set canvas_id = '/notes/2604-arte-digital-portfolio-talk'
 where canvas_id = '/notes/2026-04-08_arte_digital_portfolio_talk';  -- 61 strokes

-- Left alone on purpose:
--   /notes/hiperorganicos13      102 strokes, the note kept its name
--   /notes/2026-09-13_mobile_pens 31 strokes, that note no longer exists

commit;

-- Check afterwards. Every row should sit on a path that a page still serves.
select canvas_id, count(*) from strokes group by canvas_id order by count(*) desc;
