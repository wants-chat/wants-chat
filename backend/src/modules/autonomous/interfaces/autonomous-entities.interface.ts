/**
 * Autonomous Module Database Entities
 * TypeScript interfaces that map directly to database tables (snake_case)
 * Use these for database operations; use autonomous.interface.ts types for API responses
 */

// ============================================
// autonomous_tasks table
// ============================================

export interface AutonomousTaskEntity {
  id: string;
  user_id: string;
  conversation_id?: string;
  parent_task_id?: string;

  // Task info
  task_type: string;
  title: string;
  description?: string;

  // Input & configuration (JSONB)
  input: Record<string, any>;
  config: Record<string, any>;

  // Planning (JSONB)
  plan?: Record<string, any>;

  // Status
  status: string;
  progress: Record<string, any>;

  // Scheduling
  priority: number;
  scheduled_at?: string;
  repeat_config?: Record<string, any>;

  // Results (JSONB)
  result?: Record<string, any>;

  // Error handling (JSONB)
  error?: Record<string, any>;
  retry_count: number;
  max_retries: number;

  // Timeouts & limits
  timeout_seconds: number;
  max_steps: number;

  // Resource tracking
  tokens_used: number;
  cost_cents: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  last_heartbeat_at?: string;
}

// ============================================
// task_steps table
// ============================================

export interface TaskStepEntity {
  id: string;
  task_id: string;

  // Step info
  step_number: number;
  name?: string;
  description?: string;

  // Execution
  agent_type: string;
  action: string;
  input: Record<string, any>;

  // Dependencies (UUID array)
  dependencies?: string[];

  // Status
  status: string;

  // Results (JSONB)
  output?: Record<string, any>;
  error?: Record<string, any>;

  // Retry handling
  retry_count: number;
  max_retries: number;

  // Timing
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
}

// ============================================
// task_artifacts table
// ============================================

export interface TaskArtifactEntity {
  id: string;
  task_id: string;
  step_id?: string;

  // Artifact info
  artifact_type: string;
  name?: string;
  description?: string;

  // Content
  mime_type?: string;
  file_path?: string;
  content?: string;
  file_size?: number;
  file_hash?: string;

  // Preview
  thumbnail_path?: string;
  preview_content?: string;

  // Metadata (JSONB)
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
}

// ============================================
// browser_sessions table
// ============================================

export interface BrowserSessionEntity {
  id: string;
  task_id: string;
  user_id: string;

  // Session info
  browser_type: string;
  headless: boolean;

  // Status
  status: string;

  // State
  current_url?: string;
  page_title?: string;
  viewport: Record<string, any>;
  user_agent?: string;

  // Session persistence (JSONB, encrypted)
  cookies?: Record<string, any>;
  local_storage?: Record<string, any>;
  session_storage?: Record<string, any>;

  // Metrics
  pages_visited: number;
  actions_performed: number;
  errors_count: number;

  // Resource limits
  max_pages: number;
  timeout_seconds: number;

  // Timestamps
  created_at: string;
  last_activity_at: string;
  closed_at?: string;
}

// ============================================
// browser_actions table
// ============================================

export interface BrowserActionEntity {
  id: string;
  session_id: string;
  step_id?: string;

  // Action info
  action_type: string;
  instruction?: string;
  selector?: string;

  // Input/Output (JSONB)
  input?: Record<string, any>;
  output?: Record<string, any>;

  // Page context
  url?: string;
  page_title?: string;

  // Screenshot
  screenshot_path?: string;

  // Status
  success: boolean;
  error_message?: string;

  // Timing
  duration_ms?: number;
  created_at: string;
}

// ============================================
// langgraph_checkpoints table
// ============================================

export interface LangGraphCheckpointEntity {
  thread_id: string;
  checkpoint_id: string;
  parent_checkpoint_id?: string;

  // State (JSONB)
  channel_values: Record<string, any>;
  channel_versions: Record<string, any>;
  versions_seen: Record<string, any>;

  // Node info
  current_node?: string;
  next_nodes?: Record<string, any>;

  // Metadata (JSONB)
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
}

// ============================================
// langgraph_checkpoint_writes table
// ============================================

export interface LangGraphCheckpointWriteEntity {
  thread_id: string;
  checkpoint_id: string;
  task_id: string;
  channel: string;

  // Write data (JSONB)
  value: Record<string, any>;

  // Timestamps
  created_at: string;
}

// ============================================
// intent_patterns table
// ============================================

export interface IntentPatternEntity {
  id: string;

  // Pattern info
  pattern: string;
  pattern_type: string;

  // Classification
  domain?: string;
  depth?: string;
  task_type?: string;
  action?: string;

  // Examples (TEXT array)
  examples?: string[];

  // Scoring
  confidence: number;
  priority: number;

  // Status
  enabled: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// task_templates table
// ============================================

export interface TaskTemplateEntity {
  id: string;

  // Template info
  name: string;
  description?: string;
  category?: string;

  // Task configuration
  task_type: string;
  default_input: Record<string, any>;
  default_config: Record<string, any>;

  // Steps template (JSONB)
  steps_template: Record<string, any>[];

  // Requirements (TEXT arrays)
  required_inputs?: string[];
  optional_inputs?: string[];

  // Metadata
  estimated_duration?: number;
  complexity: string;

  // Usage tracking
  usage_count: number;
  success_rate?: number;
  avg_duration_ms?: number;

  // Status
  enabled: boolean;
  is_system: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// Utility types for database operations
// ============================================

export type InsertAutonomousTask = Omit<AutonomousTaskEntity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateAutonomousTask = Partial<Omit<AutonomousTaskEntity, 'id' | 'user_id' | 'created_at'>>;

export type InsertTaskStep = Omit<TaskStepEntity, 'id'> & {
  id?: string;
};

export type UpdateTaskStep = Partial<Omit<TaskStepEntity, 'id' | 'task_id' | 'step_number'>>;

export type InsertTaskArtifact = Omit<TaskArtifactEntity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertBrowserSession = Omit<BrowserSessionEntity, 'id' | 'created_at' | 'last_activity_at'> & {
  id?: string;
  created_at?: string;
  last_activity_at?: string;
};

export type UpdateBrowserSession = Partial<Omit<BrowserSessionEntity, 'id' | 'task_id' | 'user_id' | 'created_at'>>;

export type InsertBrowserAction = Omit<BrowserActionEntity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertLangGraphCheckpoint = LangGraphCheckpointEntity & {
  created_at?: string;
};

export type InsertIntentPattern = Omit<IntentPatternEntity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateIntentPattern = Partial<Omit<IntentPatternEntity, 'id' | 'created_at'>>;

export type InsertTaskTemplate = Omit<TaskTemplateEntity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateTaskTemplate = Partial<Omit<TaskTemplateEntity, 'id' | 'created_at'>>;
