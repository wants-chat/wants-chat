/**
 * LLM Router Service
 *
 * Unified gateway for all LLM providers using OpenRouter.
 * OpenRouter provides a single API compatible with OpenAI SDK
 * to access models from OpenAI, Anthropic, Google, DeepSeek, and more.
 *
 * Benefits:
 * - Single API integration for 500+ models
 * - No separate API keys needed for each provider
 * - Avoids Anthropic's $100 credit limit
 * - Same pricing as direct API (5.5% fee on credit purchase only)
 * - No rate limits for paid models
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DynamicLLMConfigService, DynamicModelConfig } from './dynamic-config';

// ============================================
// TYPES
// ============================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  imageUrls?: string[]; // For vision-capable models
}

export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stopSequences?: string[];
  responseFormat?: 'text' | 'json_object';
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: LLMUsage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
  latencyMs?: number;
}

export interface LLMStreamChunk {
  content: string;
  isComplete: boolean;
  usage?: LLMUsage;
}

export class LLMError extends Error {
  constructor(
    message: string,
    public code:
      | 'QUOTA_EXCEEDED'
      | 'MODEL_NOT_AVAILABLE'
      | 'PROVIDER_ERROR'
      | 'RATE_LIMITED'
      | 'AUTHENTICATION_ERROR'
      | 'CONTEXT_LENGTH_EXCEEDED'
      | 'CONTENT_FILTERED'
      | 'CONFIGURATION_ERROR',
    public provider?: string,
    public model?: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// ============================================
// SERVICE
// ============================================

@Injectable()
export class LLMRouterService implements OnModuleInit {
  private readonly logger = new Logger(LLMRouterService.name);

  // OpenRouter client (primary gateway for ALL models)
  private openRouterClient: OpenAI | null = null;

  // Direct OpenAI client (fallback only)
  private openaiClient: OpenAI | null = null;

  // Ollama client (local/offline)
  private ollamaClient: OpenAI | null = null;

  // Active LLM provider: 'openrouter' | 'ollama' | 'openai'
  private llmProvider: string;

  // Ollama model overrides
  private ollamaModel: string;
  private ollamaEmbeddingModel: string;

  constructor(
    private configService: ConfigService,
    private dynamicConfig: DynamicLLMConfigService,
  ) {
    this.llmProvider = this.configService.get<string>('LLM_PROVIDER', 'openrouter');
    this.ollamaModel = this.configService.get<string>('OLLAMA_MODEL', 'llama3.2');
    this.ollamaEmbeddingModel = this.configService.get<string>('OLLAMA_EMBEDDING_MODEL', 'nomic-embed-text');
  }

  async onModuleInit() {
    // Initialize clients in background to not block app startup
    this.initializeClients().catch(err => {
      this.logger.error('Failed to initialize LLM clients:', err.message);
    });
  }

  /**
   * Initialize API clients
   */
  private async initializeClients() {
    // Initialize Ollama if selected as provider
    if (this.llmProvider === 'ollama') {
      const ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434/v1');
      this.ollamaClient = new OpenAI({
        apiKey: 'ollama', // Dummy key — required by SDK but unused by Ollama
        baseURL: ollamaBaseUrl,
        timeout: 120000,
      });
      this.logger.log(`Ollama client initialized (${ollamaBaseUrl}, model: ${this.ollamaModel})`);

      // Log available models
      const models = this.dynamicConfig.getAllModels();
      this.logger.log(`Available models: ${models.length}`);
      return; // Skip cloud client init when running locally
    }

    // Initialize OpenRouter (PRIMARY gateway for all models)
    const openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (openRouterApiKey) {
      this.openRouterClient = new OpenAI({
        apiKey: openRouterApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': this.configService.get<string>('FRONTEND_URL', 'https://wants.chat'),
          'X-Title': 'Wants',
        },
        timeout: 120000,
      });
      this.logger.log('OpenRouter client initialized (unified gateway for all models)');
    } else {
      this.logger.warn('OPENROUTER_API_KEY not set - limited functionality');
    }

    // Initialize direct OpenAI (FALLBACK only for OpenAI models)
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        timeout: 120000,
      });
      this.logger.log('OpenAI direct client initialized (fallback)');
    }

    // Log status
    if (!this.openRouterClient && !this.openaiClient) {
      this.logger.error('No LLM clients available! Set OPENROUTER_API_KEY or OPENAI_API_KEY');
    }

    // Log available models
    const models = this.dynamicConfig.getAllModels();
    this.logger.log(`Available models: ${models.length}`);
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.ollamaClient !== null || this.openRouterClient !== null || this.openaiClient !== null;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.ollamaClient) {
      providers.push('ollama');
    }
    if (this.openRouterClient) {
      // OpenRouter provides access to all providers
      providers.push('openrouter', 'openai', 'anthropic', 'google', 'deepseek');
    } else if (this.openaiClient) {
      providers.push('openai');
    }
    return providers;
  }

  /**
   * Get the active LLM provider
   */
  getLLMProvider(): string {
    return this.llmProvider;
  }

  /**
   * Get the Ollama model name (for callers that need to override model IDs)
   */
  getOllamaModel(): string {
    return this.ollamaModel;
  }

  /**
   * Get the Ollama embedding model name
   */
  getOllamaEmbeddingModel(): string {
    return this.ollamaEmbeddingModel;
  }

  /**
   * Get all available models
   */
  getAvailableModels(): DynamicModelConfig[] {
    return this.dynamicConfig.getAllModels();
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelId: string): DynamicModelConfig | undefined {
    return this.dynamicConfig.getModel(modelId);
  }

  /**
   * Get default model
   */
  getDefaultModel(): DynamicModelConfig {
    return this.dynamicConfig.getDefaultModel();
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: string): boolean {
    if (this.ollamaClient && provider === 'ollama') return true;
    if (this.openRouterClient) return true; // OpenRouter provides all
    if (this.openaiClient && provider === 'openai') return true;
    return false;
  }

  // ============================================
  // CHAT METHODS
  // ============================================

  /**
   * Chat completion (non-streaming)
   */
  async chat(
    messages: LLMMessage[],
    options: LLMRequestOptions = {},
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const modelId = options.model || this.getDefaultModel().id;
    const modelConfig = this.dynamicConfig.getModel(modelId);

    if (!modelConfig) {
      throw new LLMError(
        `Model not found: ${modelId}`,
        'MODEL_NOT_AVAILABLE',
        undefined,
        modelId,
      );
    }

    // Get the appropriate client
    const client = this.getClientForModel(modelId);
    if (!client) {
      throw new LLMError(
        'No LLM client available. Configure OPENROUTER_API_KEY or OPENAI_API_KEY.',
        'CONFIGURATION_ERROR',
      );
    }

    try {
      // Format messages, handling vision content if present
      const formattedMessages = messages.map(m => {
        // If message has image URLs (for vision), format as multimodal content
        if (m.imageUrls && m.imageUrls.length > 0 && modelConfig.supportsVision) {
          const contentParts: any[] = [
            { type: 'text', text: m.content },
          ];

          // Add image URLs
          for (const imageUrl of m.imageUrls) {
            contentParts.push({
              type: 'image_url',
              image_url: { url: imageUrl },
            });
          }

          return {
            role: m.role,
            content: contentParts,
            ...(m.name && { name: m.name }),
          };
        }

        // Standard text message
        return {
          role: m.role,
          content: m.content,
          ...(m.name && { name: m.name }),
        };
      });

      // Resolve model ID for the active provider (Ollama overrides to local model)
      const resolvedModel = this.resolveModelId(modelId);

      const requestOptions: any = {
        model: resolvedModel,
        messages: formattedMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? modelConfig.maxOutput,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop || options.stopSequences,
      };

      // Add response format if JSON mode requested and supported
      if (options.responseFormat === 'json_object' && modelConfig.supportsJson) {
        requestOptions.response_format = { type: 'json_object' };
      }

      const response = await client.chat.completions.create(requestOptions);
      const latencyMs = Date.now() - startTime;

      // Extract usage
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      // Calculate costs
      const costs = this.dynamicConfig.calculateCost(
        modelId,
        usage.prompt_tokens,
        usage.completion_tokens,
      );

      return {
        content: response.choices[0]?.message?.content || '',
        model: modelId,
        usage: {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          inputCost: costs.inputCost,
          outputCost: costs.outputCost,
          totalCost: costs.totalCost,
        },
        finishReason: response.choices[0]?.finish_reason as any,
        latencyMs,
      };
    } catch (error) {
      this.logger.error(`Chat error for model ${modelId}:`, error.message);

      // Try fallback to direct OpenAI if OpenRouter fails for OpenAI models
      if (
        client === this.openRouterClient &&
        this.openaiClient &&
        modelId.startsWith('openai/')
      ) {
        this.logger.warn('Attempting fallback to direct OpenAI...');
        return this.chatWithDirectOpenAI(messages, options, modelId, startTime);
      }

      throw this.handleProviderError(error, modelConfig.provider, modelId);
    }
  }

  /**
   * Fallback to direct OpenAI API
   */
  private async chatWithDirectOpenAI(
    messages: LLMMessage[],
    options: LLMRequestOptions,
    modelId: string,
    startTime: number,
  ): Promise<LLMResponse> {
    if (!this.openaiClient) {
      throw new LLMError('No fallback client available', 'CONFIGURATION_ERROR');
    }

    // Convert OpenRouter model ID to direct OpenAI model ID
    // e.g., "openai/gpt-4o-mini" -> "gpt-4o-mini"
    const directModelId = modelId.replace('openai/', '');
    const modelConfig = this.dynamicConfig.getModel(modelId);

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: directModelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? (modelConfig?.maxOutput || 4096),
      });

      const latencyMs = Date.now() - startTime;
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      const costs = modelConfig
        ? this.dynamicConfig.calculateCost(modelId, usage.prompt_tokens, usage.completion_tokens)
        : { inputCost: 0, outputCost: 0, totalCost: 0 };

      return {
        content: response.choices[0]?.message?.content || '',
        model: modelId,
        usage: {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          ...costs,
        },
        finishReason: response.choices[0]?.finish_reason as any,
        latencyMs,
      };
    } catch (error) {
      this.logger.error('Direct OpenAI fallback also failed:', error.message);
      throw this.handleProviderError(error, 'openai', modelId);
    }
  }

  /**
   * Streaming chat completion
   */
  async *chatStream(
    messages: LLMMessage[],
    options: LLMRequestOptions = {},
  ): AsyncGenerator<LLMStreamChunk> {
    const modelId = options.model || this.getDefaultModel().id;
    const modelConfig = this.dynamicConfig.getModel(modelId);

    if (!modelConfig) {
      throw new LLMError(
        `Model not found: ${modelId}`,
        'MODEL_NOT_AVAILABLE',
        undefined,
        modelId,
      );
    }

    // Fall back to non-streaming if model doesn't support it (Ollama always streams)
    if (!modelConfig.supportsStreaming && this.llmProvider !== 'ollama') {
      const response = await this.chat(messages, options);
      yield {
        content: response.content,
        isComplete: true,
        usage: response.usage,
      };
      return;
    }

    const client = this.getClientForModel(modelId);
    if (!client) {
      throw new LLMError(
        'No LLM client available',
        'CONFIGURATION_ERROR',
      );
    }

    try {
      // Resolve model ID for the active provider
      const resolvedModel = this.resolveModelId(modelId);

      const baseMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      }));

      // Ollama may not support stream_options; omit it for ollama
      const stream = this.llmProvider === 'ollama'
        ? await client.chat.completions.create({
            model: resolvedModel,
            messages: baseMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? modelConfig.maxOutput,
            stream: true,
          })
        : await client.chat.completions.create({
            model: resolvedModel,
            messages: baseMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? modelConfig.maxOutput,
            stream: true,
            stream_options: { include_usage: true },
          });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        const isComplete = chunk.choices[0]?.finish_reason !== null;

        // Check if this chunk has usage info (final chunk)
        if (chunk.usage) {
          const costs = this.dynamicConfig.calculateCost(
            modelId,
            chunk.usage.prompt_tokens,
            chunk.usage.completion_tokens,
          );

          yield {
            content: delta,
            isComplete: true,
            usage: {
              inputTokens: chunk.usage.prompt_tokens,
              outputTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
              ...costs,
            },
          };
        } else if (delta || isComplete) {
          yield {
            content: delta,
            isComplete,
          };
        }
      }
    } catch (error) {
      this.logger.error(`Stream error for model ${modelId}:`, error.message);
      throw this.handleProviderError(error, modelConfig.provider, modelId);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get the appropriate client for a model
   * OpenRouter is the primary gateway for ALL models
   */
  private getClientForModel(modelId: string): OpenAI | null {
    // Ollama: local/offline provider
    if (this.ollamaClient && this.llmProvider === 'ollama') {
      return this.ollamaClient;
    }

    // Primary: Use OpenRouter for everything (unified gateway)
    if (this.openRouterClient) {
      return this.openRouterClient;
    }

    // Fallback: Direct OpenAI for OpenAI models only
    if (this.openaiClient && modelId.startsWith('openai/')) {
      return this.openaiClient;
    }

    return null;
  }

  /**
   * Resolve the actual model ID to send to the provider.
   * When Ollama is active, any OpenRouter-style model ID (e.g. "openai/gpt-4o")
   * is replaced with the configured OLLAMA_MODEL.
   */
  resolveModelId(modelId: string): string {
    if (this.llmProvider === 'ollama') {
      return this.ollamaModel;
    }
    return modelId;
  }

  /**
   * Estimate cost before making a request
   */
  estimateCost(
    modelId: string,
    inputText: string,
    estimatedOutputTokens: number = 1000,
  ): { inputCost: number; outputCost: number; totalCost: number; inputTokens?: number } {
    return this.dynamicConfig.estimateCost(modelId, inputText, estimatedOutputTokens);
  }

  /**
   * Estimate token count
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Format credits to display string
   */
  formatCredits(microcents: number): string {
    return this.dynamicConfig.formatCredits(microcents);
  }

  /**
   * Handle provider-specific errors
   */
  private handleProviderError(error: any, provider: string, model: string): LLMError {
    const message = error.message || 'Unknown error';

    // Rate limiting
    if (error.status === 429 || message.includes('rate limit')) {
      return new LLMError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        provider,
        model,
        true,
      );
    }

    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return new LLMError(
        'Authentication failed with provider.',
        'AUTHENTICATION_ERROR',
        provider,
        model,
        false,
      );
    }

    // Insufficient credits
    if (error.status === 402) {
      return new LLMError(
        'Insufficient credits. Please add credits to continue.',
        'QUOTA_EXCEEDED',
        provider,
        model,
        false,
      );
    }

    // Context length exceeded
    if (message.includes('context length') || message.includes('maximum context')) {
      return new LLMError(
        'Message is too long for this model.',
        'CONTEXT_LENGTH_EXCEEDED',
        provider,
        model,
        false,
      );
    }

    // Content filtered
    if (message.includes('content_filter') || message.includes('safety')) {
      return new LLMError(
        'Request was filtered due to content policy.',
        'CONTENT_FILTERED',
        provider,
        model,
        false,
      );
    }

    // Generic provider error
    return new LLMError(
      message,
      'PROVIDER_ERROR',
      provider,
      model,
      true,
    );
  }

  /**
   * Test connection to OpenRouter
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.openRouterClient) {
      return { success: false, message: 'OpenRouter client not configured' };
    }

    try {
      const response = await this.openRouterClient.models.list();
      return {
        success: true,
        message: `Connected to OpenRouter. ${response.data?.length || 0} models available.`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}
