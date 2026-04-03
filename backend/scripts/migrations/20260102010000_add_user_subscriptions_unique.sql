-- Migration: add_user_subscriptions_unique
-- Created at: 2026-01-02
-- Description: Add unique constraint on user_id for user_subscriptions table

-- First, remove any duplicate user_id entries (keep the most recent one)
DELETE FROM user_subscriptions a
USING user_subscriptions b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_subscriptions_user_id_key'
  ) THEN
    ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END
$$;
