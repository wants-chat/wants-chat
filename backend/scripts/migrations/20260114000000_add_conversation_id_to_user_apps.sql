-- Add conversation_id column to user_apps table
-- This links generated apps to their original chat conversation
ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Create index for faster lookup by conversation_id
CREATE INDEX IF NOT EXISTS idx_user_apps_conversation_id ON user_apps(conversation_id);

-- Add comment for documentation
COMMENT ON COLUMN user_apps.conversation_id IS 'References the chat conversation where this app was created';
