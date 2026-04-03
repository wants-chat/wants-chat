-- Migration: context_intelligence_tables
-- Created at: 2025-12-27
-- Description: Creates tables for Context Intelligence system (onboarding, organizations, UI history, chat extraction)

-- ============================================
-- USER ONBOARDING
-- ============================================
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Account Type
  account_type VARCHAR(50) DEFAULT 'individual', -- individual, team

  -- Personal Profile
  display_name VARCHAR(255),
  role VARCHAR(100), -- developer, designer, marketer, manager, student, freelancer, business_owner, other
  primary_use_case VARCHAR(100), -- content_creation, development, data_analysis, business, personal, education
  industry VARCHAR(100), -- technology, finance, healthcare, education, ecommerce, marketing, legal, real_estate, other
  company_name VARCHAR(255),
  company_size VARCHAR(50), -- solo, 2-10, 11-50, 51-200, 201-1000, 1000+

  -- Regional Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(100),
  country VARCHAR(10), -- ISO country code
  measurement_system VARCHAR(20) DEFAULT 'metric', -- metric, imperial

  -- Output Preferences
  tone_preference VARCHAR(50) DEFAULT 'professional', -- casual, professional, formal, friendly
  output_length VARCHAR(50) DEFAULT 'balanced', -- concise, balanced, detailed

  -- Health & Fitness (optional)
  date_of_birth DATE,
  gender VARCHAR(50), -- male, female, other, prefer_not_to_say
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_goal VARCHAR(100), -- lose_weight, gain_muscle, maintain, improve_fitness
  dietary_preference VARCHAR(100), -- none, vegetarian, vegan, keto, paleo, halal, kosher

  -- Finance (optional)
  income_range VARCHAR(50), -- prefer_not_to_say, 0-25k, 25k-50k, 50k-100k, 100k-200k, 200k+
  financial_goal VARCHAR(100), -- save_more, invest, pay_debt, budget_better, retirement

  -- Connected Services
  connected_services JSONB DEFAULT '[]', -- [{service: "google", connected_at: timestamp}]

  -- Completion Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  onboarding_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);

-- ============================================
-- ORGANIZATION MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);

-- ============================================
-- ORGANIZATION INVITATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Filled after acceptance
  role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_org_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);

-- ============================================
-- CONTEXTUAL UI HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS contextual_ui_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- UI Identification
  ui_type VARCHAR(255) NOT NULL, -- e.g., "currency-converter", "bmi-calculator"
  ui_category VARCHAR(100), -- e.g., "converter", "calculator", "generator"

  -- Stored Inputs (the actual form values)
  ui_inputs JSONB DEFAULT '{}',

  -- Usage Tracking
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contextual_ui_history_user_ui ON contextual_ui_history(user_id, ui_type);
CREATE INDEX IF NOT EXISTS idx_contextual_ui_history_user_last_used ON contextual_ui_history(user_id, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_contextual_ui_history_org ON contextual_ui_history(user_id, organization_id, ui_type);

-- ============================================
-- CHAT EXTRACTED CONTEXT
-- ============================================
CREATE TABLE IF NOT EXISTS chat_extracted_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID, -- Optional project scope

  -- Source Reference
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  source_message_id UUID, -- The message this was extracted from

  -- Extracted Entity
  entity_type VARCHAR(100) NOT NULL, -- budget, deadline, company_name, product_name, etc.
  entity_value TEXT NOT NULL,
  entity_metadata JSONB DEFAULT '{}', -- Additional structured data

  -- Confidence & Validation
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  extraction_method VARCHAR(50) DEFAULT 'ai', -- ai, explicit, inferred
  validated_by_user BOOLEAN DEFAULT FALSE,

  -- Lifecycle
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Some context is temporary
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_extracted_context_user_type ON chat_extracted_context(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_chat_extracted_context_user_active ON chat_extracted_context(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_extracted_context_conversation ON chat_extracted_context(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_extracted_context_confidence ON chat_extracted_context(confidence DESC);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_onboarding_updated_at') THEN
    CREATE TRIGGER update_user_onboarding_updated_at
      BEFORE UPDATE ON user_onboarding
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON organizations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_invitations_updated_at') THEN
    CREATE TRIGGER update_organization_invitations_updated_at
      BEFORE UPDATE ON organization_invitations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contextual_ui_history_updated_at') THEN
    CREATE TRIGGER update_contextual_ui_history_updated_at
      BEFORE UPDATE ON contextual_ui_history
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
