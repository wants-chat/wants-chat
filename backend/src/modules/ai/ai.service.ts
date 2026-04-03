import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMRouterService } from './llm/llm-router.service';
import { CreditsService } from './llm/credits.service';
import { DynamicLLMConfigService } from './llm/dynamic-config';
import { LLMMessage, LLMRequestOptions, LLMResponse, LLMUsage } from './llm/types';

export interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemMessage?: string;
  responseFormat?: 'text' | 'json_object';
  userId?: string; // For billing
  conversationId?: string;
  messageId?: string;
  attachments?: Attachment[]; // File attachments (images, docs)
  requestType?: 'chat' | 'completion' | 'embedding' | 'image' | 'research' | 'generation'; // For usage tracking
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  imageUrls?: string[]; // For vision-capable models
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private readonly defaultModel: string;
  private readonly embeddingModel: string;
  private readonly useLLMRouter: boolean;

  constructor(
    private configService: ConfigService,
    private llmRouter: LLMRouterService,
    private creditsService: CreditsService,
    private dynamicConfig: DynamicLLMConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (apiKey) {
      this.openai = new OpenAI({ apiKey, timeout: 120000 });
      this.logger.log('✅ OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - AI features disabled');
    }

    this.defaultModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');

    // Enable LLM router for multi-provider support
    this.useLLMRouter = this.configService.get<boolean>('USE_LLM_ROUTER', true);
  }

  isConfigured(): boolean {
    return this.openai !== null || this.llmRouter.getAvailableProviders().length > 0;
  }

  // ============================================
  // Embeddings
  // ============================================

  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      this.logger.error('Embedding generation failed:', error.message);
      throw error;
    }
  }

  // ============================================
  // Text Generation
  // ============================================

  async generateText(prompt: string, options: TextGenerationOptions = {}): Promise<string> {
    const messages: ChatMessage[] = [];

    if (options.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    // Use LLM Router with billing when userId is provided
    if (this.useLLMRouter && options.userId) {
      return this.generateTextWithBilling(messages, options);
    }

    // Use LLM Router without billing (internal/system calls)
    if (this.useLLMRouter) {
      try {
        const response = await this.llmRouter.chat(messages as any, {
          model: options.model || this.defaultModel,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          responseFormat: options.responseFormat,
        });
        return response.content;
      } catch (error) {
        this.logger.error('Text generation failed via LLM Router:', error.message);
        throw error;
      }
    }

    // Fallback to direct OpenAI (strip provider prefix if present)
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      let modelId = options.model || this.defaultModel;
      // Strip provider prefix for direct OpenAI calls (e.g., "openai/gpt-4o-mini" -> "gpt-4o-mini")
      if (modelId.includes('/')) {
        modelId = modelId.split('/').pop() || modelId;
      }

      const completionOptions: any = {
        model: modelId,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
      };

      if (options.responseFormat === 'json_object') {
        completionOptions.response_format = { type: 'json_object' };
      }

      const response = await this.openai.chat.completions.create(completionOptions);
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Text generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate text with billing (quota check and credit deduction)
   */
  private async generateTextWithBilling(
    messages: ChatMessage[],
    options: TextGenerationOptions,
  ): Promise<string> {
    const userId = options.userId!;
    const modelId = options.model || this.dynamicConfig.getDefaultModel().id;
    const modelConfig = this.dynamicConfig.getModel(modelId);

    if (!modelConfig) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Estimate cost and check quota
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedCost = this.llmRouter.estimateCost(modelId, inputText, options.maxTokens || 2000);

    const quotaCheck = await this.creditsService.checkQuota(
      userId,
      modelId,
      estimatedCost.totalCost,
    );

    if (!quotaCheck.allowed) {
      throw new Error(quotaCheck.reason || 'Insufficient credits for this request');
    }

    // Make the request
    const response = await this.llmRouter.chat(messages as LLMMessage[], {
      model: modelId,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      responseFormat: options.responseFormat,
    });

    // Log usage and deduct credits
    await this.logUsageAndDeduct(userId, response, options);

    return response.content;
  }

  // ============================================
  // Chat (with multi-provider support and billing)
  // ============================================

  async chat(messages: ChatMessage[], options: TextGenerationOptions = {}): Promise<string> {
    let modelId = options.model || this.defaultModel;

    // Use LLM Router for multi-provider support
    if (this.useLLMRouter && options.userId) {
      return this.chatWithRouter(messages, options);
    }

    // Fallback to direct OpenAI call
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      // Strip provider prefix for direct OpenAI calls (e.g., "openai/gpt-4o-mini" -> "gpt-4o-mini")
      if (modelId.includes('/')) {
        modelId = modelId.split('/').pop() || modelId;
      }

      const response = await this.openai.chat.completions.create({
        model: modelId,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Chat failed:', error.message);
      throw error;
    }
  }

  /**
   * Chat using the LLM Router with billing and multi-provider support
   */
  private async chatWithRouter(
    messages: ChatMessage[],
    options: TextGenerationOptions,
  ): Promise<string> {
    const userId = options.userId!;
    const modelId = options.model || this.dynamicConfig.getDefaultModel().id;
    const modelConfig = this.dynamicConfig.getModel(modelId);

    if (!modelConfig) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Estimate cost and check quota
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedCost = this.llmRouter.estimateCost(modelId, inputText, 2000);

    const quotaCheck = await this.creditsService.checkQuota(
      userId,
      modelId,
      estimatedCost.totalCost,
    );

    if (!quotaCheck.allowed) {
      throw new Error(quotaCheck.reason || 'Quota exceeded');
    }

    // Make the request
    const response = await this.llmRouter.chat(messages as LLMMessage[], {
      model: modelId,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      responseFormat: options.responseFormat,
    });

    // Log usage and deduct credits
    await this.logUsageAndDeduct(userId, response, options);

    return response.content;
  }

  /**
   * Get full response with usage info (for APIs that need it)
   */
  async chatWithUsage(
    messages: ChatMessage[],
    options: TextGenerationOptions = {},
  ): Promise<LLMResponse> {
    let modelId = options.model || this.dynamicConfig.getDefaultModel().id;

    if (this.useLLMRouter) {
      const response = await this.llmRouter.chat(messages as LLMMessage[], {
        model: modelId,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        responseFormat: options.responseFormat,
      });

      // Log usage if userId provided
      if (options.userId) {
        await this.logUsageAndDeduct(options.userId, response, options);
      }

      return response;
    }

    // Fallback to OpenAI
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    // Strip provider prefix for direct OpenAI calls
    const directModelId = modelId.includes('/') ? modelId.split('/').pop() || modelId : modelId;

    const completion = await this.openai.chat.completions.create({
      model: directModelId,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    });

    const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content: completion.choices[0]?.message?.content || '',
      model: modelId,
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
      },
      finishReason: completion.choices[0]?.finish_reason as any,
    };
  }

  async *chatStream(
    messages: ChatMessage[],
    options: TextGenerationOptions = {},
  ): AsyncGenerator<string> {
    let modelId = options.model || this.defaultModel;

    // Use LLM Router for streaming if available
    if (this.useLLMRouter && options.userId) {
      yield* this.chatStreamWithRouter(messages, options);
      return;
    }

    // Fallback to direct OpenAI streaming
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      // Strip provider prefix for direct OpenAI calls
      const directModelId = modelId.includes('/') ? modelId.split('/').pop() || modelId : modelId;

      const stream = await this.openai.chat.completions.create({
        model: directModelId,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.logger.error('Chat stream failed:', error.message);
      throw error;
    }
  }

  /**
   * Stream chat using LLM Router with billing
   */
  private async *chatStreamWithRouter(
    messages: ChatMessage[],
    options: TextGenerationOptions,
  ): AsyncGenerator<string> {
    const userId = options.userId!;
    const modelId = options.model || this.dynamicConfig.getDefaultModel().id;

    // Check quota before streaming
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedCost = this.llmRouter.estimateCost(modelId, inputText, 4000);

    const quotaCheck = await this.creditsService.checkQuota(
      userId,
      modelId,
      estimatedCost.totalCost,
    );

    if (!quotaCheck.allowed) {
      throw new Error(quotaCheck.reason || 'Quota exceeded');
    }

    let totalUsage: LLMUsage | undefined;
    let accumulatedContent = '';

    for await (const chunk of this.llmRouter.chatStream(messages as LLMMessage[], {
      model: modelId,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })) {
      if (chunk.content) {
        accumulatedContent += chunk.content;
        yield chunk.content;
      }

      if (chunk.usage) {
        totalUsage = chunk.usage;
      }
    }

    // Log usage after stream completes
    if (totalUsage) {
      this.logger.log(`Stream complete. Model: ${modelId}, Tokens: ${totalUsage.totalTokens}, Cost: ${totalUsage.totalCost} microcents`);
      await this.logUsageAndDeduct(userId, {
        content: accumulatedContent,
        model: modelId,
        usage: totalUsage,
        finishReason: 'stop',
      }, options);
    } else {
      // Fallback: Estimate usage from text lengths when streaming doesn't provide usage data
      // This ensures we still track and bill for usage even without provider-reported tokens
      this.logger.warn(`Stream complete but no usage data received for model: ${modelId}. Using estimated tokens.`);

      // Estimate tokens (roughly 4 characters per token)
      const estimatedInputTokens = Math.ceil(inputText.length / 4);
      const estimatedOutputTokens = Math.ceil(accumulatedContent.length / 4);

      // Calculate costs based on model config
      const costs = this.dynamicConfig.calculateCost(
        modelId,
        estimatedInputTokens,
        estimatedOutputTokens,
      );

      const estimatedUsage: LLMUsage = {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        totalTokens: estimatedInputTokens + estimatedOutputTokens,
        inputCost: costs.inputCost,
        outputCost: costs.outputCost,
        totalCost: costs.totalCost,
      };

      this.logger.log(`Using estimated usage. Model: ${modelId}, Tokens: ${estimatedUsage.totalTokens}, Cost: ${estimatedUsage.totalCost} microcents`);

      await this.logUsageAndDeduct(userId, {
        content: accumulatedContent,
        model: modelId,
        usage: estimatedUsage,
        finishReason: 'stop',
      }, options);
    }
  }

  /**
   * Log usage and deduct credits
   */
  private async logUsageAndDeduct(
    userId: string,
    response: LLMResponse,
    options: TextGenerationOptions,
  ): Promise<void> {
    const modelConfig = this.dynamicConfig.getModel(response.model);
    if (!modelConfig) {
      this.logger.warn(`Model config not found for: ${response.model}`);
      return;
    }

    this.logger.log(`Logging usage for user ${userId}: ${response.usage.totalTokens} tokens, cost: ${response.usage.totalCost} microcents`);

    try {
      // Log the usage
      const usageLogId = await this.creditsService.logUsage({
        userId,
        conversationId: options.conversationId,
        messageId: options.messageId,
        providerId: modelConfig.provider,
        modelId: response.model,
        modelName: modelConfig.name,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        totalTokens: response.usage.totalTokens,
        inputCost: response.usage.inputCost,
        outputCost: response.usage.outputCost,
        totalCost: response.usage.totalCost,
        latencyMs: response.latencyMs,
        requestType: options.requestType || 'chat',
        isStreaming: false,
        status: 'success',
      });

      // Deduct credits
      this.logger.log(`Deducting ${response.usage.totalCost} microcents from user ${userId}`);
      await this.creditsService.deductCredits(
        userId,
        response.usage.totalCost,
        usageLogId,
      );
      this.logger.log(`Credits deducted successfully for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to log usage/deduct credits:', error.message);
      // Don't throw - the request succeeded, we just failed to bill
    }
  }

  // ============================================
  // Intent Classification (for fallback)
  // ============================================

  async classifyIntent(
    userMessage: string,
    categories: string[],
  ): Promise<{ category: string; confidence: number }> {
    if (!this.openai) {
      return { category: 'general', confidence: 0 };
    }

    try {
      const prompt = `Classify the following user message into one of these categories: ${categories.join(', ')}.

User message: "${userMessage}"

Respond with JSON: {"category": "...", "confidence": 0.0-1.0}`;

      const response = await this.generateText(prompt, {
        systemMessage: 'You are an intent classifier. Respond only with valid JSON.',
        responseFormat: 'json_object',
        temperature: 0,
      });

      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Intent classification failed:', error.message);
      return { category: 'general', confidence: 0 };
    }
  }

  // ============================================
  // AUDIO TRANSCRIPTION (Whisper API)
  // ============================================

  /**
   * Transcribe audio/video file using OpenAI Whisper API
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    filename: string,
    options: {
      language?: string;
      prompt?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      temperature?: number;
    } = {},
  ): Promise<{
    text: string;
    language?: string;
    duration?: number;
    segments?: Array<{
      id: number;
      start: number;
      end: number;
      text: string;
    }>;
  }> {
    if (!this.openai) {
      throw new Error('OpenAI not configured - transcription unavailable');
    }

    try {
      this.logger.log(`Transcribing audio: ${filename}`);

      // Create a File object from the buffer (convert Buffer to Uint8Array for compatibility)
      const uint8Array = new Uint8Array(audioBuffer);
      const file = new File([uint8Array], filename, {
        type: this.getMimeType(filename),
      });

      const response = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        response_format: options.responseFormat || 'verbose_json',
        temperature: options.temperature ?? 0,
      });

      // Handle different response formats
      if (typeof response === 'string') {
        return { text: response };
      }

      return {
        text: response.text,
        language: (response as any).language,
        duration: (response as any).duration,
        segments: (response as any).segments?.map((seg: any) => ({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })),
      };
    } catch (error: any) {
      this.logger.error('Transcription failed:', error.message);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      mpeg: 'audio/mpeg',
      mpga: 'audio/mpeg',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      webm: 'video/webm',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
    };
    return mimeTypes[ext || ''] || 'audio/mpeg';
  }

  /**
   * Generate SRT subtitle format from segments
   */
  generateSRT(segments: Array<{ id: number; start: number; end: number; text: string }>): string {
    return segments
      .map((seg, index) => {
        const startTime = this.formatTimestamp(seg.start, 'srt');
        const endTime = this.formatTimestamp(seg.end, 'srt');
        return `${index + 1}\n${startTime} --> ${endTime}\n${seg.text.trim()}\n`;
      })
      .join('\n');
  }

  /**
   * Generate VTT subtitle format from segments
   */
  generateVTT(segments: Array<{ id: number; start: number; end: number; text: string }>): string {
    const header = 'WEBVTT\n\n';
    const body = segments
      .map((seg) => {
        const startTime = this.formatTimestamp(seg.start, 'vtt');
        const endTime = this.formatTimestamp(seg.end, 'vtt');
        return `${startTime} --> ${endTime}\n${seg.text.trim()}\n`;
      })
      .join('\n');
    return header + body;
  }

  /**
   * Format timestamp for subtitle files
   */
  private formatTimestamp(seconds: number, format: 'srt' | 'vtt'): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    const separator = format === 'srt' ? ',' : '.';
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${separator}${ms.toString().padStart(3, '0')}`;
  }
}
