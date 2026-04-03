/**
 * LLM Module Exports
 */

// Types (from router service for compatibility)
export {
  LLMMessage,
  LLMRequestOptions,
  LLMUsage,
  LLMResponse,
  LLMStreamChunk,
  LLMError,
} from './llm-router.service';

// Dynamic Configuration
export {
  DynamicLLMConfigService,
  DynamicModelConfig,
  ModelTier,
  ModelCategory,
  SubscriptionTierConfig,
  CreditPackageConfig,
  DEFAULT_MODELS,
  DEFAULT_SUBSCRIPTION_TIERS,
  DEFAULT_CREDIT_PACKAGES,
  PROFIT_MARGIN,
  formatCredits,
} from './dynamic-config';

// Services
export { LLMRouterService } from './llm-router.service';
export { CreditsService } from './credits.service';
