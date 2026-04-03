/**
 * Dynamic LLM Configuration
 *
 * Models are loaded from environment variables for easy configuration
 * without code changes. All models route through OpenRouter as the unified gateway.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ============================================
// TYPES
// ============================================

export type ModelTier = 'free' | 'standard' | 'premium' | 'enterprise';
export type ModelCategory = 'chat' | 'reasoning' | 'code' | 'vision';

export interface DynamicModelConfig {
  id: string;                    // OpenRouter model ID (e.g., "openai/gpt-4o-mini")
  name: string;                  // Display name (e.g., "GPT-4o Mini")
  description: string;           // Short description
  provider: string;              // Provider name (openai, anthropic, google, deepseek)
  inputPrice: number;            // Price per 1M input tokens in microcents
  outputPrice: number;           // Price per 1M output tokens in microcents
  contextWindow: number;         // Max context window
  maxOutput: number;             // Max output tokens
  tier: ModelTier;               // Subscription tier required
  category: ModelCategory;       // Model category
  supportsVision: boolean;       // Supports image input
  supportsStreaming: boolean;    // Supports streaming
  supportsJson: boolean;         // Supports JSON mode
  isDefault: boolean;            // Is this the default model
  isActive: boolean;             // Is this model enabled
}

export interface SubscriptionTierConfig {
  name: string;
  slug: string;
  monthlyPrice: number;          // In cents
  yearlyPrice: number;           // In cents
  includedCredits: number;       // In microcents
  dailyRequestLimit: number | null;
  maxTokensPerRequest: number | null;
  allowedTiers: ModelTier[];
  features: string[];
}

export interface CreditPackageConfig {
  name: string;
  credits: number;               // In microcents
  price: number;                 // In cents
  bonus: number;                 // Bonus credits in microcents
  isPopular: boolean;
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

/**
 * Profit margin configuration (applied to subscription credits, not purchased credits)
 * User purchased credits are pass-through (no profit)
 */
export const PROFIT_MARGIN = 0.30; // 30% profit margin on subscription credits

/**
 * Default models if LLM_MODELS env is not set
 * Prices in microcents per 1M tokens ($1 = 1,000,000 microcents)
 *
 * Model Tiers:
 * - free: Available to all users (lowest cost models)
 * - standard: Available to free + paid users
 * - premium: Available to Pro + Business users
 * - enterprise: Available to Business + Enterprise users
 *
 * Total: 35 models across 8 providers
 */
