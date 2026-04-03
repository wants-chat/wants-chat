-- Add app_type and output_path columns to user_apps table
-- app_type: Store the app type ID from registry (e.g., 'blog', 'ecommerce')
-- output_path: Store the local path where app code is generated

ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS app_type TEXT;
ALTER TABLE user_apps ADD COLUMN IF NOT EXISTS output_path TEXT;

-- Create index on app_type for filtering
CREATE INDEX IF NOT EXISTS idx_user_apps_app_type ON user_apps(app_type);

-- Add comments for documentation
COMMENT ON COLUMN user_apps.app_type IS 'App type ID from registry (e.g., blog, ecommerce, crm)';
COMMENT ON COLUMN user_apps.output_path IS 'Local filesystem path where the app code is generated';
