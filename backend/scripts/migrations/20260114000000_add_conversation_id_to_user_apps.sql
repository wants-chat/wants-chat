-- Add conversation_id column to user_apps table
-- This links generated apps to their original chat conversation
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_apps') THEN
        ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS conversation_id UUID;

        -- Create index for faster lookup by conversation_id
        IF NOT EXISTS (
            SELECT FROM pg_indexes WHERE indexname = 'idx_user_apps_conversation_id'
        ) THEN
            CREATE INDEX idx_user_apps_conversation_id ON user_apps(conversation_id);
        END IF;

        COMMENT ON COLUMN user_apps.conversation_id IS 'References the chat conversation where this app was created';
    END IF;
END
$$;