export const DEFAULT_MODELS: DynamicModelConfig[] = [
  // ============================================
  // FREE TIER MODELS (Available to all users)
  // ============================================

  // Google Gemini - Free Tier
  {
    id: 'google/gemini-2.0-flash-lite-001',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Ultra-fast, free tier model',
    provider: 'google',
    inputPrice: 0,           // Free
    outputPrice: 0,          // Free
    contextWindow: 1000000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: true,         // Default for free users
    isActive: true,
  },
  {
    id: 'google/gemma-3-4b-it',
    name: 'Gemma 3 4B',
    description: 'Lightweight Google model',
    provider: 'google',
    inputPrice: 70000,       // $0.07/1M
    outputPrice: 70000,      // $0.07/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Meta Llama - Free Tier
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B',
    description: 'Fast, lightweight Llama',
    provider: 'meta',
    inputPrice: 15000,       // $0.015/1M
    outputPrice: 25000,      // $0.025/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'meta-llama/llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B',
    description: 'Ultra-light Llama model',
    provider: 'meta',
    inputPrice: 10000,       // $0.01/1M
    outputPrice: 10000,      // $0.01/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Qwen - Free Tier
  {
    id: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B',
    description: 'Efficient Alibaba model',
    provider: 'qwen',
    inputPrice: 0,           // Free on OpenRouter
    outputPrice: 0,          // Free on OpenRouter
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Mistral - Free Tier
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B',
    description: 'Fast European AI model',
    provider: 'mistral',
    inputPrice: 30000,       // $0.03/1M
    outputPrice: 30000,      // $0.03/1M
    contextWindow: 32000,
    maxOutput: 8192,
    tier: 'free',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // ============================================
  // STANDARD TIER MODELS (Free + Paid users)
  // ============================================

  // OpenAI
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and affordable GPT-4',
    provider: 'openai',
    inputPrice: 150000,      // $0.15/1M
    outputPrice: 600000,     // $0.60/1M
    contextWindow: 128000,
    maxOutput: 16384,
    tier: 'standard',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    description: 'Latest mini model with improvements',
    provider: 'openai',
    inputPrice: 400000,      // $0.40/1M
    outputPrice: 1600000,    // $1.60/1M
    contextWindow: 1000000,
    maxOutput: 32768,
    tier: 'standard',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Google Gemini
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    description: 'Fast with built-in reasoning',
    provider: 'google',
    inputPrice: 100000,      // $0.10/1M
    outputPrice: 400000,     // $0.40/1M
    contextWindow: 1000000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    name: 'Gemini 2.5 Flash Preview',
    description: 'Latest Gemini with thinking',
    provider: 'google',
    inputPrice: 150000,      // $0.15/1M
    outputPrice: 600000,     // $0.60/1M (thinking tokens: $3.50/1M)
    contextWindow: 1000000,
    maxOutput: 65536,
    tier: 'standard',
    category: 'reasoning',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Anthropic Claude
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and affordable Claude',
    provider: 'anthropic',
    inputPrice: 800000,      // $0.80/1M
    outputPrice: 4000000,    // $4/1M
    contextWindow: 200000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Previous gen fast Claude',
    provider: 'anthropic',
    inputPrice: 250000,      // $0.25/1M
    outputPrice: 1250000,    // $1.25/1M
    contextWindow: 200000,
    maxOutput: 4096,
    tier: 'standard',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },

  // DeepSeek
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    description: 'High performance at low cost',
    provider: 'deepseek',
    inputPrice: 140000,      // $0.14/1M (cache hit: $0.014)
    outputPrice: 280000,     // $0.28/1M
    contextWindow: 64000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning model',
    provider: 'deepseek',
    inputPrice: 550000,      // $0.55/1M
    outputPrice: 2190000,    // $2.19/1M
    contextWindow: 64000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'reasoning',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Meta Llama
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Powerful open-source model',
    provider: 'meta',
    inputPrice: 120000,      // $0.12/1M
    outputPrice: 300000,     // $0.30/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Large Llama model',
    provider: 'meta',
    inputPrice: 350000,      // $0.35/1M
    outputPrice: 400000,     // $0.40/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Qwen
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    description: 'Large Alibaba model',
    provider: 'qwen',
    inputPrice: 350000,      // $0.35/1M
    outputPrice: 400000,     // $0.40/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'qwen/qwq-32b',
    name: 'QwQ 32B',
    description: 'Qwen reasoning model',
    provider: 'qwen',
    inputPrice: 120000,      // $0.12/1M
    outputPrice: 180000,     // $0.18/1M
    contextWindow: 131000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'reasoning',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Mistral
  {
    id: 'mistralai/mistral-small-2503',
    name: 'Mistral Small',
    description: 'Efficient Mistral model',
    provider: 'mistral',
    inputPrice: 100000,      // $0.10/1M
    outputPrice: 300000,     // $0.30/1M
    contextWindow: 32000,
    maxOutput: 8192,
    tier: 'standard',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // ============================================
  // PREMIUM TIER MODELS (Pro + Business users)
  // ============================================

  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable GPT-4 model',
    provider: 'openai',
    inputPrice: 2500000,     // $2.50/1M
    outputPrice: 10000000,   // $10/1M
    contextWindow: 128000,
    maxOutput: 16384,
    tier: 'premium',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    description: 'Latest GPT-4 with 1M context',
    provider: 'openai',
    inputPrice: 2000000,     // $2/1M
    outputPrice: 8000000,    // $8/1M
    contextWindow: 1000000,
    maxOutput: 32768,
    tier: 'premium',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'openai/o1-mini',
    name: 'o1-mini',
    description: 'OpenAI reasoning model',
    provider: 'openai',
    inputPrice: 1100000,     // $1.10/1M
    outputPrice: 4400000,    // $4.40/1M
    contextWindow: 128000,
    maxOutput: 65536,
    tier: 'premium',
    category: 'reasoning',
    supportsVision: false,
    supportsStreaming: false,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'openai/o3-mini',
    name: 'o3-mini',
    description: 'Latest OpenAI reasoning',
    provider: 'openai',
    inputPrice: 1100000,     // $1.10/1M
    outputPrice: 4400000,    // $4.40/1M
    contextWindow: 128000,
    maxOutput: 65536,
    tier: 'premium',
    category: 'reasoning',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Anthropic Claude
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best balance of speed and intelligence',
    provider: 'anthropic',
    inputPrice: 3000000,     // $3/1M
    outputPrice: 15000000,   // $15/1M
    contextWindow: 200000,
    maxOutput: 8192,
    tier: 'premium',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Latest Claude Sonnet',
    provider: 'anthropic',
    inputPrice: 3000000,     // $3/1M
    outputPrice: 15000000,   // $15/1M
    contextWindow: 200000,
    maxOutput: 16000,
    tier: 'premium',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },

  // Google Gemini
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    description: 'Most capable Gemini',
    provider: 'google',
    inputPrice: 1250000,     // $1.25/1M
    outputPrice: 10000000,   // $10/1M (thinking: $10/1M)
    contextWindow: 1000000,
    maxOutput: 65536,
    tier: 'premium',
    category: 'reasoning',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Mistral
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large',
    description: 'Flagship Mistral model',
    provider: 'mistral',
    inputPrice: 2000000,     // $2/1M
    outputPrice: 6000000,    // $6/1M
    contextWindow: 128000,
    maxOutput: 8192,
    tier: 'premium',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // Cohere
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    description: 'Powerful Cohere model',
    provider: 'cohere',
    inputPrice: 2500000,     // $2.50/1M
    outputPrice: 10000000,   // $10/1M
    contextWindow: 128000,
    maxOutput: 4096,
    tier: 'premium',
    category: 'chat',
    supportsVision: false,
    supportsStreaming: true,
    supportsJson: true,
    isDefault: false,
    isActive: true,
  },

  // ============================================
  // ENTERPRISE TIER MODELS (Business + Enterprise)
  // ============================================

  // OpenAI
  {
    id: 'openai/o1',
    name: 'o1',
    description: 'Most powerful reasoning model',
    provider: 'openai',
    inputPrice: 15000000,    // $15/1M
    outputPrice: 60000000,   // $60/1M
    contextWindow: 200000,
    maxOutput: 100000,
    tier: 'enterprise',
    category: 'reasoning',
    supportsVision: true,
    supportsStreaming: false,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'openai/o1-pro',
    name: 'o1 Pro',
    description: 'Enhanced o1 with more compute',
    provider: 'openai',
    inputPrice: 150000000,   // $150/1M
    outputPrice: 600000000,  // $600/1M
    contextWindow: 128000,
    maxOutput: 100000,
    tier: 'enterprise',
    category: 'reasoning',
    supportsVision: true,
    supportsStreaming: false,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },

  // Anthropic Claude
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model',
    provider: 'anthropic',
    inputPrice: 15000000,    // $15/1M
    outputPrice: 75000000,   // $75/1M
    contextWindow: 200000,
    maxOutput: 4096,
    tier: 'enterprise',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    description: 'Latest flagship Claude',
    provider: 'anthropic',
    inputPrice: 15000000,    // $15/1M
    outputPrice: 75000000,   // $75/1M
    contextWindow: 200000,
    maxOutput: 32000,
    tier: 'enterprise',
    category: 'chat',
    supportsVision: true,
    supportsStreaming: true,
    supportsJson: false,
    isDefault: false,
    isActive: true,
  },
];

