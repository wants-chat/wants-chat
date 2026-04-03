/**
 * LLM-based App Type Detector Service
 *
 * Uses LLM to match user prompts to app types.
 * Handles multi-language input naturally.
 * Falls back to keyword matching only if LLM fails.
 */

import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  AppTypeDefinition,
  AppTypeDetectionResult,
} from '../interfaces/app-type.interface';
import { ALL_APP_TYPES, APP_TYPES_BY_ID } from '../registries/app-types/index';

interface AppTypeSummary {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Injectable()
export class LLMAppTypeDetectorService {
  private readonly logger = new Logger(LLMAppTypeDetectorService.name);
  private appTypeSummaries: AppTypeSummary[];
  private categorizedAppTypes: Map<string, AppTypeSummary[]>;

  constructor(private readonly aiService: AiService) {
    // Pre-compute condensed app type list for LLM
    this.appTypeSummaries = ALL_APP_TYPES.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description.substring(0, 100), // Truncate for token efficiency
      category: app.category,
    }));

    // Group by category for two-stage matching
    this.categorizedAppTypes = new Map();
    for (const app of this.appTypeSummaries) {
      const existing = this.categorizedAppTypes.get(app.category) || [];
      existing.push(app);
      this.categorizedAppTypes.set(app.category, existing);
    }

    this.logger.log(
      `Initialized with ${this.appTypeSummaries.length} app types in ${this.categorizedAppTypes.size} categories`,
    );
  }

  /**
   * Detect app type using LLM
   */
  async detect(prompt: string): Promise<AppTypeDetectionResult> {
    try {
      // Try LLM-based detection first
      const llmResult = await this.detectWithLLM(prompt);
      if (llmResult && llmResult.confidence >= 0.6) {
        return llmResult;
      }

      // If LLM gives low confidence, try two-stage approach
      const twoStageResult = await this.detectWithTwoStage(prompt);
      if (twoStageResult && twoStageResult.confidence >= 0.5) {
        return twoStageResult;
      }

      // Return LLM result even if low confidence, or custom fallback
      return llmResult || this.getCustomAppType(prompt);
    } catch (error) {
      this.logger.error('LLM detection failed, using custom fallback:', error.message);
      return this.getCustomAppType(prompt);
    }
  }

  /**
   * Direct LLM matching - sends all app types
   */
  private async detectWithLLM(prompt: string): Promise<AppTypeDetectionResult | null> {
    // Create a condensed list of app types for the LLM
    // Format: "id: name - short description"
    const appTypeList = this.appTypeSummaries
      .map((app) => `${app.id}: ${app.name}`)
      .join('\n');

    const systemPrompt = `You are an app type classifier. Given a user's app idea, determine which app type best matches their request.

Available app types:
${appTypeList}

Respond with ONLY a JSON object in this exact format:
{"appTypeId": "the-app-type-id", "confidence": 0.95, "reasoning": "brief explanation"}

Rules:
- appTypeId must be exactly one of the IDs from the list above
- confidence should be between 0.0 and 1.0
- If no good match exists, use "custom" as appTypeId with low confidence
- Consider the user's intent, not just keywords
- Handle requests in any language`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: systemPrompt,
        responseFormat: 'json_object',
        temperature: 0.1, // Low temperature for consistent matching
        maxTokens: 200,
      });

      const result = JSON.parse(response);

      if (!result.appTypeId) {
        return null;
      }

      const appType = APP_TYPES_BY_ID.get(result.appTypeId);
      if (!appType && result.appTypeId !== 'custom') {
        this.logger.warn(`LLM returned unknown app type: ${result.appTypeId}`);
        return null;
      }

      return {
        appTypeId: result.appTypeId,
        appType: appType || this.createCustomAppType(prompt),
        method: 'ai',
        confidence: result.confidence || 0.8,
        matchedKeywords: [],
        reasoning: result.reasoning,
      };
    } catch (error) {
      this.logger.error('LLM app type detection failed:', error.message);
      return null;
    }
  }

  /**
   * Two-stage detection: first categorize, then match within category
   */
  private async detectWithTwoStage(prompt: string): Promise<AppTypeDetectionResult | null> {
    // Stage 1: Determine category
    const categories = Array.from(this.categorizedAppTypes.keys());
    const categoryPrompt = `You are classifying an app idea into a category.

Categories: ${categories.join(', ')}

User's app idea: "${prompt}"

Respond with ONLY a JSON object: {"category": "category-name", "confidence": 0.9}`;

    try {
      const categoryResponse = await this.aiService.generateText(categoryPrompt, {
        systemMessage: 'You are a precise app category classifier. Respond only with valid JSON.',
        responseFormat: 'json_object',
        temperature: 0.1,
        maxTokens: 100,
      });

      const categoryResult = JSON.parse(categoryResponse);
      const category = categoryResult.category;

      if (!this.categorizedAppTypes.has(category)) {
        return null;
      }

      // Stage 2: Match within category
      const categoryApps = this.categorizedAppTypes.get(category)!;
      const appTypeList = categoryApps
        .map((app) => `${app.id}: ${app.name} - ${app.description}`)
        .join('\n');

      const matchPrompt = `Given this app idea: "${prompt}"

Which of these ${category} app types is the best match?

${appTypeList}

Respond with ONLY JSON: {"appTypeId": "id", "confidence": 0.9, "reasoning": "why"}`;

      const matchResponse = await this.aiService.generateText(matchPrompt, {
        systemMessage: 'You are a precise app type matcher. Respond only with valid JSON.',
        responseFormat: 'json_object',
        temperature: 0.1,
        maxTokens: 200,
      });

      const matchResult = JSON.parse(matchResponse);
      const appType = APP_TYPES_BY_ID.get(matchResult.appTypeId);

      if (!appType) {
        return null;
      }

      return {
        appTypeId: matchResult.appTypeId,
        appType,
        method: 'ai',
        confidence: matchResult.confidence * categoryResult.confidence, // Combined confidence
        matchedKeywords: [],
        reasoning: `Category: ${category}. ${matchResult.reasoning}`,
      };
    } catch (error) {
      this.logger.error('Two-stage detection failed:', error.message);
      return null;
    }
  }

  /**
   * Create custom app type for unmatched prompts
   */
  private getCustomAppType(prompt: string): AppTypeDetectionResult {
    return {
      appTypeId: 'custom',
      appType: this.createCustomAppType(prompt),
      method: 'ai',
      confidence: 0.3,
      matchedKeywords: [],
      reasoning: 'No matching app type found, using custom template',
    };
  }

  private createCustomAppType(prompt: string): AppTypeDefinition {
    return {
      id: 'custom',
      name: 'Custom Application',
      category: 'custom',
      description: prompt,
      keywords: [],
      synonyms: [],
      sections: [
        {
          id: 'frontend',
          name: 'Frontend',
          enabled: true,
          basePath: '/',
          layout: 'public',
        },
        {
          id: 'admin',
          name: 'Admin',
          enabled: true,
          basePath: '/admin',
          requiredRole: 'admin',
          layout: 'admin',
        },
      ],
      roles: [
        {
          id: 'admin',
          name: 'Administrator',
          level: 100,
          isDefault: false,
          accessibleSections: ['frontend', 'admin'],
          defaultRoute: '/admin',
        },
        {
          id: 'user',
          name: 'User',
          level: 10,
          isDefault: true,
          accessibleSections: ['frontend'],
          defaultRoute: '/',
        },
      ],
      defaultFeatures: ['user-auth'],
      optionalFeatures: [],
      requiresAuth: true,
      requiresPayment: false,
      multiTenant: false,
      complexity: 'medium',
      defaultColorScheme: 'blue',
      defaultDesignVariant: 'minimal',
      examplePrompts: [],
    };
  }
}
