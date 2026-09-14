-- Editing and deleting your own messages for 15 minutes after sending.
-- Run once after chat-schema.sql and chat-images.sql; safe to run again.
-- Direct UPDATE and DELETE stay closed to the API roles; these two functions
-- are the only way, and they check the caller's user id and the window.

CREATE OR REPLACE FUNCTION public.edit_chat_message(message_id UUID, new_body TEXT)
RETURNS public.chat_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_id TEXT;
  clean_body TEXT;
  result public.chat_messages;
BEGIN
  sender_id := current_setting('request.headers', true)::json->>'x-user-id';
  IF sender_id IS NULL OR sender_id = '' THEN
    RAISE EXCEPTION 'missing_user_id' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO result FROM public.chat_messages m
  WHERE m.id = message_id
    AND m.user_id = sender_id
    AND m.created_at > NOW() - INTERVAL '15 minutes';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_editable' USING ERRCODE = 'P0001';
  END IF;

  clean_body := trim(coalesce(new_body, ''));
  IF char_length(clean_body) = 0 AND result.image IS NULL THEN
    RAISE EXCEPTION 'body_empty' USING ERRCODE = 'P0001';
  END IF;
  IF char_length(clean_body) > 500 THEN
    RAISE EXCEPTION 'body_too_long' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.chat_messages m SET body = clean_body
  WHERE m.id = message_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_chat_message(message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_id TEXT;
BEGIN
  sender_id := current_setting('request.headers', true)::json->>'x-user-id';
  IF sender_id IS NULL OR sender_id = '' THEN
    RAISE EXCEPTION 'missing_user_id' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.chat_messages m
  WHERE m.id = message_id
    AND m.user_id = sender_id
    AND m.created_at > NOW() - INTERVAL '15 minutes';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_deletable' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.edit_chat_message(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(UUID) TO anon, authenticated;

-- Verification
-- ============================================================
-- SELECT routine_name, security_type FROM information_schema.routines WHERE routine_name IN ('edit_chat_message', 'delete_chat_message');