export const DEFAULT_SUBSCRIPTION_TIERS: SubscriptionTierConfig[] = [
  {
    name: 'Free',
    slug: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    includedCredits: 500000,     // $0.50 worth (reasonable daily free usage)
    dailyRequestLimit: 25,       // 25 messages per day
    maxTokensPerRequest: 2048,   // Limited output length
    allowedTiers: ['free'],      // ONLY free tier models
    features: [
      'Access to 6 free-tier models',
      '25 messages per day',
      'Basic chat features',
      '$0.50 monthly credits',
    ],
  },
  {
    name: 'Pro',
    slug: 'pro',
    monthlyPrice: 2000,          // $20
    yearlyPrice: 19200,          // $192 ($16/month)
    includedCredits: 20000000,   // $20 worth
    dailyRequestLimit: 500,
    maxTokensPerRequest: 16384,
    allowedTiers: ['free', 'standard', 'premium'],
    features: [
      'Access to 30+ models',
      '500 messages per day',
      'Premium models (GPT-4, Claude)',
      'Priority support',
      'API access',
    ],
  },
  {
    name: 'Business',
    slug: 'business',
    monthlyPrice: 5000,          // $50
    yearlyPrice: 48000,          // $480 ($40/month)
    includedCredits: 60000000,   // $60 worth
    dailyRequestLimit: null,     // Unlimited
    maxTokensPerRequest: 32768,
    allowedTiers: ['free', 'standard', 'premium', 'enterprise'],
    features: [
      'Access to ALL 35 models',
      'Unlimited messages',
      'Enterprise models (o1, Opus)',
      'Team collaboration',
      'Dedicated support',
      'Analytics dashboard',
    ],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyPrice: 0,             // Custom
    yearlyPrice: 0,
    includedCredits: 0,          // Custom allocation
    dailyRequestLimit: null,
    maxTokensPerRequest: null,
    allowedTiers: ['free', 'standard', 'premium', 'enterprise'],
    features: [
      'Everything in Business',
      'Custom model fine-tuning',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom integrations',
      'Volume discounts',
    ],
  },
];

