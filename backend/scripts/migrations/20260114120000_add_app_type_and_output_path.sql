-- Add app_type and output_path columns to user_apps table
-- app_type: Store the app type ID from registry (e.g., 'blog', 'ecommerce')
-- output_path: Store the local path where app code is generated

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_apps') THEN
        ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS app_type TEXT;
        ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS output_path TEXT;

        -- Create index on app_type for filtering
        IF NOT EXISTS (
            SELECT FROM pg_indexes WHERE indexname = 'idx_user_apps_app_type'
        ) THEN
            CREATE INDEX idx_user_apps_app_type ON user_apps(app_type);
        END IF;

        -- Add comments for documentation
        COMMENT ON COLUMN user_apps.app_type IS 'App type ID from registry (e.g., blog, ecommerce, crm)';
        COMMENT ON COLUMN user_apps.output_path IS 'Local filesystem path where the app code is generated';
    END IF;
END
$$;
