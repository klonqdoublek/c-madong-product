-- Fix dev admin user: delete the broken direct-insert user
-- The previous migration used crypt()/gen_salt() which produced an invalid hash.
-- After this migration, use the Supabase Admin API to create the user properly.

DO $$
DECLARE
  dev_user_id uuid;
BEGIN
  -- Find the broken user
  SELECT id INTO dev_user_id FROM auth.users WHERE email = 'dev@c-madong.app';

  IF dev_user_id IS NOT NULL THEN
    -- Delete in correct order (foreign keys)
    DELETE FROM auth.identities WHERE user_id = dev_user_id;
    DELETE FROM auth.sessions WHERE user_id = dev_user_id;
    DELETE FROM auth.refresh_tokens WHERE user_id = dev_user_id::text;
    DELETE FROM profiles WHERE id = dev_user_id;
    DELETE FROM auth.users WHERE id = dev_user_id;
    RAISE NOTICE 'Deleted broken dev user: %', dev_user_id;
  END IF;
END $$;