export const DEFAULT_CREDIT_PACKAGES: CreditPackageConfig[] = [
  { name: '$5 Credits', credits: 5000000, price: 500, bonus: 0, isPopular: false },
  { name: '$10 Credits', credits: 10000000, price: 1000, bonus: 500000, isPopular: true },
  { name: '$25 Credits', credits: 25000000, price: 2500, bonus: 2000000, isPopular: false },
  { name: '$50 Credits', credits: 50000000, price: 5000, bonus: 5000000, isPopular: false },
  { name: '$100 Credits', credits: 100000000, price: 10000, bonus: 15000000, isPopular: false },
];

// ============================================
// MEDIA PRICING CONFIGURATION
// Prices from Runware API (as of Jan 2026)
// All prices in microcents ($1 = 1,000,000 microcents)
// ============================================

export interface MediaPricingConfig {
  image: {
    generation: Record<string, number>;      // Per image by model
    upscale: Record<string, number>;         // Per upscale by factor
    backgroundRemoval: number;               // Per operation
    enhance: number;                         // Per operation
  };
  video: {
    generation: Record<string, number>;      // Per second by model
    minDuration: number;
    maxDuration: number;
  };
  audio: {
    speechToText: number;                    // Per minute
    textToSpeech: number;                    // Per 1000 characters
  };
}

/**
 * Media pricing configuration
 * Based on actual Runware API costs with configurable markup
 */
