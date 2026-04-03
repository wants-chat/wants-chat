-- Migration: remove_user_profiles
-- Created at: 2026-01-02
-- Description: Consolidate user_profiles into users table and remove user_profiles table

-- Add country_code column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE users ADD COLUMN country_code VARCHAR(10);
  END IF;
END
$$;

-- Migrate any data from user_profiles to users (if user_profiles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Update users with data from user_profiles where users fields are null
    UPDATE users u
    SET
      name = COALESCE(u.name, up.name),
      avatar_url = COALESCE(u.avatar_url, up.avatar_url),
      bio = COALESCE(u.bio, up.bio),
      phone = COALESCE(u.phone, up.phone),
      country_code = COALESCE(u.country_code, up.country_code),
      location = COALESCE(u.location, up.location),
      website = COALESCE(u.website, up.website)
    FROM user_profiles up
    WHERE u.id = up.user_id;

    -- Drop the trigger first
    DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

    -- Drop the index
    DROP INDEX IF EXISTS idx_user_profiles_user_id;

    -- Drop the user_profiles table
    DROP TABLE user_profiles;

    RAISE NOTICE 'user_profiles table has been dropped and data migrated to users table';
  END IF;
END
$$;
