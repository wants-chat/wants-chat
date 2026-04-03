-- Create user_apps table for storing generated applications
CREATE TABLE IF NOT EXISTS user_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL,
  conversation_id UUID, -- Link to the chat conversation where app was created
  app_type VARCHAR(100), -- App type ID from registry (e.g., 'blog', 'ecommerce')
  output_path TEXT, -- Local filesystem path where the app code is generated
  status VARCHAR(50) DEFAULT 'draft',

  -- Frameworks used
  frontend_framework VARCHAR(50),
  backend_framework VARCHAR(50),
  mobile_framework VARCHAR(50),

  -- Generated code paths (relative to app-builder/generated)
  has_frontend BOOLEAN DEFAULT false,
  has_backend BOOLEAN DEFAULT false,
  has_mobile BOOLEAN DEFAULT false,

  -- Deployment URLs
  frontend_url TEXT,
  backend_url TEXT,
  ios_app_store_url TEXT,
  android_play_store_url TEXT,

  -- Build/Deploy configuration
  deploy_config JSONB DEFAULT '{}',

  -- App secrets (encrypted or stored securely)
  secrets JSONB DEFAULT '{}',

  -- GitHub sync info (denormalized for quick access)
  github_repo_owner VARCHAR(255),
  github_repo_name VARCHAR(255),
  github_repo_full_name VARCHAR(500),
  github_branch VARCHAR(255),
  github_last_pushed_at TIMESTAMPTZ,
  github_last_pulled_at TIMESTAMPTZ,
  github_last_commit_sha VARCHAR(255),
  github_auto_sync BOOLEAN DEFAULT false,

  -- App thumbnail/preview
  thumbnail_url TEXT,
  preview_images JSONB DEFAULT '[]',

  -- Generation metadata
  generation_prompt TEXT,
  generation_model VARCHAR(255),
  generation_tokens_used INTEGER,

  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',

  -- Favorites and visibility
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on slug per user
  UNIQUE(user_id, slug)
);

-- Create github_connections table for storing user's GitHub OAuth connections
CREATE TABLE IF NOT EXISTS github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  github_id VARCHAR(255) NOT NULL,
  github_login VARCHAR(255) NOT NULL,
  github_name VARCHAR(255),
  github_email VARCHAR(255),
  github_avatar TEXT,
  installation_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app_github_links table for storing app-repo relationships
CREATE TABLE IF NOT EXISTS app_github_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES user_apps(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  repo_owner VARCHAR(255) NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  repo_full_name VARCHAR(500) NOT NULL,
  branch VARCHAR(255) DEFAULT 'main',
  last_pushed_at TIMESTAMPTZ,
  last_pulled_at TIMESTAMPTZ,
  last_commit_sha VARCHAR(255),
  auto_sync BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one link per app-repo combination
  UNIQUE(app_id, repo_owner, repo_name)
);

-- Create indexes for user_apps
CREATE INDEX IF NOT EXISTS idx_user_apps_user_id ON user_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_apps_slug ON user_apps(slug);
CREATE INDEX IF NOT EXISTS idx_user_apps_status ON user_apps(status);
CREATE INDEX IF NOT EXISTS idx_user_apps_created_at ON user_apps(created_at);
CREATE INDEX IF NOT EXISTS idx_user_apps_is_favorite ON user_apps(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_apps_github_repo ON user_apps(github_repo_full_name);
CREATE INDEX IF NOT EXISTS idx_user_apps_conversation_id ON user_apps(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_apps_app_type ON user_apps(app_type);

-- Create indexes for github_connections
CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_github_id ON github_connections(github_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_installation_id ON github_connections(installation_id);

-- Create indexes for app_github_links
CREATE INDEX IF NOT EXISTS idx_app_github_links_app_id ON app_github_links(app_id);
CREATE INDEX IF NOT EXISTS idx_app_github_links_user_id ON app_github_links(user_id);
CREATE INDEX IF NOT EXISTS idx_app_github_links_repo ON app_github_links(repo_full_name);

-- Status values for user_apps:
-- 'draft' - App is being created/generated
-- 'generated' - Code generation complete
-- 'building' - Build in progress
-- 'deployed' - App is deployed and live
-- 'failed' - Generation or deployment failed
-- 'archived' - App is archived

COMMENT ON TABLE user_apps IS 'Stores user-generated applications with deployment and sync info';
COMMENT ON TABLE github_connections IS 'Stores user GitHub App OAuth connections';
COMMENT ON TABLE app_github_links IS 'Links apps to their GitHub repositories for sync';
