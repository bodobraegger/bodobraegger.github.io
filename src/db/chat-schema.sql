-- Site chat: one table, two SECURITY DEFINER functions, realtime.
-- Idempotent: safe to run again on an existing database.

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 24),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_created_idx ON public.chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx ON public.chat_messages (user_id, created_at DESC);

-- Row level security
-- ============================================================

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.chat_messages;

CREATE POLICY "Allow public read" ON public.chat_messages
  FOR SELECT USING (true);

-- Deletion is an admin page action, so only a Supabase login can do it.
CREATE POLICY "Allow authenticated delete" ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- No INSERT or UPDATE policy: those columns only change through the
-- SECURITY DEFINER functions below, which bypass RLS.
GRANT SELECT, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT ON public.chat_messages TO anon;
REVOKE INSERT, UPDATE ON public.chat_messages FROM anon, authenticated;

-- Functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.post_chat_message(name TEXT, body TEXT)
RETURNS public.chat_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_id TEXT;
  clean_name TEXT;
  clean_body TEXT;
  recent_count INTEGER;
  result public.chat_messages;
BEGIN
  sender_id := current_setting('request.headers', true)::json->>'x-user-id';
  IF sender_id IS NULL OR sender_id = '' THEN
    RAISE EXCEPTION 'missing_user_id' USING ERRCODE = 'P0001';
  END IF;

  clean_name := trim(name);
  clean_body := trim(body);

  IF char_length(clean_name) = 0 THEN
    RAISE EXCEPTION 'name_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_name) > 24 THEN
    RAISE EXCEPTION 'name_too_long' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_body) = 0 THEN
    RAISE EXCEPTION 'body_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_body) > 500 THEN
    RAISE EXCEPTION 'body_too_long' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.chat_messages
    WHERE user_id = sender_id AND created_at > NOW() - INTERVAL '2 seconds'
  ) THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*) INTO recent_count
  FROM public.chat_messages
  WHERE user_id = sender_id AND created_at > NOW() - INTERVAL '10 minutes';
  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.chat_messages (user_id, name, body)
  VALUES (sender_id, clean_name, clean_body)
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.post_chat_message(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_chat_name(name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_id TEXT;
  clean_name TEXT;
  renamed_count INTEGER;
BEGIN
  sender_id := current_setting('request.headers', true)::json->>'x-user-id';
  IF sender_id IS NULL OR sender_id = '' THEN
    RAISE EXCEPTION 'missing_user_id' USING ERRCODE = 'P0001';
  END IF;

  clean_name := trim(name);

  IF char_length(clean_name) = 0 THEN
    RAISE EXCEPTION 'name_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_name) > 24 THEN
    RAISE EXCEPTION 'name_too_long' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.chat_messages SET name = clean_name WHERE user_id = sender_id;
  GET DIAGNOSTICS renamed_count = ROW_COUNT;

  RETURN renamed_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_chat_name(TEXT) TO anon, authenticated;

-- Realtime
-- ============================================================
-- Default replica identity is enough: UPDATE carries the whole new row,
-- DELETE carries the primary key.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Verification
-- ============================================================
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'chat_messages' ORDER BY cmd;
-- SELECT routine_name, security_type FROM information_schema.routines WHERE routine_name IN ('post_chat_message', 'set_chat_name');
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages';
