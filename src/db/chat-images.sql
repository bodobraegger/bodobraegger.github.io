-- Images in the chat: one nullable column, a public bucket with a size cap,
-- and post_chat_message taking an optional image path. Run once after
-- chat-schema.sql; safe to run again.

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS image TEXT;

-- A message with an image may have an empty body.
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_body_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_body_check
  CHECK (char_length(body) <= 500 AND (char_length(body) >= 1 OR image IS NOT NULL));

-- Bucket
-- ============================================================
-- The bucket settings are the guard: 64 KB, PNG only. A dithered 320px
-- image is a fraction of that.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images', 'chat-images', true, 65536, ARRAY['image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 65536, allowed_mime_types = ARRAY['image/png'];

DROP POLICY IF EXISTS "chat images public read" ON storage.objects;
DROP POLICY IF EXISTS "chat images upload" ON storage.objects;
DROP POLICY IF EXISTS "chat images admin delete" ON storage.objects;

CREATE POLICY "chat images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

-- Anyone may upload, but only under chat/<uuid>.png, the shape the client makes.
CREATE POLICY "chat images upload" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'chat-images' AND name ~ '^chat/[0-9a-f-]{36}\.png$');

CREATE POLICY "chat images admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images');

-- Function
-- ============================================================
-- The two-argument version goes, so the call is never ambiguous.

DROP FUNCTION IF EXISTS public.post_chat_message(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.post_chat_message(name TEXT, body TEXT, image TEXT DEFAULT NULL)
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
  clean_body := trim(coalesce(body, ''));

  IF char_length(clean_name) = 0 THEN
    RAISE EXCEPTION 'name_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_name) > 24 THEN
    RAISE EXCEPTION 'name_too_long' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_body) = 0 AND image IS NULL THEN
    RAISE EXCEPTION 'body_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_body) > 500 THEN
    RAISE EXCEPTION 'body_too_long' USING ERRCODE = 'P0001';
  END IF;
  IF image IS NOT NULL AND image !~ '^chat/[0-9a-f-]{36}\.png$' THEN
    RAISE EXCEPTION 'image_invalid' USING ERRCODE = 'P0001';
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

  INSERT INTO public.chat_messages (user_id, name, body, image)
  VALUES (sender_id, clean_name, clean_body, image)
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.post_chat_message(TEXT, TEXT, TEXT) TO anon, authenticated;

-- Verification
-- ============================================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'image';
-- SELECT id, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'chat-images';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'chat images%';
