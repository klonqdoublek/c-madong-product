-- Seed a dev admin user for local testing
-- Email: dev@c-madong.app / Password: devadmin123
-- This user has role='admin' and onboarding_completed=true

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Only seed if the user doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'dev@c-madong.app'
  ) THEN
    -- Create auth user with known password
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'dev@c-madong.app',
      extensions.crypt('devadmin123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dev Admin"}'::jsonb,
      'authenticated',
      'authenticated',
      now(),
      now(),
      '',
      ''
    );

    -- Create identity for email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      'dev@c-madong.app',
      'email',
      jsonb_build_object('sub', new_user_id::text, 'email', 'dev@c-madong.app'),
      now(),
      now(),
      now()
    );

    -- Create profile row
    INSERT INTO profiles (
      id,
      email,
      role,
      full_name_th,
      full_name_en,
      onboarding_completed
    ) VALUES (
      new_user_id,
      'dev@c-madong.app',
      'admin',
      'Dev Admin',
      'Dev Admin',
      true
    );

    RAISE NOTICE 'Dev admin user created: dev@c-madong.app';
  ELSE
    RAISE NOTICE 'Dev admin user already exists, skipping';
  END IF;
END $$;
