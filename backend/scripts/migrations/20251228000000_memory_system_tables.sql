-- Migration: memory_system_tables
-- Created at: 2025-12-28
-- Description: Creates tables for AI Memory System (long-term memories, conversation summaries, branching, custom instructions)

-- ============================================
-- USER MEMORIES (Long-term memory storage)
-- ============================================
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Memory Content
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'context', -- preference, fact, instruction, context

  -- Source Tracking
  source VARCHAR(50) DEFAULT 'auto', -- auto (AI-extracted), manual (user-created)
  source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  source_message_id UUID,

  -- Semantic Search Support (for future vector search)
  embedding JSONB, -- Store embedding vector as JSON array

  -- Confidence & Usage
  confidence DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00, for AI-extracted memories
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Lifecycle
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_user_active ON user_memories(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_memories_category ON user_memories(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_memories_source ON user_memories(source);
CREATE INDEX IF NOT EXISTS idx_user_memories_last_used ON user_memories(last_used_at DESC);

-- ============================================
-- CONVERSATION SUMMARIES (Compacted history)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Summary Content
  summary TEXT NOT NULL,
  key_topics JSONB DEFAULT '[]', -- ["topic1", "topic2"]
  key_decisions JSONB DEFAULT '[]', -- ["decision1", "decision2"]
  user_facts JSONB DEFAULT '[]', -- Facts extracted from this segment
  open_threads JSONB DEFAULT '[]', -- Unresolved items

  -- Message Range
  message_start_id UUID NOT NULL,
  message_end_id UUID NOT NULL,
  message_count INTEGER NOT NULL,

  -- Token Tracking
  token_count_original INTEGER NOT NULL, -- Original message tokens
  token_count_summary INTEGER NOT NULL, -- Summary tokens (for savings calculation)

  -- Semantic Search Support
  embedding JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_summaries_conversation ON conversation_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user ON conversation_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_created ON conversation_summaries(created_at DESC);

-- ============================================
-- MESSAGE BRANCHES (Thread/version support)
-- ============================================
CREATE TABLE IF NOT EXISTS message_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Branch Point
  parent_message_id UUID NOT NULL, -- Message where branch starts

  -- Branch Info
  branch_type VARCHAR(50) NOT NULL DEFAULT 'edit', -- edit (user edited message), explicit (user created branch)
  branch_label VARCHAR(255), -- Optional user label for the branch
  branch_index INTEGER NOT NULL DEFAULT 0, -- Order among sibling branches

  -- Status
  is_active BOOLEAN DEFAULT TRUE, -- Currently active branch

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_branches_conversation ON message_branches(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_branches_parent ON message_branches(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_branches_user ON message_branches(user_id);
CREATE INDEX IF NOT EXISTS idx_message_branches_active ON message_branches(conversation_id, is_active);

-- ============================================
-- USER SYSTEM INSTRUCTIONS (Custom instructions)
-- ============================================
CREATE TABLE IF NOT EXISTS user_system_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Custom Instructions
  custom_instructions TEXT, -- General instructions for AI
  about_user TEXT, -- What user wants AI to know about them
  response_preferences TEXT, -- How user wants AI to respond

  -- Feature Toggles
  enable_memories BOOLEAN DEFAULT TRUE,
  enable_personalization BOOLEAN DEFAULT TRUE,
  enable_auto_memory_extraction BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_system_instructions_user ON user_system_instructions(user_id);

-- ============================================
-- ALTER MESSAGES TABLE (Add branching support)
-- ============================================
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES message_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_summarized BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS summary_id UUID REFERENCES conversation_summaries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_message_id UUID,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_messages_branch ON messages(branch_id);
CREATE INDEX IF NOT EXISTS idx_messages_summary ON messages(summary_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_version ON messages(conversation_id, parent_message_id, version);
CREATE INDEX IF NOT EXISTS idx_messages_current ON messages(conversation_id, is_current_version);

-- ============================================
-- ALTER CONVERSATIONS TABLE (Add tracking fields)
-- ============================================
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS has_branches BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_summary_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_has_branches ON conversations(user_id, has_branches);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_memories_updated_at') THEN
    CREATE TRIGGER update_user_memories_updated_at
      BEFORE UPDATE ON user_memories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_system_instructions_updated_at') THEN
    CREATE TRIGGER update_user_system_instructions_updated_at
      BEFORE UPDATE ON user_system_instructions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- ============================================
-- HELPER FUNCTION: Update message count on insert
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations
    SET message_count = message_count + 1,
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conversations
    SET message_count = GREATEST(0, message_count - 1)
    WHERE id = OLD.conversation_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_conversation_message_count') THEN
    CREATE TRIGGER trigger_update_conversation_message_count
      AFTER INSERT OR DELETE ON messages
      FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();
  END IF;
END
$$;
