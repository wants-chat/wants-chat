/**
 * Qdrant-based App Type Detector Service
 *
 * Uses pre-computed embeddings stored in Qdrant for fast, multi-language app type detection.
 *
 * Benefits:
 * - NO expensive startup cost (embeddings are pre-stored in Qdrant)
 * - Only 1 embedding API call per detection
 * - Works for ANY language (semantic matching)
 * - Fast vector search (~10ms)
 *
 * Setup: Run `npx ts-node scripts/seed-app-type-embeddings.ts` once to populate Qdrant
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { QdrantService } from '../../qdrant/qdrant.service';
import {
  AppTypeDefinition,
  AppTypeDetectionResult,
} from '../interfaces/app-type.interface';
import { APP_TYPES_BY_ID } from '../registries/app-types/index';

const COLLECTION_NAME = 'app-types';
const VECTOR_SIZE = 1536; // text-embedding-3-small

@Injectable()
export class QdrantAppTypeDetectorService implements OnModuleInit {
  private readonly logger = new Logger(QdrantAppTypeDetectorService.name);
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  constructor(
    private readonly aiService: AiService,
    private readonly qdrantService: QdrantService,
  ) {}

  async onModuleInit() {
    // Initialize in background but store promise so detect() can wait
    this.initPromise = this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    // Wait for Qdrant to be ready (with 10s timeout)
    const qdrantReady = await this.qdrantService.waitForInit(10000);
    if (!qdrantReady) {
      if (!this.qdrantService.isHostConfigured()) {
        this.logger.warn('QDRANT_HOST not configured - falling back to keyword matching');
      }
      return;
    }

    try {
      const info = await this.qdrantService.getCollectionInfo(COLLECTION_NAME);
      if (!info || info.points === 0) {
        this.logger.warn(
          `Collection "${COLLECTION_NAME}" not found or empty. Run: npx ts-node scripts/seed-app-type-embeddings.ts`,
        );
        return;
      }

      this.isReady = true;
      this.logger.log(`✅ Qdrant app type detector ready (${info.points} app types indexed)`);
    } catch (err) {
      this.logger.warn(`Failed to initialize Qdrant app type detector: ${err.message}`);
    }
  }

  /**
   * Check if detector is ready
   */
  isInitialized(): boolean {
    return this.isReady;
  }

  /**
   * Wait for initialization to complete (max 10s)
   */
  async waitForInit(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.isReady;
  }

  /**
   * Detect app type using Qdrant vector search
   * Only 1 embedding API call per detection!
   */
  async detect(prompt: string): Promise<AppTypeDetectionResult> {
    // Wait for initialization if not ready yet (first request may wait)
    if (!this.isReady && this.initPromise) {
      await this.initPromise;
    }

    if (!this.isReady) {
      return this.getCustomAppType(prompt, 'Qdrant not ready');
    }

    try {
      // Generate embedding for user prompt (1 API call)
      const promptEmbedding = await this.aiService.generateEmbedding(prompt);

      // Search in Qdrant (fast, ~10ms)
      const results = await this.qdrantService.searchVectors(
        COLLECTION_NAME,
        promptEmbedding,
        5, // Get top 5 matches
        0.3, // Minimum score threshold
      );

      if (results.length === 0) {
        return this.getCustomAppType(prompt, 'No matches found');
      }

      // Get best match
      const topMatch = results[0];
      const appTypeId = topMatch.payload?.id as string;
      const appType = APP_TYPES_BY_ID.get(appTypeId);

      if (!appType) {
        this.logger.warn(`App type not found in registry: ${appTypeId}`);
        return this.getCustomAppType(prompt, `App type ${appTypeId} not in registry`);
      }

      // Convert score (0-1) to confidence
      const confidence = Math.min(topMatch.score * 1.1, 0.99);

      this.logger.log(
        `Detected "${appType.name}" (${(confidence * 100).toFixed(0)}% confidence) for: "${prompt.substring(0, 50)}..."`,
      );

      // Get alternates
      const alternates: AppTypeDetectionResult[] = results.slice(1, 4).map((r) => {
        const altAppType = APP_TYPES_BY_ID.get(r.payload?.id as string);
        return {
          appTypeId: r.payload?.id as string,
          appType: altAppType!,
          method: 'embedding' as const,
          confidence: Math.min(r.score * 1.1, 0.99),
          matchedKeywords: [],
        };
      }).filter((a) => a.appType);

      return {
        appTypeId,
        appType,
        method: 'embedding',
        confidence,
        matchedKeywords: [],
        reasoning: `Semantic similarity: ${(topMatch.score * 100).toFixed(0)}%`,
        alternates,
      };
    } catch (error) {
      this.logger.error('Qdrant detection failed:', error.message);
      return this.getCustomAppType(prompt, error.message);
    }
  }

  /**
   * Get custom app type for unmatched prompts
   */
  private getCustomAppType(prompt: string, reason: string): AppTypeDetectionResult {
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
      reasoning: reason,
    };
  }
}
