-- Add is_favourite column to travel_plans table
ALTER TABLE travel_plans
ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;

-- Create index for faster queries on favourite plans
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_favourite
ON travel_plans(user_id, is_favourite);

-- Update existing plans to have is_favourite = false (default)
UPDATE travel_plans
SET is_favourite = false
WHERE is_favourite IS NULL;
