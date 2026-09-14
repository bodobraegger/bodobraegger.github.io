-- The Chatango group history, imported once so the chat does not start empty.
-- 47 messages, 2025-05-22 to 2026-07-20.
-- Inserts are closed to the API roles, so run this in the Supabase SQL editor.
-- Runs once: it does nothing while any chatango-* row exists.

INSERT INTO public.chat_messages (user_id, name, body, created_at)
SELECT * FROM (VALUES
  ('chatango-anon4565', 'anon4565', 'hello!', to_timestamp(1747905451)),
  ('chatango-anon4255', 'anon4255', 'ᓚᘏᗢ', to_timestamp(1747991594)),
  ('chatango-anon9271', 'anon9271', 'hello', to_timestamp(1747991719)),
  ('chatango-Oi', 'Oi', 'HALLO', to_timestamp(1747991734)),
  ('chatango-Oi', 'Oi', 'Bodo is showing off his skills', to_timestamp(1747991792)),
  ('chatango-anon1349', 'anon1349', 'what did egor mean by internet nerds??', to_timestamp(1747992241)),
  ('chatango-anon4255', 'anon4255', 'is there a character limit in this chat?', to_timestamp(1747992292)),
  ('chatango-bodo', 'bodo', 'i don''t know. feel free to try!', to_timestamp(1747993502)),
  ('chatango-bodo', 'bodo', '... to hit the limit.', to_timestamp(1747993510)),
  ('chatango-anon6069', 'anon6069', 'When not good them any can, back her like up, year just a by well get, on so I any I my, two about not as because, me like because just, because look them, or you she want if she because a there up get only work how, no from say I into new no us, him for well all, because how in my go a two me at say, on. These work make your, who then, any use time one look on any who, an two say, want in first, when an, what their she him out over I 
Wall of Text Generator Version 1.1', to_timestamp(1747993997)),
  ('chatango-anon6069', 'anon6069', ':(', to_timestamp(1747994006)),
  ('chatango-anon6069', 'anon6069', 'A group administrator has restricted the maximum message length to 850 bytes.', to_timestamp(1747994220)),
  ('chatango-bbodo', 'bbodo', 'i can''t seem to change that, sorry!', to_timestamp(1747994515)),
  ('chatango-anon7225', 'anon7225', '*hb*', to_timestamp(1747994656)),
  ('chatango-bbodo', 'bbodo', 'is this text readable?', to_timestamp(1747995827)),
  ('chatango-bbodo', 'bbodo', 'now I think it is, right?', to_timestamp(1747996208)),
  ('chatango-anon6807', 'anon6807', 'bday party when', to_timestamp(1747996324)),
  ('chatango-bbodo', 'bbodo', 'saturday!', to_timestamp(1747996659)),
  ('chatango-Piupiu', 'Piupiu', 'Juhuuu===)', to_timestamp(1747996729)),
  ('chatango-anon7589', 'anon7589', 'bodo <3 mornings', to_timestamp(1747999029)),
  ('chatango-rosa', 'rosa', 'who‘s here rn:)?', to_timestamp(1748363841)),
  ('chatango-j', 'j', 'krassi website', to_timestamp(1749502367)),
  ('chatango-mmmm', 'mmmm', 'hoii <3', to_timestamp(1752147059)),
  ('chatango-xl', 'xl', 'greetings from paris', to_timestamp(1753807161)),
  ('chatango-anon6201', 'anon6201', 'ᓚᘏᗢ', to_timestamp(1760637982)),
  ('chatango-anon6201', 'anon6201', '*burger*', to_timestamp(1760638001)),
  ('chatango-henrivomurte', 'henrivomurte', 'styler', to_timestamp(1761051020)),
  ('chatango-henrivomurte', 'henrivomurte', 'still here in 2025', to_timestamp(1761051033)),
  ('chatango-yaya', 'yaya', 'What''s up tonight?? <33', to_timestamp(1762533380)),
  ('chatango-anon9224', 'anon9224', '<3', to_timestamp(1763028598)),
  ('chatango-machinegunmouth', 'machinegunmouth', 'coucou!', to_timestamp(1773525090)),
  ('chatango-anon4075', 'anon4075', 'oi! tudo bem?', to_timestamp(1775702888)),
  ('chatango-anon1480', 'anon1480', 'Como está indo o dia de vocês?', to_timestamp(1775741470)),
  ('chatango-anon3876', 'anon3876', 'oi gente!', to_timestamp(1775741591)),
  ('chatango-Luna', 'Luna', 'Oiê', to_timestamp(1775741615)),
  ('chatango-SUMA', 'SUMA', 'hallo', to_timestamp(1775741642)),
  ('chatango-raura', 'raura', 'dont know my passwword guys', to_timestamp(1777705104)),
  ('chatango-raura', 'raura', 'so difficult', to_timestamp(1777705120)),
  ('chatango-raura', 'raura', '~V', to_timestamp(1777705131)),
  ('chatango-tony', 'tony', 'pls make ctrl z', to_timestamp(1777707056)),
  ('chatango-bbodo', 'bbodo', 'done!', to_timestamp(1777844309)),
  ('chatango-Henzgo', 'Henzgo', 'Dynamo Dan sends his regards', to_timestamp(1780392177)),
  ('chatango-luwo', 'luwo', 'servus', to_timestamp(1782192454)),
  ('chatango-luwo', 'luwo', 'i''m online', to_timestamp(1782192475)),
  ('chatango-bbodo', 'bbodo', 'habe dich leider verpasst <3', to_timestamp(1782431608)),
  ('chatango-bbodo', 'bbodo', 'naaat', to_timestamp(1784581188)),
  ('chatango-bbodo', 'bbodo', 'reload the page', to_timestamp(1784581201))
) AS v(user_id, name, body, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.chat_messages WHERE user_id LIKE 'chatango-%');
