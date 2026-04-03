/**
 * LLM Types and Interfaces
 * Central type definitions for the LLM orchestration system
 */

// Provider slugs as const for type safety
export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  OPENROUTER: 'openrouter',
  DEEPSEEK: 'deepseek',
  GOOGLE: 'google',
} as const;

export type LLMProviderSlug = (typeof LLM_PROVIDERS)[keyof typeof LLM_PROVIDERS];

// Model tiers
export type ModelTier = 'free' | 'standard' | 'premium' | 'enterprise';

// Model categories
export type ModelCategory = 'chat' | 'reasoning' | 'code' | 'vision' | 'embedding' | 'image' | 'video';

// Provider configuration
export interface LLMProviderConfig {
  name: string;
  slug: LLMProviderSlug;
  baseUrl: string;
  apiKeyEnv: string;
  isActive: boolean;
  priority: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
}

// Model configuration
export interface LLMModelConfig {
  modelId: string;
  displayName: string;
  description?: string;
  providerSlug: LLMProviderSlug;
  contextWindow: number;
  maxOutputTokens?: number;

  // Cost per 1M tokens in microcents ($1 = 1,000,000 microcents)
  costPer1MInput: number;
  costPer1MOutput: number;

  // Capabilities
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
  supportsJsonMode: boolean;

  // Categorization
  category: ModelCategory;
  tier: ModelTier;
  isDefault: boolean;
  isActive: boolean;
}

// Chat message interface
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

// Request options for LLM calls
export interface LLMRequestOptions {
  model?: string; // Model ID to use
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: 'text' | 'json_object';
  stream?: boolean;

  // For image inputs (vision models)
  images?: Array<{
    url?: string;
    base64?: string;
    mimeType?: string;
  }>;
}

// Response from LLM including usage
export interface LLMResponse {
  content: string;
  model: string;
  usage: LLMUsage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;

  // Performance metrics
  latencyMs?: number;
  timeToFirstTokenMs?: number;
}

// Token usage tracking
export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  // Cost in microcents
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// Streaming chunk
export interface LLMStreamChunk {
  content: string;
  isComplete: boolean;
  usage?: LLMUsage;
}

// User quota and limits
export interface UserQuota {
  userId: string;

  // Balance in microcents
  balance: number;
  includedBalance: number;
  purchasedBalance: number;

  // Subscription info
  planId?: string;
  allowedModelTiers: ModelTier[];
  maxRequestsPerDay?: number;
  maxTokensPerRequest?: number;

  // Usage today
  requestsToday: number;
  tokensToday: number;
}

// Usage log entry
export interface UsageLogEntry {
  userId: string;
  conversationId?: string;
  messageId?: string;

  providerId: string;
  modelId: string;
  modelName: string;

  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  inputCost: number;
  outputCost: number;
  totalCost: number;

  latencyMs?: number;
  timeToFirstTokenMs?: number;

  requestType: 'chat' | 'completion' | 'embedding' | 'image' | 'research' | 'generation';
  isStreaming: boolean;
  status: 'success' | 'error' | 'rate_limited';
  errorMessage?: string;
}

// Credit transaction types
export type CreditTransactionType =
  | 'purchase'
  | 'usage'
  | 'refund'
  | 'bonus'
  | 'subscription_credit'
  | 'admin_adjustment';

// Credit transaction entry
export interface CreditTransaction {
  userId: string;
  type: CreditTransactionType;
  amount: number; // Positive for credits, negative for usage
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

// Model selection preference
export type ModelSelectionStrategy =
  | 'user_selected'  // User explicitly chose the model
  | 'cost_optimized' // Choose cheapest suitable model
  | 'quality_first'  // Choose best quality model user can access
  | 'speed_first'    // Choose fastest model
  | 'auto';          // Smart routing based on task

// Error types
export class LLMError extends Error {
  constructor(
    message: string,
    public code: LLMErrorCode,
    public provider?: string,
    public model?: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export type LLMErrorCode =
  | 'INSUFFICIENT_CREDITS'
  | 'RATE_LIMITED'
  | 'MODEL_NOT_AVAILABLE'
  | 'MODEL_NOT_ALLOWED'
  | 'PROVIDER_ERROR'
  | 'INVALID_REQUEST'
  | 'CONTENT_FILTERED'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'AUTHENTICATION_ERROR'
  | 'UNKNOWN_ERROR';
