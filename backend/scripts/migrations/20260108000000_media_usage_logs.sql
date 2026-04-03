-- Media Usage Logs and Credits Updates
-- Migration for image, video, and audio AI operations billing

-- ============================================
-- Media Usage Logs
-- ============================================
CREATE TABLE IF NOT EXISTS media_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- image_generation, video_generation, speech_to_text, text_to_speech, etc.
    provider VARCHAR(50) NOT NULL,       -- runware, openai, etc.
    model VARCHAR(100),                  -- Model used (if applicable)
    input_details JSONB DEFAULT '{}'::jsonb,  -- prompt, width, height, duration, etc.
    output_details JSONB DEFAULT '{}'::jsonb, -- urls, file sizes, etc.
    provider_cost INTEGER,               -- Cost returned by provider (if available)
    calculated_cost INTEGER NOT NULL,    -- Our calculated cost in microcents
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Add missing columns to user_credits
-- ============================================
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS total_credits_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_credits_purchased BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS included_balance_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- Add time_to_first_token_ms to llm_usage_logs
-- ============================================
ALTER TABLE llm_usage_logs
ADD COLUMN IF NOT EXISTS time_to_first_token_ms INTEGER;

-- ============================================
-- Update subscription plans with new limits
-- ============================================
UPDATE subscription_plans
SET
    included_credits = 500000,           -- $0.50 for free
    max_requests_per_day = 25,
    max_tokens_per_request = 2048,
    allowed_model_tiers = ARRAY['free'],
    features = '["Access to 6 free-tier models", "25 messages per day", "Basic chat features", "$0.50 monthly credits"]'::jsonb
WHERE slug = 'free';

UPDATE subscription_plans
SET
    features = '["Access to 30+ models", "500 messages per day", "Premium models (GPT-4, Claude)", "Priority support", "API access"]'::jsonb
WHERE slug = 'pro';

UPDATE subscription_plans
SET
    features = '["Access to ALL 35 models", "Unlimited messages", "Enterprise models (o1, Opus)", "Team collaboration", "Dedicated support", "Analytics dashboard"]'::jsonb
WHERE slug = 'business';

-- ============================================
-- Indexes for Media Usage Logs
-- ============================================
CREATE INDEX IF NOT EXISTS idx_media_usage_logs_user ON media_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_logs_operation ON media_usage_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_media_usage_logs_created ON media_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_media_usage_logs_status ON media_usage_logs(status);

-- ============================================
-- Media Pricing Configuration Table (for UI display)
-- ============================================
CREATE TABLE IF NOT EXISTS media_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(50) NOT NULL,   -- image, video, audio
    operation VARCHAR(50) NOT NULL,      -- generation, upscale, background_removal, stt, tts
    model VARCHAR(100),                  -- Model name (if applicable)
    unit VARCHAR(50) NOT NULL,           -- per_image, per_second, per_minute, per_1k_chars
    base_price INTEGER NOT NULL,         -- Base price in microcents
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_type, operation, model)
);

-- Insert default media pricing
INSERT INTO media_pricing (service_type, operation, model, unit, base_price, description)
VALUES
    -- Image Generation
    ('image', 'generation', 'juggernaut-pro-flux', 'per_image', 50000, 'High-quality image generation'),
    ('image', 'generation', 'flux-schnell', 'per_image', 20000, 'Fast image generation'),
    ('image', 'generation', 'flux-dev', 'per_image', 80000, 'Development model'),
    ('image', 'generation', 'stable-diffusion-xl', 'per_image', 40000, 'SDXL generation'),
    ('image', 'generation', 'default', 'per_image', 50000, 'Default image generation'),
    -- Image Operations
    ('image', 'upscale', '2x', 'per_image', 30000, '2x image upscale'),
    ('image', 'upscale', '4x', 'per_image', 60000, '4x image upscale'),
    ('image', 'background_removal', NULL, 'per_image', 20000, 'Background removal'),
    ('image', 'enhance', NULL, 'per_image', 40000, 'Image enhancement'),
    -- Video Generation
    ('video', 'generation', 'bytedance-2.2', 'per_second', 500000, 'ByteDance video model'),
    ('video', 'generation', 'vidu-2.0', 'per_second', 400000, 'Vidu video model'),
    ('video', 'generation', 'kling-1.0-pro', 'per_second', 600000, 'Kling Pro video'),
    ('video', 'generation', 'kling-2.6-pro', 'per_second', 800000, 'Kling 2.6 Pro'),
    ('video', 'generation', 'default', 'per_second', 500000, 'Default video generation'),
    -- Audio
    ('audio', 'speech_to_text', 'whisper', 'per_minute', 6000, 'OpenAI Whisper STT'),
    ('audio', 'text_to_speech', 'tts-1', 'per_1k_chars', 15000, 'OpenAI TTS')
ON CONFLICT (service_type, operation, model) DO UPDATE
SET base_price = EXCLUDED.base_price,
    description = EXCLUDED.description,
    updated_at = NOW();
