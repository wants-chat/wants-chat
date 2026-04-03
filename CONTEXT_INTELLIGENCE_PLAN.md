# Wants.chat Context Intelligence Implementation Plan

## Executive Summary

This plan implements a 3-pillar context system that intelligently pre-fills contextual UIs while minimizing risk of incorrect data.

**Priority Order (Safety-First):**
1. **UI History** (Highest) - User's explicit past inputs for each tool
2. **Onboarding Data** (High) - User-configured preferences
3. **Chat Extraction** (Lowest) - AI-analyzed with strict confidence thresholds

---

## Phase 1: Database Schema

### 1.1 User Onboarding Table

```sql
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Account Type
  account_type VARCHAR(20) DEFAULT 'individual', -- individual, team

  -- Personal Profile
  display_name VARCHAR(100),
  role VARCHAR(50), -- developer, designer, marketer, manager, student, freelancer, business_owner, other
  primary_use_case VARCHAR(50), -- content_creation, development, data_analysis, business, personal, education
  industry VARCHAR(50), -- technology, finance, healthcare, education, ecommerce, marketing, legal, real_estate, other
  company_name VARCHAR(100),
  company_size VARCHAR(20), -- solo, 2-10, 11-50, 51-200, 201-1000, 1000+

  -- Regional Preferences (Critical for many tools)
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50),
  country VARCHAR(2), -- ISO country code
  measurement_system VARCHAR(10) DEFAULT 'metric', -- metric, imperial

  -- Output Preferences
  tone_preference VARCHAR(20) DEFAULT 'professional', -- casual, professional, formal, friendly
  output_length VARCHAR(20) DEFAULT 'balanced', -- concise, balanced, detailed

  -- Health & Fitness (for health-related tools)
  date_of_birth DATE,
  gender VARCHAR(20), -- male, female, other, prefer_not_to_say
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_goal VARCHAR(30), -- lose_weight, gain_muscle, maintain, improve_fitness
  dietary_preference VARCHAR(30), -- none, vegetarian, vegan, keto, paleo, halal, kosher

  -- Finance (for finance-related tools)
  income_range VARCHAR(30), -- prefer_not_to_say, 0-25k, 25k-50k, 50k-100k, 100k-200k, 200k+
  financial_goal VARCHAR(30), -- save_more, invest, pay_debt, budget_better, retirement

  -- Connected Services
  connected_services JSONB DEFAULT '[]', -- [{service: "google", connected_at: timestamp}]

  -- Completion Status
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  onboarding_completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### 1.2 Contextual UI History Table

```sql
CREATE TABLE contextual_ui_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- UI Identification
  ui_type VARCHAR(100) NOT NULL, -- e.g., "currency-converter", "bmi-calculator"
  ui_category VARCHAR(50), -- e.g., "converter", "calculator", "generator"

  -- Stored Inputs (the actual form values)
  ui_inputs JSONB NOT NULL DEFAULT '{}',

  -- Usage Tracking
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Composite unique: one history per user per UI type (per org if applicable)
  UNIQUE(user_id, ui_type, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

CREATE INDEX idx_ui_history_user_type ON contextual_ui_history(user_id, ui_type);
CREATE INDEX idx_ui_history_last_used ON contextual_ui_history(user_id, last_used_at DESC);
```

### 1.3 Chat Extracted Context Table

```sql
CREATE TABLE chat_extracted_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID,

  -- Source Reference
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  source_message_id UUID,

  -- Extracted Entity
  entity_type VARCHAR(50) NOT NULL, -- budget, deadline, company_name, product_name, etc.
  entity_value TEXT NOT NULL,
  entity_metadata JSONB DEFAULT '{}', -- Additional structured data

  -- Confidence & Validation
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  extraction_method VARCHAR(20) DEFAULT 'ai', -- ai, explicit, inferred
  validated_by_user BOOLEAN DEFAULT false,

  -- Lifecycle
  extracted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Some context is temporary
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_context_user_entity ON chat_extracted_context(user_id, entity_type);
CREATE INDEX idx_chat_context_confidence ON chat_extracted_context(user_id, confidence DESC);
CREATE INDEX idx_chat_context_active ON chat_extracted_context(user_id, is_active) WHERE is_active = true;
```

### 1.4 Organization Tables

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- owner, admin, member
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id), -- Filled after acceptance
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 2: Onboarding Flow Design

### 2.1 Onboarding Steps (5 Steps)

```
STEP 1: WELCOME & ACCOUNT TYPE
├── Welcome message with value proposition
├── Account type selection:
│   ├── Individual (continue solo)
│   └── Team (create org after onboarding)
└── Skip option available

STEP 2: ABOUT YOU
├── Display name
├── Role (dropdown with common options + other)
├── Primary use case (what will you mainly use wants.chat for?)
├── Industry (optional, helps with templates)
└── Company info (optional, for team/business users)

STEP 3: REGIONAL SETTINGS
├── Language (auto-detected, changeable)
├── Currency (auto-detected from location)
├── Timezone (auto-detected)
├── Country (auto-detected)
├── Measurement system (metric/imperial)
└── All auto-detected with edit option

STEP 4: OUTPUT PREFERENCES
├── Tone preference (casual → formal slider)
├── Output length (concise → detailed slider)
└── Preview examples showing how AI outputs will differ

STEP 5: OPTIONAL DETAILS (Skippable)
├── Health info (for health tools) - clearly optional
├── Finance info (for finance tools) - clearly optional
└── Connected services (Google, GitHub, etc.)
└── Complete button
```

### 2.2 Onboarding Field → Tool Mapping

| Onboarding Field | Used By Tools |
|------------------|---------------|
| preferred_currency | Currency converter, budget planner, loan calculators, expense tools |
| timezone | Meeting scheduler, timezone converter, event countdown |
| measurement_system | BMI calculator, unit converters, cooking tools, construction tools |
| preferred_language | Translation tools, language phrasebook, content generators |
| role | Template suggestions, AI writing tone |
| industry | Template filtering, industry-specific suggestions |
| tone_preference | All AI content generators (emails, posts, articles) |
| output_length | AI summarizers, content generators |
| height_cm, weight_kg | BMI, calorie calculator, fitness tools |
| dietary_preference | Recipe tools, meal planners, nutrition calculators |
| date_of_birth | Age calculator, zodiac tools, retirement calculators |
| country | Visa requirements, tax estimators, legal tools |

---

## Phase 3: Context Merge Logic

### 3.1 Priority System (Safety-First)

```typescript
// Priority: Higher number = higher priority
const CONTEXT_PRIORITY = {
  SYSTEM_DEFAULT: 0,    // Fallback defaults
  ONBOARDING: 1,        // User's configured preferences
  UI_HISTORY: 2,        // User's past form inputs (HIGHEST for forms)
  CHAT_VALIDATED: 1.5,  // Chat context validated by user
  CHAT_HIGH_CONF: 0.5,  // Chat context with >0.85 confidence (suggest only)
  CHAT_LOW_CONF: 0,     // Ignored - too risky
};
```

### 3.2 Merge Function

```typescript
interface ContextSource {
  field: string;
  value: any;
  source: 'default' | 'onboarding' | 'history' | 'chat';
  confidence: number; // 0-1
  showBadge: boolean; // Show "pre-filled from X" indicator
  allowOverride: boolean; // Always true for safety
}

function getMergedContext(
  userId: string,
  uiType: string,
  orgId?: string
): Map<string, ContextSource> {
  const context = new Map<string, ContextSource>();

  // Layer 1: System defaults (lowest priority)
  const defaults = getUIDefaults(uiType);
  for (const [field, value] of Object.entries(defaults)) {
    context.set(field, {
      field,
      value,
      source: 'default',
      confidence: 1,
      showBadge: false,
      allowOverride: true
    });
  }

  // Layer 2: Onboarding data
  const onboarding = await getOnboardingData(userId);
  const onboardingMappings = getOnboardingMappings(uiType);
  for (const [uiField, onboardingField] of Object.entries(onboardingMappings)) {
    if (onboarding[onboardingField]) {
      context.set(uiField, {
        field: uiField,
        value: onboarding[onboardingField],
        source: 'onboarding',
        confidence: 1,
        showBadge: true,
        allowOverride: true
      });
    }
  }

  // Layer 3: UI History (HIGHEST for form fields)
  const history = await getUIHistory(userId, uiType, orgId);
  if (history?.ui_inputs) {
    for (const [field, value] of Object.entries(history.ui_inputs)) {
      context.set(field, {
        field,
        value,
        source: 'history',
        confidence: 1,
        showBadge: true,
        allowOverride: true
      });
    }
  }

  // Layer 4: Chat context (ONLY high confidence, suggest don't auto-fill)
  // This is handled separately - see below

  return context;
}
```

### 3.3 Chat Context Handling (Safe Approach)

```typescript
// Chat context is NOT auto-applied to forms
// Instead, it's shown as suggestions

interface ChatSuggestion {
  field: string;
  suggestedValue: any;
  confidence: number;
  source: string; // "From your conversation about X"
  extractedFrom: string; // Quote from chat
}

async function getChatSuggestions(
  userId: string,
  uiType: string
): Promise<ChatSuggestion[]> {
  const relevantEntities = await getChatEntities(userId, uiType);

  return relevantEntities
    .filter(e => e.confidence >= 0.85) // Only high confidence
    .filter(e => !e.validated_by_user || e.validated_by_user === true)
    .map(e => ({
      field: mapEntityToField(e.entity_type, uiType),
      suggestedValue: e.entity_value,
      confidence: e.confidence,
      source: `From your conversation`,
      extractedFrom: e.entity_metadata.source_text?.substring(0, 100)
    }));
}

// UI shows: "💡 Suggestion: Use $5000 for budget? (from your chat)"
// User must click to apply - never auto-filled
```

---

## Phase 4: Chat Extraction Strategy

### 4.1 Periodic Extraction (Not Real-Time)

```typescript
// Run every 5 minutes or after conversation ends
async function extractEntitiesFromConversation(
  conversationId: string,
  userId: string
) {
  const messages = await getConversationMessages(conversationId);
  const lastExtraction = await getLastExtractionTime(conversationId);

  // Only process new messages since last extraction
  const newMessages = messages.filter(m => m.created_at > lastExtraction);
  if (newMessages.length === 0) return;

  const extractionPrompt = `
    Analyze these chat messages and extract structured data.
    Only extract information that is EXPLICITLY stated, not inferred.
    Return high confidence (0.9+) only for clearly stated facts.

    Entity types to look for:
    - budget (amount with currency)
    - deadline (specific date/time)
    - company_name (if mentioned)
    - product_name (if mentioned)
    - project_name (if mentioned)
    - target_audience (if described)
    - location (city/country if mentioned)

    Messages:
    ${newMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

    Return JSON array of entities with confidence scores.
    Be conservative - if unsure, don't extract.
  `;

  const entities = await aiService.generateObject(extractionPrompt);

  // Store only entities with confidence >= 0.7
  for (const entity of entities.filter(e => e.confidence >= 0.7)) {
    await storeChatEntity(userId, conversationId, entity);
  }
}
```

### 4.2 Entity Types & Tool Mapping

| Entity Type | Applicable Tools | Confidence Threshold |
|-------------|------------------|---------------------|
| budget | Budget planner, loan calc, investment tools | 0.85 |
| deadline | Event countdown, project timeline | 0.90 |
| company_name | Business card, invoice, proposal generators | 0.85 |
| product_name | Product description, marketing tools | 0.85 |
| location | Travel tools, timezone, weather | 0.80 |
| email | Email composer (recipient) | 0.95 |
| phone | Contact tools | 0.95 |

---

## Phase 5: UI Implementation

### 5.1 Pre-fill Indicator Component

```tsx
// Shows source of pre-filled data
function PreFillBadge({ source, field }: { source: string; field: string }) {
  const badges = {
    history: { icon: '🕐', text: 'From last time', color: 'blue' },
    onboarding: { icon: '⚙️', text: 'From settings', color: 'gray' },
    chat: { icon: '💬', text: 'From chat', color: 'purple' }
  };

  const badge = badges[source];

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <span>{badge.icon}</span>
      <span>{badge.text}</span>
      <button onClick={() => clearPreFill(field)} className="ml-1">✕</button>
    </span>
  );
}
```

### 5.2 Chat Suggestion Component

```tsx
// Non-intrusive suggestion from chat context
function ChatSuggestion({ suggestion, onApply, onDismiss }) {
  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span>💡</span>
          <span>Suggestion: Use "{suggestion.suggestedValue}"?</span>
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onApply}>Apply</Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>✕</Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Based on: "{suggestion.extractedFrom}..."
      </div>
    </div>
  );
}
```

### 5.3 useContextualUI Hook

```tsx
function useContextualUI(uiType: string) {
  const { user } = useAuth();
  const [context, setContext] = useState<Map<string, ContextSource>>(new Map());
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContext() {
      setIsLoading(true);

      // Load merged context (defaults + onboarding + history)
      const merged = await api.get(`/context/${uiType}`);
      setContext(new Map(Object.entries(merged.data)));

      // Load chat suggestions (shown separately, not auto-applied)
      const chatSuggestions = await api.get(`/context/${uiType}/suggestions`);
      setSuggestions(chatSuggestions.data);

      setIsLoading(false);
    }

    loadContext();
  }, [uiType, user]);

  const saveToHistory = useCallback(async (inputs: Record<string, any>) => {
    await api.post(`/context/${uiType}/history`, { inputs });
  }, [uiType]);

  const applySuggestion = useCallback((field: string, value: any) => {
    setContext(prev => {
      const next = new Map(prev);
      next.set(field, { field, value, source: 'chat', confidence: 1, showBadge: true });
      return next;
    });
    setSuggestions(prev => prev.filter(s => s.field !== field));
  }, []);

  return {
    context,
    suggestions,
    isLoading,
    saveToHistory,
    applySuggestion,
    getFieldValue: (field: string) => context.get(field)?.value,
    getFieldSource: (field: string) => context.get(field)?.source
  };
}
```

---

## Phase 6: Implementation Order

### Sprint 1: Foundation (Week 1)
1. [ ] Database migrations for all tables
2. [ ] Backend DTOs and validation
3. [ ] Context service with basic CRUD

### Sprint 2: Onboarding (Week 2)
1. [ ] Onboarding API endpoints
2. [ ] Onboarding UI (5 steps)
3. [ ] Auto-detection for regional settings

### Sprint 3: UI History (Week 3)
1. [ ] History save on form submit
2. [ ] History retrieval on form load
3. [ ] Pre-fill indicators in UI

### Sprint 4: Organization (Week 4)
1. [ ] Organization CRUD
2. [ ] Invitation flow (copy from Fluxez)
3. [ ] Org switcher in header

### Sprint 5: Chat Intelligence (Week 5)
1. [ ] Background extraction job
2. [ ] Entity storage and retrieval
3. [ ] Suggestion UI components

### Sprint 6: Polish (Week 6)
1. [ ] UI registry for 486 tools
2. [ ] Testing and edge cases
3. [ ] Performance optimization

---

## Safety Principles

1. **Never auto-fill from chat** - Always show as suggestions
2. **Always show source** - User knows where data came from
3. **Always allow override** - User can clear/change any pre-fill
4. **High confidence only** - Chat extraction requires 0.85+ confidence
5. **Periodic not real-time** - Extract entities on conversation end, not per-message
6. **User validation** - High-value entities (email, phone) need explicit confirmation
7. **Expiration** - Chat context expires after 30 days if not validated
8. **Clear option** - User can clear all context for fresh start

---

## Files to Create

### Backend
```
backend/src/modules/
├── onboarding/
│   ├── onboarding.module.ts
│   ├── onboarding.controller.ts
│   ├── onboarding.service.ts
│   └── dto/
│       ├── onboarding.dto.ts
│       └── update-onboarding.dto.ts
├── context/
│   ├── context.module.ts
│   ├── context.controller.ts
│   ├── context.service.ts
│   └── dto/
│       ├── ui-history.dto.ts
│       └── chat-entity.dto.ts
├── organization/
│   ├── organization.module.ts
│   ├── organization.controller.ts
│   ├── organization.service.ts
│   └── dto/
│       ├── create-organization.dto.ts
│       ├── invite-member.dto.ts
│       └── update-member.dto.ts
└── jobs/
    └── chat-extraction.job.ts
```

### Frontend
```
frontend/src/
├── pages/
│   └── onboarding/
│       ├── index.tsx (main flow)
│       ├── steps/
│       │   ├── WelcomeStep.tsx
│       │   ├── AboutYouStep.tsx
│       │   ├── RegionalStep.tsx
│       │   ├── PreferencesStep.tsx
│       │   └── OptionalStep.tsx
│       └── components/
│           ├── ProgressBar.tsx
│           └── StepNavigation.tsx
├── components/
│   └── context/
│       ├── PreFillBadge.tsx
│       ├── ChatSuggestion.tsx
│       └── ContextProvider.tsx
├── hooks/
│   └── useContextualUI.ts
└── contexts/
    └── OnboardingContext.tsx
```