export const DEFAULT_MEDIA_PRICING: MediaPricingConfig = {
  image: {
    // Image generation pricing per image (based on Runware credits)
    generation: {
      'juggernaut-pro-flux': 50000,          // $0.05 per image (Runware: ~0.5 credits)
      'flux-schnell': 20000,                 // $0.02 per image (Runware: ~0.2 credits, fast)
      'flux-dev': 80000,                     // $0.08 per image
      'stable-diffusion-xl': 40000,          // $0.04 per image
      'default': 50000,                      // Default fallback
    },
    // Upscale pricing by factor
    upscale: {
      '2x': 30000,                           // $0.03 per 2x upscale
      '4x': 60000,                           // $0.06 per 4x upscale
    },
    // Background removal per operation
    backgroundRemoval: 20000,                // $0.02 per removal
    // Image enhancement per operation
    enhance: 40000,                          // $0.04 per enhance
  },
  video: {
    // Video generation per second of output
    generation: {
      'bytedance-2.2': 500000,               // $0.50 per second
      'vidu-2.0': 400000,                    // $0.40 per second
      'kling-1.0-pro': 600000,               // $0.60 per second
      'kling-2.6-pro': 800000,               // $0.80 per second
      'default': 500000,                     // Default fallback
    },
    minDuration: 3,                          // Minimum 3 seconds
    maxDuration: 10,                         // Maximum 10 seconds
  },
  audio: {
    // Speech-to-text (Whisper) per minute of audio
    speechToText: 6000,                      // $0.006 per minute (OpenAI Whisper pricing)
    // Text-to-speech per 1000 characters
    textToSpeech: 15000,                     // $0.015 per 1K chars (OpenAI TTS pricing)
  },
};

/**
 * Calculate image generation cost
 */
export function calculateImageCost(
  model: string = 'default',
  count: number = 1,
  width: number = 1024,
  height: number = 1024,
  profitMargin: number = PROFIT_MARGIN,
): number {
  const basePrice = DEFAULT_MEDIA_PRICING.image.generation[model]
    || DEFAULT_MEDIA_PRICING.image.generation['default'];

  // Size multiplier: larger images cost more
  const pixelCount = width * height;
  const basePixels = 1024 * 1024; // 1 megapixel baseline
  const sizeMultiplier = Math.max(1, Math.sqrt(pixelCount / basePixels));

  const cost = Math.ceil(basePrice * count * sizeMultiplier);
  return Math.ceil(cost * (1 + profitMargin));
}

/**
 * Calculate video generation cost
 */
export function calculateVideoCost(
  model: string = 'default',
  durationSeconds: number = 5,
  profitMargin: number = PROFIT_MARGIN,
): number {
  const pricePerSecond = DEFAULT_MEDIA_PRICING.video.generation[model]
    || DEFAULT_MEDIA_PRICING.video.generation['default'];

  const duration = Math.max(
    DEFAULT_MEDIA_PRICING.video.minDuration,
    Math.min(DEFAULT_MEDIA_PRICING.video.maxDuration, durationSeconds)
  );

  const cost = Math.ceil(pricePerSecond * duration);
  return Math.ceil(cost * (1 + profitMargin));
}

/**
 * Calculate audio cost (STT/TTS)
 */
export function calculateAudioCost(
  type: 'stt' | 'tts',
  amount: number, // minutes for STT, characters for TTS
  profitMargin: number = PROFIT_MARGIN,
): number {
  let cost: number;

  if (type === 'stt') {
    // Speech-to-text: per minute
    cost = Math.ceil(DEFAULT_MEDIA_PRICING.audio.speechToText * amount);
  } else {
    // Text-to-speech: per 1000 characters
    cost = Math.ceil((DEFAULT_MEDIA_PRICING.audio.textToSpeech * amount) / 1000);
  }

  return Math.ceil(cost * (1 + profitMargin));
}

/**
 * Calculate image upscale cost
 */
export function calculateUpscaleCost(
  factor: 2 | 4 = 2,
  profitMargin: number = PROFIT_MARGIN,
): number {
  const basePrice = DEFAULT_MEDIA_PRICING.image.upscale[`${factor}x`]
    || DEFAULT_MEDIA_PRICING.image.upscale['2x'];

  return Math.ceil(basePrice * (1 + profitMargin));
}

/**
 * Calculate background removal cost
 */
export function calculateBackgroundRemovalCost(
  profitMargin: number = PROFIT_MARGIN,
): number {
  return Math.ceil(DEFAULT_MEDIA_PRICING.image.backgroundRemoval * (1 + profitMargin));
}

/**
 * Calculate image enhance cost
 */
