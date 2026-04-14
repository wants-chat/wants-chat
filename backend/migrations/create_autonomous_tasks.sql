-- Autonomous Task Execution Engine tables
-- Supports the autonomous agent system (issue #40)

CREATE TABLE IF NOT EXISTS autonomous_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID,
  parent_task_id UUID REFERENCES autonomous_tasks(id) ON DELETE SET NULL,

  -- Task info
  task_type VARCHAR(50) NOT NULL DEFAULT 'composite',
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Input & configuration (JSONB)
  input JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',

  -- Planning (JSONB)
  plan JSONB,

  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  progress JSONB NOT NULL DEFAULT '{}',

  -- Scheduling
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMPTZ,
  repeat_config JSONB,

  -- Results (JSONB)
  result JSONB,

  -- Error handling (JSONB)
  error JSONB,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 1,

  -- Timeouts & limits
  timeout_seconds INTEGER NOT NULL DEFAULT 600,
  max_steps INTEGER NOT NULL DEFAULT 20,

  -- Resource tracking
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_user_id ON autonomous_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_status ON autonomous_tasks(status);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_created_at ON autonomous_tasks(created_at DESC);

CREATE TABLE IF NOT EXISTS task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,

  -- Step info
  step_number INTEGER NOT NULL,
  name VARCHAR(255),
  description TEXT,

  -- Execution
  agent_type VARCHAR(50) NOT NULL DEFAULT 'llm',
  action VARCHAR(255) NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',

  -- Dependencies (UUID array)
  dependencies UUID[] DEFAULT '{}',

  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending',

  -- Results (JSONB)
  output JSONB,
  error JSONB,

  -- Retry handling
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 1,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_task_steps_task_id ON task_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_task_steps_status ON task_steps(status);
