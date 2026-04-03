/**
 * Embedding-based App Type Detector Service
 *
 * Uses vector embeddings for semantic matching.
 * - Efficient: No LLM tokens for detection
 * - Fast: Vector similarity search
 * - Multi-language: Embedding models support 100+ languages
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  AppTypeDefinition,
  AppTypeDetectionResult,
} from '../interfaces/app-type.interface';
import { ALL_APP_TYPES, APP_TYPES_BY_ID } from '../registries/app-types/index';

interface AppTypeEmbedding {
  id: string;
  name: string;
  embedding: number[];
}

@Injectable()
export class EmbeddingAppTypeDetectorService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingAppTypeDetectorService.name);
  private appTypeEmbeddings: AppTypeEmbedding[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly aiService: AiService) {}

  async onModuleInit() {
    // Start initialization in background
    this.initPromise = this.initializeEmbeddings();
  }

  /**
   * Initialize embeddings for all app types
   * This is done once at startup
   */
  private async initializeEmbeddings(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.logger.log(`Initializing embeddings for ${ALL_APP_TYPES.length} app types...`);

      // Create searchable text for each app type
      const texts = ALL_APP_TYPES.map((app) => {
        // Combine name, description, and top keywords for better matching
        const keywords = app.keywords.slice(0, 5).join(', ');
        return `${app.name}: ${app.description}. Keywords: ${keywords}`;
      });

      // Generate embeddings in batches to avoid rate limits
      const batchSize = 100;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const embeddings = await this.aiService.generateEmbeddings(batch);
        allEmbeddings.push(...embeddings);

        if (i + batchSize < texts.length) {
          this.logger.debug(`Generated embeddings for ${i + batchSize}/${texts.length} app types`);
        }
      }

      // Store embeddings with app type info
      this.appTypeEmbeddings = ALL_APP_TYPES.map((app, index) => ({
        id: app.id,
        name: app.name,
        embedding: allEmbeddings[index],
      }));

      this.isInitialized = true;
      this.logger.log(`✅ Initialized ${this.appTypeEmbeddings.length} app type embeddings`);
    } catch (error) {
      this.logger.error('Failed to initialize embeddings:', error.message);
      // Don't throw - we can fall back to keyword matching
    }
  }

  /**
   * Detect app type using embedding similarity
   */
  async detect(prompt: string): Promise<AppTypeDetectionResult> {
    // Wait for initialization if still in progress
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.isInitialized || this.appTypeEmbeddings.length === 0) {
      this.logger.warn('Embeddings not initialized, returning null for fallback');
      return this.getCustomAppType(prompt);
    }

    try {
      // Generate embedding for user prompt
      const promptEmbedding = await this.aiService.generateEmbedding(prompt);

      // Find most similar app types
      const similarities = this.appTypeEmbeddings.map((appType) => ({
        id: appType.id,
        name: appType.name,
        similarity: this.cosineSimilarity(promptEmbedding, appType.embedding),
      }));

      // Sort by similarity (highest first)
      similarities.sort((a, b) => b.similarity - a.similarity);

      // Get top match
      const topMatch = similarities[0];
      const appType = APP_TYPES_BY_ID.get(topMatch.id);

      if (!appType) {
        return this.getCustomAppType(prompt);
      }

      // Convert similarity (0-1) to confidence
      // Similarity of 0.8+ is very good, 0.6-0.8 is good, below 0.6 is weak
      const confidence = Math.min(topMatch.similarity * 1.2, 0.99);

      this.logger.log(
        `Detected "${topMatch.name}" (${(confidence * 100).toFixed(0)}% confidence) for prompt: "${prompt.substring(0, 50)}..."`,
      );

      // Log top 3 matches for debugging
      this.logger.debug(
        `Top 3 matches: ${similarities
          .slice(0, 3)
          .map((s) => `${s.name}(${(s.similarity * 100).toFixed(0)}%)`)
          .join(', ')}`,
      );

      return {
        appTypeId: topMatch.id,
        appType,
        method: 'embedding',
        confidence,
        matchedKeywords: [],
        reasoning: `Semantic similarity: ${(topMatch.similarity * 100).toFixed(0)}%`,
        alternates: similarities.slice(1, 4).map((s) => ({
          appTypeId: s.id,
          appType: APP_TYPES_BY_ID.get(s.id)!,
          method: 'embedding' as const,
          confidence: Math.min(s.similarity * 1.2, 0.99),
          matchedKeywords: [],
        })),
      };
    } catch (error) {
      this.logger.error('Embedding detection failed:', error.message);
      return this.getCustomAppType(prompt);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Get custom app type for unmatched prompts
   */
  private getCustomAppType(prompt: string): AppTypeDetectionResult {
    const customAppType: AppTypeDefinition = {
      id: 'custom',
      name: 'Custom Application',
      category: 'custom',
      description: prompt,
      keywords: [],
      synonyms: [],
      sections: [
        { id: 'frontend', name: 'Frontend', enabled: true, basePath: '/', layout: 'public' },
        { id: 'admin', name: 'Admin', enabled: true, basePath: '/admin', requiredRole: 'admin', layout: 'admin' },
      ],
      roles: [
        { id: 'admin', name: 'Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin' },
        { id: 'user', name: 'User', level: 10, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

    return {
      appTypeId: 'custom',
      appType: customAppType,
      method: 'ai',
      confidence: 0.3,
      matchedKeywords: [],
      reasoning: 'No matching app type found, using custom template',
    };
  }

  /**
   * Check if embeddings are ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
