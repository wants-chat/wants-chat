-- Create meditation categories table
CREATE TABLE IF NOT EXISTS meditation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  color VARCHAR(255),
  session_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meditation audio library table
CREATE TABLE IF NOT EXISTS meditation_audio_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size_mb NUMERIC,
  type VARCHAR(255) DEFAULT 'meditation',
  narrator VARCHAR(255),
  category VARCHAR(255),
  tags JSONB DEFAULT '[]',
  language VARCHAR(255) DEFAULT 'en',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meditation programs table
CREATE TABLE IF NOT EXISTS meditation_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  difficulty VARCHAR(255),
  duration_days INTEGER,
  sessions_count INTEGER,
  category VARCHAR(255),
  image_url TEXT,
  tags JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ambient sounds table
CREATE TABLE IF NOT EXISTS ambient_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  icon VARCHAR(255),
  category VARCHAR(255),
  default_volume NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  achievement_type VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  xp_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create user meditation stats table
CREATE TABLE IF NOT EXISTS user_meditation_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meditation_categories_slug ON meditation_categories(slug);
CREATE INDEX IF NOT EXISTS idx_meditation_categories_display_order ON meditation_categories(display_order);

CREATE INDEX IF NOT EXISTS idx_meditation_audio_library_category ON meditation_audio_library(category);
CREATE INDEX IF NOT EXISTS idx_meditation_audio_library_type ON meditation_audio_library(type);
CREATE INDEX IF NOT EXISTS idx_meditation_audio_library_created_at ON meditation_audio_library(created_at);

CREATE INDEX IF NOT EXISTS idx_meditation_programs_category ON meditation_programs(category);
CREATE INDEX IF NOT EXISTS idx_meditation_programs_is_active ON meditation_programs(is_active);

CREATE INDEX IF NOT EXISTS idx_ambient_sounds_category ON ambient_sounds(category);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_meditation_stats_user_id ON user_meditation_stats(user_id);

-- Insert default categories
INSERT INTO meditation_categories (slug, name, description, icon, color, display_order) VALUES
('stress-relief', 'Stress Relief', 'Quick stress-busting sessions for immediate calm', '🌊', 'blue', 1),
('sleep', 'Sleep & Relaxation', 'Bedtime meditations and deep relaxation', '🌙', 'purple', 2),
('focus', 'Focus & Concentration', 'Enhance productivity and mental clarity', '🎯', 'green', 3),
('anxiety', 'Anxiety Management', 'Calming techniques for worry reduction', '🕊️', 'teal', 4),
('mindfulness', 'Mindfulness', 'Present moment awareness practices', '🧘', 'orange', 5),
('breathing', 'Breathing Exercises', 'Guided breathing patterns and techniques', '💨', 'cyan', 6),
('body-scan', 'Body Scan', 'Progressive muscle relaxation and tension release', '🤲', 'pink', 7),
('loving-kindness', 'Loving Kindness', 'Compassion meditation and self-love practices', '💖', 'rose', 8)
ON CONFLICT (slug) DO NOTHING;