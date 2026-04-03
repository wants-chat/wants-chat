/**
 * Autonomous Task Execution Module Interfaces
 * Defines types for the autonomous task execution system
 */

// ============================================
// Task Status and Type Enums
// ============================================

export type TaskType = 'browser' | 'research' | 'document' | 'data' | 'api' | 'composite' | 'scheduled';
export type TaskStatus = 'pending' | 'planning' | 'queued' | 'executing' | 'paused' | 'waiting_input' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export type AgentType = 'browser' | 'llm' | 'document' | 'data' | 'api' | 'custom';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';
export type ArtifactType = 'screenshot' | 'document' | 'data' | 'file' | 'log' | 'video' | 'audio';
export type BrowserSessionStatus = 'initializing' | 'active' | 'idle' | 'closed' | 'error';

// ============================================
// Autonomous Task Types
// ============================================

export interface AutonomousTask {
  id: string;
  userId: string;
  conversationId?: string;
  parentTaskId?: string;

  // Task info
  taskType: TaskType;
  title: string;
  description?: string;

  // Input & configuration
  input: Record<string, any>;
  config: TaskConfig;

  // Planning
  plan?: TaskPlan;

  // Status
  status: TaskStatus;
  progress: TaskProgress;

  // Scheduling
  priority: number; // 1-10
  scheduledAt?: string;
  repeatConfig?: RepeatConfig;

  // Results
  result?: Record<string, any>;

  // Error handling
  error?: TaskError;
  retryCount: number;
  maxRetries: number;

  // Timeouts & limits
  timeoutSeconds: number;
  maxSteps: number;

  // Resource tracking
  tokensUsed: number;
  costCents: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  lastHeartbeatAt?: string;
}

export interface TaskConfig {
  // Browser settings
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;

  // Execution settings
  parallelSteps?: boolean;
  continueOnError?: boolean;
  captureScreenshots?: boolean;

  // Notification settings
  notifyOnComplete?: boolean;
  notifyOnError?: boolean;
  webhookUrl?: string;

  // Custom settings
  [key: string]: any;
}

export interface TaskPlan {
  steps: TaskStepPlan[];
  dependencies: Record<string, string[]>; // stepId -> [dependsOnStepIds]
  estimatedDuration: number; // in seconds
  resources: string[];
}

export interface TaskStepPlan {
  id: string;
  stepNumber: number;
  name: string;
  description?: string;
  agentType: AgentType;
  action: string;
  input: Record<string, any>;
  estimatedDuration?: number;
}

export interface TaskProgress {
  currentStep: number;
  totalSteps: number;
  phase: string;
  message: string;
  percentage: number;
  stepsCompleted: number;
  stepsFailed: number;
}

export interface RepeatConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number; // For custom frequency
  cronExpression?: string;
  endDate?: string;
  maxOccurrences?: number;
  lastRun?: string;
  nextRun?: string;
  occurrenceCount: number;
}

export interface TaskError {
  code: string;
  message: string;
  stack?: string;
  retryable: boolean;
  failedStep?: string;
  timestamp: string;
}

// ============================================
// Task Step Types
// ============================================

export interface TaskStep {
  id: string;
  taskId: string;

  // Step info
  stepNumber: number;
  name?: string;
  description?: string;

  // Execution
  agentType: AgentType;
  action: string;
  input: Record<string, any>;

  // Dependencies
  dependencies: string[]; // IDs of steps that must complete first

  // Status
  status: StepStatus;

  // Results
  output?: Record<string, any>;
  error?: TaskError;

  // Retry handling
  retryCount: number;
  maxRetries: number;

  // Timing
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

// ============================================
// Task Artifact Types
// ============================================

export interface TaskArtifact {
  id: string;
  taskId: string;
  stepId?: string;

  // Artifact info
  artifactType: ArtifactType;
  name?: string;
  description?: string;

  // Content
  mimeType?: string;
  filePath?: string;
  content?: string; // For small text artifacts
  fileSize?: number;
  fileHash?: string;

  // Preview
  thumbnailPath?: string;
  previewContent?: string;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  createdAt: string;
}

// ============================================
// Browser Session Types
// ============================================

export interface BrowserSession {
  id: string;
  taskId: string;
  userId: string;

  // Session info
  browserType: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;

  // Status
  status: BrowserSessionStatus;

  // State
  currentUrl?: string;
  pageTitle?: string;
  viewport: { width: number; height: number };
  userAgent?: string;

  // Session persistence (encrypted)
  cookies?: any;
  localStorage?: any;
  sessionStorage?: any;

  // Metrics
  pagesVisited: number;
  actionsPerformed: number;
  errorsCount: number;

  // Resource limits
  maxPages: number;
  timeoutSeconds: number;

  // Timestamps
  createdAt: string;
  lastActivityAt: string;
  closedAt?: string;
}

export interface BrowserAction {
  id: string;
  sessionId: string;
  stepId?: string;

  // Action info
  actionType: string; // navigate, click, type, scroll, extract, screenshot, wait, observe, act
  instruction?: string; // Natural language instruction (for Stagehand)
  selector?: string;

  // Input/Output
  input?: Record<string, any>;
  output?: Record<string, any>;

  // Page context
  url?: string;
  pageTitle?: string;

  // Screenshot
  screenshotPath?: string;

  // Status
  success: boolean;
  errorMessage?: string;

