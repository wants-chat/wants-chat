/**
 * Intent Router Service
 * Calls backend unified intent classifier to route user messages
 *
 * This service provides LLM-based intent detection for:
 * - app_creation: Build/create new apps
 * - web_action: Screenshot, summarize, research URLs
 * - contextual_ui: Utility tools (calculators, converters, etc.)
 * - workflow: AI workflows/agents/automation
 * - existing_app: Reference to deployed apps
 * - file_action: File-based operations
 * - chat: General conversation
 */

import { api } from '../lib/api';

// Intent categories matching backend
export type UnifiedIntentCategory =
  | 'app_creation'
  | 'web_action'
  | 'contextual_ui'
  | 'workflow'
  | 'existing_app'
  | 'file_action'
  | 'chat';

export interface UnifiedIntentClassification {
  category: UnifiedIntentCategory;
  confidence: number;

  // App creation specific
  appDescription?: string;
  appType?: string;
  appFeatures?: string[];
  appVariant?: string;
  appColors?: string[];

  // Web action specific
  webAction?: 'screenshot' | 'summarize' | 'research';
  url?: string;

  // Contextual UI specific
  toolQuery?: string;
  toolCategory?: string;

  // Workflow specific
  workflowDescription?: string;
  workflowSteps?: string[];

  // Existing app specific
  existingAppQuery?: string;

  // File action specific
  fileAction?: string;
  fileType?: string;
  targetType?: string;

  reason?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class IntentRouterService {
  private cache: Map<string, { result: UnifiedIntentClassification; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache
  private pendingRequest: Promise<UnifiedIntentClassification> | null = null;

  /**
   * Classify user intent using backend LLM
   * This is the main entry point for intent detection
   *
   * @param message - User's message to classify
   * @param context - Recent conversation messages for context
   * @returns UnifiedIntentClassification with category and extracted data
   */
  async classifyIntent(
    message: string,
    context?: ConversationMessage[]
  ): Promise<UnifiedIntentClassification> {
    const cacheKey = this.getCacheKey(message);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[IntentRouter] Cache hit:', cached.result.category);
      return cached.result;
    }

    // Prevent duplicate concurrent requests for same message
    if (this.pendingRequest) {
      console.log('[IntentRouter] Waiting for pending request');
      return this.pendingRequest;
    }

    try {
      this.pendingRequest = this.doClassify(message, context);
      const result = await this.pendingRequest;

      // Cache the result
      this.cache.set(cacheKey, { result, timestamp: Date.now() });

      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  private async doClassify(
    message: string,
    context?: ConversationMessage[]
  ): Promise<UnifiedIntentClassification> {
    const startTime = Date.now();

    try {
      const response = await api.post('/intent/classify', {
        message,
        context: context?.slice(-4), // Send last 4 messages for context
      });

      const result = response as UnifiedIntentClassification;
      const duration = Date.now() - startTime;

      console.log(
        `[IntentRouter] Classified: ${result.category} (${(result.confidence * 100).toFixed(0)}%) in ${duration}ms`
      );

      return result;
    } catch (error) {
      console.error('[IntentRouter] Classification failed:', error);
      // Return chat fallback on error
      return {
        category: 'chat',
        confidence: 0.5,
        reason: 'Classification service unavailable',
      };
    }
  }

  /**
   * Quick check if message is likely an app creation request
   * Uses classification with confidence threshold
   */
  async isAppCreation(message: string, context?: ConversationMessage[]): Promise<boolean> {
    const result = await this.classifyIntent(message, context);
    return result.category === 'app_creation' && result.confidence >= 0.7;
  }

  /**
   * Quick check if message is likely a web action request
   */
  async isWebAction(message: string, context?: ConversationMessage[]): Promise<boolean> {
    const result = await this.classifyIntent(message, context);
    return result.category === 'web_action' && result.confidence >= 0.7;
  }

  /**
   * Quick check if message references an existing app
   */
  async isExistingAppReference(message: string, context?: ConversationMessage[]): Promise<boolean> {
    const result = await this.classifyIntent(message, context);
    return result.category === 'existing_app' && result.confidence >= 0.7;
  }

  /**
   * Quick check if message is a contextual UI/tool request
   */
  async isContextualUI(message: string, context?: ConversationMessage[]): Promise<boolean> {
    const result = await this.classifyIntent(message, context);
    return result.category === 'contextual_ui' && result.confidence >= 0.7;
  }

  /**
   * Quick check if message is a workflow creation request
   */
  async isWorkflowCreation(message: string, context?: ConversationMessage[]): Promise<boolean> {
    const result = await this.classifyIntent(message, context);
    return result.category === 'workflow' && result.confidence >= 0.7;
  }

  /**
   * Clear the classification cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  private getCacheKey(message: string): string {
    // Normalize message for caching
    return message.toLowerCase().trim().slice(0, 200);
  }
}

// Export singleton instance
export const intentRouterService = new IntentRouterService();