export function calculateEnhanceCost(
  profitMargin: number = PROFIT_MARGIN,
): number {
  return Math.ceil(DEFAULT_MEDIA_PRICING.image.enhance * (1 + profitMargin));
}

/**
 * Format microcents to readable currency
 */
export function formatCredits(microcents: number): string {
  const dollars = microcents / 1000000;
  // Show 2 decimal places for clean display
  return `$${dollars.toFixed(2)}`;
}

// ============================================
// DYNAMIC CONFIG SERVICE
// ============================================

@Injectable()
export class DynamicLLMConfigService implements OnModuleInit {
  private readonly logger = new Logger(DynamicLLMConfigService.name);

  private models: DynamicModelConfig[] = [];
  private subscriptionTiers: SubscriptionTierConfig[] = [];
  private creditPackages: CreditPackageConfig[] = [];

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.loadConfiguration();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration() {
    // Load models from LLM_MODELS env or use defaults
    const modelsJson = this.configService.get<string>('LLM_MODELS');
    if (modelsJson) {
      try {
        this.models = JSON.parse(modelsJson);
        this.logger.log(`Loaded ${this.models.length} models from LLM_MODELS env`);
      } catch (error) {
        this.logger.warn('Failed to parse LLM_MODELS env, using defaults:', error.message);
        this.models = DEFAULT_MODELS;
      }
    } else {
      this.models = DEFAULT_MODELS;
      this.logger.log(`Using ${this.models.length} default models`);
    }

    // Load subscription tiers from LLM_SUBSCRIPTION_TIERS env or use defaults
    const tiersJson = this.configService.get<string>('LLM_SUBSCRIPTION_TIERS');
    if (tiersJson) {
      try {
        this.subscriptionTiers = JSON.parse(tiersJson);
      } catch (error) {
        this.subscriptionTiers = DEFAULT_SUBSCRIPTION_TIERS;
      }
    } else {
      this.subscriptionTiers = DEFAULT_SUBSCRIPTION_TIERS;
    }

    // Load credit packages from LLM_CREDIT_PACKAGES env or use defaults
    const packagesJson = this.configService.get<string>('LLM_CREDIT_PACKAGES');
    if (packagesJson) {
      try {
        this.creditPackages = JSON.parse(packagesJson);
      } catch (error) {
        this.creditPackages = DEFAULT_CREDIT_PACKAGES;
      }
    } else {
      this.creditPackages = DEFAULT_CREDIT_PACKAGES;
    }

    // Log loaded configuration
    const activeModels = this.models.filter(m => m.isActive);
    this.logger.log(`Active models: ${activeModels.map(m => m.name).join(', ')}`);
  }

  // ============================================
  // MODEL METHODS
  // ============================================

  /**
   * Get all active models
   */
  getAllModels(): DynamicModelConfig[] {
    return this.models.filter(m => m.isActive);
  }

  /**
   * Get model by ID
   * Handles both prefixed format (e.g., "openai/gpt-4o-mini") and
   * plain modelId (e.g., "gpt-4o-mini")
   */
  getModel(modelId: string): DynamicModelConfig | undefined {
    // First try exact match (most models use prefixed format like "openai/gpt-4o-mini")
    let model = this.models.find(m => m.id === modelId && m.isActive);
    if (model) return model;

    // If not found and modelId doesn't have a prefix, try matching with common prefixes
    if (!modelId.includes('/')) {
      // Try common provider prefixes
      const prefixes = ['openai/', 'anthropic/', 'google/', 'deepseek/', 'meta-llama/', 'mistralai/'];
      for (const prefix of prefixes) {
        model = this.models.find(m => m.id === `${prefix}${modelId}` && m.isActive);
        if (model) return model;
      }
    }

    return undefined;
  }

  /**
   * Get default model
   */
  getDefaultModel(): DynamicModelConfig {
    return this.models.find(m => m.isDefault && m.isActive) || this.models[0];
  }

  /**
   * Get models by tier
   */
  getModelsByTier(tier: ModelTier): DynamicModelConfig[] {
    return this.models.filter(m => m.tier === tier && m.isActive);
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: string): DynamicModelConfig[] {
    return this.models.filter(m => m.provider === provider && m.isActive);
  }

