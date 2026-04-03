/**
 * Media Credits Service
 * Handles credit deduction for image, video, and audio AI operations
 *
 * Integrates with the main CreditsService for unified billing
 */

import { Injectable, Logger } from '@nestjs/common';
import { CreditsService } from './credits.service';
import {
  calculateImageCost,
  calculateVideoCost,
  calculateAudioCost,
  calculateUpscaleCost,
  calculateBackgroundRemovalCost,
  calculateEnhanceCost,
  DEFAULT_MEDIA_PRICING,
  PROFIT_MARGIN,
  formatCredits,
} from './dynamic-config';
import { DatabaseService } from '../../database/database.service';

export type MediaOperationType =
  | 'image_generation'
  | 'image_upscale'
  | 'image_enhance'
  | 'image_background_removal'
  | 'video_generation'
  | 'speech_to_text'
  | 'text_to_speech';

export interface MediaUsageLogEntry {
  userId: string;
  operationType: MediaOperationType;
  provider: string;            // 'runware', 'openai', etc.
  model?: string;              // Model used (if applicable)
  inputDetails: {
    prompt?: string;
    width?: number;
    height?: number;
    duration?: number;
    characters?: number;
    minutes?: number;
    count?: number;
    imageUrl?: string;         // For processing operations
    backgroundColor?: string;  // For background removal
    upscaleFactor?: number;    // For upscale operations
  };
  outputDetails?: {
    urls?: string[];
    fileSize?: number;
  };
  providerCost?: number;       // Cost returned by provider (if available)
  calculatedCost: number;      // Our calculated cost in microcents
  status: 'success' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class MediaCreditsService {
  private readonly logger = new Logger(MediaCreditsService.name);

  constructor(
    private readonly creditsService: CreditsService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Check if user has sufficient credits for a media operation
   */
  async checkQuota(
    userId: string,
    operationType: MediaOperationType,
    estimatedCost: number,
  ): Promise<{ allowed: boolean; reason?: string; balance?: number }> {
    const quota = await this.creditsService.getUserQuota(userId);

    if (quota.balance < estimatedCost) {
      return {
        allowed: false,
        reason: `Insufficient credits. You have ${formatCredits(quota.balance)}, but this operation costs ${formatCredits(estimatedCost)}.`,
        balance: quota.balance,
      };
    }

    // Check daily limits for free users
    if (quota.maxRequestsPerDay && quota.requestsToday >= quota.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: `You've reached your daily limit of ${quota.maxRequestsPerDay} requests. Upgrade your plan for more.`,
        balance: quota.balance,
      };
    }

    return { allowed: true, balance: quota.balance };
  }

  /**
   * Estimate cost for image generation
   */
  estimateImageCost(
    model: string = 'default',
    count: number = 1,
    width: number = 1024,
    height: number = 1024,
    isPurchasedCredits: boolean = false,
  ): number {
    // No profit margin on purchased credits
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateImageCost(model, count, width, height, margin);
  }

  /**
   * Estimate cost for video generation
   */
  estimateVideoCost(
    model: string = 'default',
    durationSeconds: number = 5,
    isPurchasedCredits: boolean = false,
  ): number {
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateVideoCost(model, durationSeconds, margin);
  }

  /**
   * Estimate cost for audio operations
   */
  estimateAudioCost(
    type: 'stt' | 'tts',
    amount: number,
    isPurchasedCredits: boolean = false,
  ): number {
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateAudioCost(type, amount, margin);
  }

  /**
   * Estimate cost for image upscale
   */
  estimateUpscaleCost(
    factor: 2 | 4 = 2,
    isPurchasedCredits: boolean = false,
  ): number {
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateUpscaleCost(factor, margin);
  }

  /**
   * Estimate cost for background removal
   */
  estimateBackgroundRemovalCost(
    isPurchasedCredits: boolean = false,
  ): number {
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateBackgroundRemovalCost(margin);
  }

  /**
   * Estimate cost for image enhancement
   */
  estimateEnhanceCost(
    isPurchasedCredits: boolean = false,
  ): number {
    const margin = isPurchasedCredits ? 0 : PROFIT_MARGIN;
    return calculateEnhanceCost(margin);
  }

  /**
   * Deduct credits for a media operation and log usage
   */
  async deductAndLog(entry: MediaUsageLogEntry): Promise<string> {
    const { userId, calculatedCost, operationType, status } = entry;

    // Only deduct for successful operations
    if (status === 'success' && calculatedCost > 0) {
      try {
        // First log the usage
        const logId = await this.logMediaUsage(entry);

        // Then deduct credits
        await this.creditsService.deductCredits(userId, calculatedCost, logId);

        this.logger.log(
          `Deducted ${formatCredits(calculatedCost)} from user ${userId} for ${operationType}`,
        );

        return logId;
      } catch (error: any) {
        this.logger.error(`Failed to deduct credits for ${operationType}:`, error.message);
        throw error;
      }
    } else {
      // Still log failed operations for tracking
      return await this.logMediaUsage(entry);
    }
  }

  /**
   * Log media usage to database
   */
  private async logMediaUsage(entry: MediaUsageLogEntry): Promise<string> {
    // Convert providerCost from dollars to microcents (integer)
    // providerCost is in dollars (e.g., 0.00923), database expects integer microcents
    const providerCostMicrocents = entry.providerCost
      ? Math.round(entry.providerCost * 1000000)
      : null;

    const result = await this.db.query(
      `INSERT INTO media_usage_logs (
         user_id, operation_type, provider, model,
         input_details, output_details,
         provider_cost, calculated_cost,
         status, error_message, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        entry.userId,
        entry.operationType,
        entry.provider,
        entry.model || null,
        JSON.stringify(entry.inputDetails),
        JSON.stringify(entry.outputDetails || {}),
        providerCostMicrocents,
        entry.calculatedCost,
        entry.status,
        entry.errorMessage || null,
        JSON.stringify(entry.metadata || {}),
      ],
    );

    return result.rows[0].id;
  }

  /**
   * Get user's media usage statistics
   */
  async getMediaUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalOperations: number;
    totalCost: number;
    byType: Record<MediaOperationType, { count: number; cost: number }>;
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const result = await this.db.query(
      `SELECT
         operation_type,
         COUNT(*) as operation_count,
         SUM(calculated_cost) as total_cost
       FROM media_usage_logs
       WHERE user_id = $1
         AND created_at >= $2
         AND created_at <= $3
         AND status = 'success'
       GROUP BY operation_type`,
      [userId, start, end],
    );

    const byType: Record<string, { count: number; cost: number }> = {};
    let totalOperations = 0;
    let totalCost = 0;

    for (const row of result.rows) {
      const count = parseInt(row.operation_count);
      const cost = parseInt(row.total_cost);

      byType[row.operation_type] = { count, cost };
      totalOperations += count;
      totalCost += cost;
    }

    return {
      totalOperations,
      totalCost,
      byType: byType as Record<MediaOperationType, { count: number; cost: number }>,
    };
  }

  /**
   * Get pricing information for display
   */
  getPricingInfo(): {
    image: {
      generation: { model: string; price: string }[];
      upscale: { factor: string; price: string }[];
      backgroundRemoval: string;
      enhance: string;
    };
    video: {
      generation: { model: string; pricePerSecond: string }[];
      minDuration: number;
      maxDuration: number;
    };
    audio: {
      speechToText: string;
      textToSpeech: string;
    };
    profitMargin: string;
  } {
    const formatPrice = (microcents: number) => `$${(microcents / 1000000).toFixed(4)}`;

    return {
      image: {
        generation: Object.entries(DEFAULT_MEDIA_PRICING.image.generation).map(([model, price]) => ({
          model,
          price: formatPrice(price),
        })),
        upscale: Object.entries(DEFAULT_MEDIA_PRICING.image.upscale).map(([factor, price]) => ({
          factor,
          price: formatPrice(price),
        })),
        backgroundRemoval: formatPrice(DEFAULT_MEDIA_PRICING.image.backgroundRemoval),
        enhance: formatPrice(DEFAULT_MEDIA_PRICING.image.enhance),
      },
      video: {
        generation: Object.entries(DEFAULT_MEDIA_PRICING.video.generation).map(([model, price]) => ({
          model,
          pricePerSecond: formatPrice(price),
        })),
        minDuration: DEFAULT_MEDIA_PRICING.video.minDuration,
        maxDuration: DEFAULT_MEDIA_PRICING.video.maxDuration,
      },
      audio: {
        speechToText: `${formatPrice(DEFAULT_MEDIA_PRICING.audio.speechToText)}/minute`,
        textToSpeech: `${formatPrice(DEFAULT_MEDIA_PRICING.audio.textToSpeech)}/1K chars`,
      },
      profitMargin: `${(PROFIT_MARGIN * 100).toFixed(0)}%`,
    };
  }
}