  // Timing
  durationMs?: number;
  createdAt: string;
}

// ============================================
// Browser Agent Types
// ============================================

export interface BrowserAgentState {
  goal: string;
  currentUrl?: string;
  pageState?: PageState;
  actions: BrowserAction[];
  screenshots: ScreenshotRecord[];
  extractedData?: Record<string, any>;
  completed: boolean;
  error?: string;
}

export interface PageState {
  url: string;
  title: string;
  description?: string;
  elements: PageElement[];
  interactiveElements: number;
  scrollPosition: { x: number; y: number };
  hasPopups: boolean;
}

export interface PageElement {
  type: string;
  text?: string;
  selector?: string;
  description?: string;
  isVisible: boolean;
  isInteractive: boolean;
}

export interface ScreenshotRecord {
  data: Buffer | string;
  action: string;
  timestamp: string;
  url?: string;
}

// ============================================
// Intent Detection Types
// ============================================

export interface IntentPattern {
  id: string;
  pattern: string;
  patternType: 'research_request' | 'task_request' | 'domain_hint' | 'depth_hint';
  domain?: string;
  depth?: string;
  taskType?: TaskType;
  action?: string;
  examples: string[];
  confidence: number;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DetectedIntent {
  type: 'research' | 'task' | 'question' | 'command';
  confidence: number;
  taskType?: TaskType;
  domain?: string;
  depth?: string;
  action?: string;
  parameters: Record<string, any>;
  matchedPatterns: string[];
}

// ============================================
// Task Template Types
// ============================================

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;

  // Task configuration
  taskType: TaskType;
  defaultInput: Record<string, any>;
  defaultConfig: TaskConfig;

  // Steps template
  stepsTemplate: TaskStepTemplate[];

  // Requirements
  requiredInputs: string[];
  optionalInputs: string[];

  // Metadata
  estimatedDuration?: number; // in seconds
  complexity: 'simple' | 'medium' | 'complex';

  // Usage tracking
  usageCount: number;
  successRate?: number;
  avgDurationMs?: number;

  // Status
  enabled: boolean;
  isSystem: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TaskStepTemplate {
  name: string;
  description?: string;
  agentType: AgentType;
  action: string;
  inputTemplate: Record<string, any>;
  dependsOn?: string[]; // Step names
  optional?: boolean;
}

// ============================================
// LangGraph State Types
// ============================================

export interface TaskGraphState {
  // Input
  taskId: string;
  userId: string;
  taskType: TaskType;
  input: Record<string, any>;
  config: TaskConfig;

  // Planning
  plan: TaskPlan | null;
  currentStepIndex: number;

  // Execution
  steps: TaskStep[];
  currentStep: TaskStep | null;
  completedSteps: TaskStep[];
  failedSteps: TaskStep[];

  // Browser (if applicable)
  browserSession: BrowserSession | null;
  browserState: BrowserAgentState | null;

  // Results
  artifacts: TaskArtifact[];
  result: Record<string, any> | null;

  // Control
  status: TaskStatus;
  error: TaskError | null;
  shouldPause: boolean;
  awaitingInput: string | null;

  // Metrics
  tokensUsed: number;
  costCents: number;
  startedAt: string;
}

export interface BrowserGraphState {
  goal: string;
  taskId: string;
  stepId: string;

  // Current state
  currentUrl?: string;
  pageState: PageState | null;

  // Actions
  actions: BrowserAction[];
  currentAction?: {
    type: string;
    instruction: string;
    selector?: string;
  };

  // Results
  screenshots: ScreenshotRecord[];
  extractedData: Record<string, any>;

  // Control
  completed: boolean;
  error?: string;
  iteration: number;
  maxIterations: number;
}

// ============================================
// Progress Event Types
// ============================================

export interface TaskProgressEvent {
  taskId: string;
  status: TaskStatus;
  progress: TaskProgress;
  currentStep?: {
    stepNumber: number;
    name?: string;
    action: string;
    status: StepStatus;
  };
  timestamp: string;
}

export interface TaskCompleteEvent {
  taskId: string;
  status: 'completed' | 'failed' | 'cancelled';
  result?: Record<string, any>;
  error?: TaskError;
  artifacts: TaskArtifact[];
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    durationMs: number;
    tokensUsed: number;
    costCents: number;
  };
  timestamp: string;
}

export interface BrowserActionEvent {
  taskId: string;
  sessionId: string;
  action: BrowserAction;
  screenshot?: string; // Base64 encoded
  timestamp: string;
}

// ============================================
// Queue Job Types
// ============================================

export interface TaskJobData {
  taskId: string;
  userId: string;
  taskType: TaskType;
  input: Record<string, any>;
  config: TaskConfig;
  priority: number;
}

export interface TaskJobResult {
  taskId: string;
  status: TaskStatus;
  result?: Record<string, any>;
  error?: TaskError;
  artifacts: string[]; // Artifact IDs
  metrics: {
    durationMs: number;
    tokensUsed: number;
    costCents: number;
  };
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateTaskRequest {
  taskType: TaskType;
  title: string;
  description?: string;
  input: Record<string, any>;
  config?: Partial<TaskConfig>;
  priority?: number;
  scheduledAt?: string;
  repeatConfig?: Partial<RepeatConfig>;
}

export interface CreateTaskResponse {
  success: boolean;
  task?: AutonomousTask;
  error?: string;
}

export interface TaskListQuery {
  status?: TaskStatus | TaskStatus[];
  taskType?: TaskType | TaskType[];
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskListResponse {
  tasks: AutonomousTask[];
  total: number;
  limit: number;
  offset: number;
}
