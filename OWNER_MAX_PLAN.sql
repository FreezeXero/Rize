-- Run in Supabase SQL editor to set owner accounts to Max and reset monthly counters.
-- If 0 rows updated, the auth user may not have a matching row in public.users yet; the app still forces Max for these emails in code.

UPDATE public.users
SET plan = 'max', exports_this_month = 0, ai_uses_this_month = 0
WHERE email = 'rafayfarah.cs@gmail.com';

UPDATE public.users
SET plan = 'max', exports_this_month = 0, ai_uses_this_month = 0
WHERE email = 'fxero.media@gmail.com';
