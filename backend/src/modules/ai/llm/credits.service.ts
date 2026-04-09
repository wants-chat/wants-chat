// NOTE: This is a no-op stub. The credits/billing system was removed for OSS. All quota checks pass; no DB writes occur.
/**
 * Credits Service (No-op stub)
 * Original credit balance / quota enforcement has been removed for the OSS build.
 * Consumers still call these methods; they now always succeed and return permissive values.
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import {
  UserQuota,
  UsageLogEntry,
  CreditTransaction,
  CreditTransactionType,
  ModelTier,
} from './types';
import { DynamicLLMConfigService } from './dynamic-config';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => DynamicLLMConfigService))
    private readonly dynamicConfig: DynamicLLMConfigService,
  ) {
    // Keep references so TS doesn't complain about unused private fields.
    void this.db;
    void this.dynamicConfig;
  }

  async getUserQuota(userId: string): Promise<UserQuota> {
    return {
      userId,
      balance: Number.MAX_SAFE_INTEGER,
      includedBalance: Number.MAX_SAFE_INTEGER,
      purchasedBalance: 0,
      allowedModelTiers: ['free', 'standard', 'premium', 'enterprise'] as ModelTier[],
      maxRequestsPerDay: undefined,
      maxTokensPerRequest: undefined,
      requestsToday: 0,
      tokensToday: 0,
    };
  }

  async checkQuota(
    _userId: string,
    _modelId: string,
    _estimatedCost: number,
  ): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  async deductCredits(
    _userId: string,
    _amount: number,
    _usageLogId?: string,
  ): Promise<void> {
    return;
  }

  async addCredits(
    _userId: string,
    _amount: number,
    _type: CreditTransactionType,
    _description: string,
    _referenceType?: string,
    _referenceId?: string,
  ): Promise<void> {
    return;
  }

  async resetIncludedCredits(_userId: string, _planCredits: number): Promise<void> {
    return;
  }

  async logUsage(_entry: UsageLogEntry): Promise<string> {
    return 'noop-' + Date.now();
  }

  async getTransactionHistory(
    _userId: string,
    _limit: number = 50,
    _offset: number = 0,
  ): Promise<CreditTransaction[]> {
    return [];
  }

  async getUsageStats(
    _userId: string,
    _startDate?: Date,
    _endDate?: Date,
  ): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    byModel: Record<string, { requests: number; tokens: number; cost: number }>;
  }> {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byModel: {},
    };
  }

  async getCombinedUsageStats(
    _userId: string,
    _startDate?: Date,
    _endDate?: Date,
  ): Promise<{
    llm: {
      totalRequests: number;
      totalTokens: number;
      totalCost: number;
      byModel: Record<string, { requests: number; tokens: number; cost: number }>;
    };
    media: {
      totalOperations: number;
      totalCost: number;
      byType: Record<string, { count: number; cost: number }>;
    };
    combined: {
      totalOperations: number;
      totalCost: number;
    };
  }> {
    return {
      llm: { totalRequests: 0, totalTokens: 0, totalCost: 0, byModel: {} },
      media: { totalOperations: 0, totalCost: 0, byType: {} },
      combined: { totalOperations: 0, totalCost: 0 },
    };
  }
}
