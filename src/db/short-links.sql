-- Short links: bbo.do/l/<slug> redirects to target. The owner manages the rows
-- at /admin/links; worker/short-links.js resolves them with the anon key.
-- Idempotent: safe to run again on an existing database.

CREATE TABLE IF NOT EXISTS public.short_links (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-zA-Z0-9-]{1,64}$'),
  target TEXT NOT NULL CHECK (target ~* '^https?://[^[:space:]]+$' AND char_length(target) <= 2048),
  clicks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.short_links DROP CONSTRAINT IF EXISTS short_links_slug_check;
ALTER TABLE public.short_links ADD CONSTRAINT short_links_slug_check CHECK (slug ~ '^[a-zA-Z0-9-]{1,64}$');

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.short_links FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.short_links TO authenticated;

-- Anyone can sign up, so the role alone does not identify the owner.
DROP POLICY IF EXISTS "Allow owner" ON public.short_links;
CREATE POLICY "Allow owner" ON public.short_links
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = '269bc314-394c-4f4f-8013-7443f0dff615')
  WITH CHECK ((SELECT auth.uid()) = '269bc314-394c-4f4f-8013-7443f0dff615');

-- Counts the click and returns the target, or null for an unknown slug.
CREATE OR REPLACE FUNCTION public.resolve_short_link(link_slug TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.short_links
  SET clicks = clicks + 1
  WHERE slug = link_slug
  RETURNING target;
$$;

REVOKE ALL ON FUNCTION public.resolve_short_link(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_short_link(TEXT) TO anon, authenticated;

-- The first free slug of a..z, A..Z, 0..9, aa, ab, ... A deleted slug is free again.
CREATE OR REPLACE FUNCTION public.next_short_link_slug()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  alphabet CONSTANT TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  base CONSTANT INTEGER := char_length(alphabet);
  position_number INTEGER := 0;
  remaining INTEGER;
  candidate TEXT;
BEGIN
  -- ponytail: one lookup per taken slug, store a counter if there are many thousands
  LOOP
    position_number := position_number + 1;
    remaining := position_number;
    candidate := '';
    -- Base 62 without a zero, so that aa follows 9.
    WHILE remaining > 0 LOOP
      candidate := substr(alphabet, (remaining - 1) % base + 1, 1) || candidate;
      remaining := (remaining - 1) / base;
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.short_links WHERE slug = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.next_short_link_slug() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.next_short_link_slug() TO authenticated;
ALTER TABLE public.short_links ALTER COLUMN slug SET DEFAULT public.next_short_link_slug();
