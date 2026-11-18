-- The text of the ```checklist blocks in notes. One row per page and block:
-- every visitor sees and changes the same text. `version` counts the saves; a
-- client saves only over the version it read (see src/lib/checklist.ts).

CREATE TABLE IF NOT EXISTS public.checklist_blocks (
  page_path TEXT NOT NULL CHECK (char_length(page_path) <= 200),
  block_index INTEGER NOT NULL CHECK (block_index BETWEEN 0 AND 99),
  body TEXT NOT NULL CHECK (char_length(body) <= 20000),
  version INTEGER NOT NULL CHECK (version > 0),
  PRIMARY KEY (page_path, block_index)
);

ALTER TABLE public.checklist_blocks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.checklist_blocks TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read" ON public.checklist_blocks;
DROP POLICY IF EXISTS "Allow public insert" ON public.checklist_blocks;
DROP POLICY IF EXISTS "Allow public update" ON public.checklist_blocks;

CREATE POLICY "Allow public read" ON public.checklist_blocks
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.checklist_blocks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.checklist_blocks
  FOR UPDATE USING (true) WITH CHECK (true);

-- No delete policy: a block is emptied by an update, never removed.
