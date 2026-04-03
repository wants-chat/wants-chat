-- Migration: Add user_content table for storing AI generated content
-- Created: 2025-12-25

CREATE TABLE IF NOT EXISTS user_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'image' | 'video' | 'logo' | 'pdf' | 'audio'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    filename VARCHAR(255),
    title VARCHAR(255),
    prompt TEXT,
    model VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for video/audio in seconds
    size BIGINT, -- file size in bytes
    metadata JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_user_type ON user_content(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_content_user_favorite ON user_content(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_content_created_at ON user_content(created_at DESC);

-- Add comment
COMMENT ON TABLE user_content IS 'Stores AI generated content (images, videos, logos, etc.) for users';
