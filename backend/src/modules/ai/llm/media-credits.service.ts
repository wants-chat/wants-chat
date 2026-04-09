// NOTE: This is a no-op stub. The credits/billing system was removed for OSS.
// All quota checks pass; cost estimation returns 0; nothing is logged to the DB.
/**
 * Media Credits Service (No-op stub)
 *
 * In the original (paid) build this service handled credit deduction and
 * usage logging for image, video, and audio AI operations. The OSS build
 * has no billing, so every method here returns a permissive value or a
 * no-op result. The class is kept (rather than deleted) so the existing
 * call sites in `ai-generation.controller.ts` continue to compile and
 * run without modification.
 */

import { Injectable, Logger } from '@nestjs/common';
import { CreditsService } from './credits.service';
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
  provider: string;
  model?: string;
  inputDetails: {
    prompt?: string;
    width?: number;
    height?: number;
    duration?: number;
    characters?: number;
    minutes?: number;
    count?: number;
    imageUrl?: string;
    backgroundColor?: string;
    upscaleFactor?: number;
  };
  outputDetails?: {
    urls?: string[];
    fileSize?: number;
  };
  providerCost?: number;
  calculatedCost: number;
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
  ) {
    void this.creditsService;
    void this.db;
  }

  async checkQuota(
    _userId: string,
    _operationType: MediaOperationType,
    _estimatedCost: number,
  ): Promise<{ allowed: boolean; reason?: string; balance?: number }> {
    return { allowed: true, balance: Number.MAX_SAFE_INTEGER };
  }

  estimateImageCost(
    _model: string = 'default',
    _count: number = 1,
    _width: number = 1024,
    _height: number = 1024,
    _isPurchasedCredits: boolean = false,
  ): number {
    return 0;
  }

  estimateVideoCost(
    _model: string = 'default',
    _durationSeconds: number = 5,
    _isPurchasedCredits: boolean = false,
  ): number {
    return 0;
  }

  estimateAudioCost(
    _type: 'stt' | 'tts',
    _amount: number,
    _isPurchasedCredits: boolean = false,
  ): number {
    return 0;
  }

  estimateUpscaleCost(_factor: 2 | 4 = 2, _isPurchasedCredits: boolean = false): number {
    return 0;
  }

  estimateBackgroundRemovalCost(_isPurchasedCredits: boolean = false): number {
    return 0;
  }

  estimateEnhanceCost(_isPurchasedCredits: boolean = false): number {
    return 0;
  }

  async deductAndLog(_entry: MediaUsageLogEntry): Promise<string> {
    return 'noop-' + Date.now();
  }

  async getMediaUsageStats(
    _userId: string,
    _startDate?: Date,
    _endDate?: Date,
  ): Promise<{
    totalOperations: number;
    totalCost: number;
    byType: Record<MediaOperationType, { count: number; cost: number }>;
  }> {
    return {
      totalOperations: 0,
      totalCost: 0,
      byType: {} as Record<MediaOperationType, { count: number; cost: number }>,
    };
  }

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
  } {
    return {
      image: {
        generation: [],
        upscale: [],
        backgroundRemoval: 'free',
        enhance: 'free',
      },
      video: {
        generation: [],
        minDuration: 0,
        maxDuration: 0,
      },
      audio: {
        speechToText: 'free',
        textToSpeech: 'free',
      },
    };
  }
}
