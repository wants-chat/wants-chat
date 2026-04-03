-- Fix user_credits table columns
-- Add missing columns that the code expects

-- Add included_balance_reset_at column if it doesn't exist
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS included_balance_reset_at TIMESTAMP WITH TIME ZONE;

-- Add total_credits_used column if it doesn't exist
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS total_credits_used BIGINT DEFAULT 0;

-- Add total_credits_purchased column if it doesn't exist
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS total_credits_purchased BIGINT DEFAULT 0;

-- Update existing rows to set included_balance_reset_at from last_reset_at if it exists
UPDATE user_credits
SET included_balance_reset_at = last_reset_at
WHERE included_balance_reset_at IS NULL AND last_reset_at IS NOT NULL;