  /**
   * Get models allowed for subscription tier
   */
  getModelsForSubscription(subscriptionSlug: string): DynamicModelConfig[] {
    const tier = this.subscriptionTiers.find(t => t.slug === subscriptionSlug);
    if (!tier) return this.models.filter(m => m.tier === 'free' && m.isActive);

    return this.models.filter(m =>
      tier.allowedTiers.includes(m.tier) && m.isActive
    );
  }

  /**
   * Check if model is allowed for subscription
   */
  isModelAllowed(modelId: string, subscriptionSlug: string): boolean {
    const model = this.getModel(modelId);
    if (!model) return false;

    const tier = this.subscriptionTiers.find(t => t.slug === subscriptionSlug);
    if (!tier) return model.tier === 'free';

    return tier.allowedTiers.includes(model.tier);
  }

  // ============================================
  // PRICING METHODS
  // ============================================

  /**
   * Calculate cost for token usage
   */
  calculateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number,
  ): { inputCost: number; outputCost: number; totalCost: number } {
    const model = this.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Cost per token = price per 1M / 1,000,000
    const inputCost = Math.ceil((inputTokens * model.inputPrice) / 1000000);
    const outputCost = Math.ceil((outputTokens * model.outputPrice) / 1000000);

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  /**
   * Estimate cost for a request (before making the call)
   */
  estimateCost(
    modelId: string,
    inputText: string,
    estimatedOutputTokens: number = 1000,
  ): { inputCost: number; outputCost: number; totalCost: number; inputTokens: number } {
    const model = this.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Rough estimate: 4 characters = 1 token
    const inputTokens = Math.ceil(inputText.length / 4);

    return {
      inputTokens,
      ...this.calculateCost(modelId, inputTokens, estimatedOutputTokens),
    };
  }

  /**
   * Format microcents to readable currency
   */
  formatCredits(microcents: number): string {
    const dollars = microcents / 1000000;
    // Always show 4 decimal places for precision
    return `$${dollars.toFixed(4)}`;
  }

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================

  /**
   * Get all subscription tiers
   */
  getAllSubscriptionTiers(): SubscriptionTierConfig[] {
    return this.subscriptionTiers;
  }

  /**
   * Get subscription tier by slug
   */
  getSubscriptionTier(slug: string): SubscriptionTierConfig | undefined {
    return this.subscriptionTiers.find(t => t.slug === slug);
  }

  // ============================================
  // CREDIT PACKAGE METHODS
  // ============================================

  /**
   * Get all credit packages
   */
  getAllCreditPackages(): CreditPackageConfig[] {
    return this.creditPackages;
  }

  /**
   * Get credit package by name
   */
  getCreditPackage(name: string): CreditPackageConfig | undefined {
    return this.creditPackages.find(p => p.name === name);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get model info for frontend display
   */
  getModelInfoForDisplay(): Array<{
    id: string;
    name: string;
    description: string;
    provider: string;
    tier: string;
    inputPriceDisplay: string;
    outputPriceDisplay: string;
    contextWindow: string;
    features: string[];
  }> {
    return this.getAllModels().map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      provider: model.provider,
      tier: model.tier,
      inputPriceDisplay: `$${(model.inputPrice / 1000000).toFixed(2)}/1M`,
      outputPriceDisplay: `$${(model.outputPrice / 1000000).toFixed(2)}/1M`,
      contextWindow: model.contextWindow >= 1000000
        ? `${(model.contextWindow / 1000000).toFixed(1)}M`
        : `${Math.round(model.contextWindow / 1000)}K`,
      features: [
        ...(model.supportsVision ? ['Vision'] : []),
        ...(model.supportsStreaming ? ['Streaming'] : []),
        ...(model.supportsJson ? ['JSON Mode'] : []),
      ],
    }));
  }

  /**
   * Reload configuration (useful for hot reloading)
   */
  reloadConfiguration() {
    this.loadConfiguration();
  }
}
