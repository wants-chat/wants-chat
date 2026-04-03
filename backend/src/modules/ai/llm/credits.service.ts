/**
 * Credits Service
 * Handles user credit balances, transactions, and quota enforcement
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PoolClient } from 'pg';
import {
  UserQuota,
  UsageLogEntry,
  CreditTransaction,
  CreditTransactionType,
  LLMError,
  ModelTier,
} from './types';
import {
  DynamicLLMConfigService,
  DEFAULT_SUBSCRIPTION_TIERS,
  formatCredits,
} from './dynamic-config';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => DynamicLLMConfigService))
    private readonly dynamicConfig: DynamicLLMConfigService,
  ) {}

  /**
   * Get user's current credit balance and quota
   */
  async getUserQuota(userId: string): Promise<UserQuota> {
    const client = await this.db.getClient();
    try {
      // Get or create user credits
      let creditsResult = await client.query(
        `SELECT * FROM user_credits WHERE user_id = $1`,
        [userId],
      );

      if (creditsResult.rows.length === 0) {
        // Create initial credits for new user
        await this.initializeUserCredits(userId, client);
        creditsResult = await client.query(
          `SELECT * FROM user_credits WHERE user_id = $1`,
          [userId],
        );
      }

      const credits = creditsResult.rows[0];

      // Get user's subscription
      const subResult = await client.query(
        `SELECT us.*, sp.*
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.user_id = $1 AND us.status = 'active'
         ORDER BY us.created_at DESC
         LIMIT 1`,
        [userId],
      );

      // Default to free plan if no subscription
      let plan = DEFAULT_SUBSCRIPTION_TIERS.find(p => p.slug === 'free')!;
      if (subResult.rows.length > 0) {
        const sub = subResult.rows[0];
        plan = {
          name: sub.name,
          slug: sub.slug,
          monthlyPrice: sub.price_monthly,
          yearlyPrice: sub.price_yearly,
          includedCredits: parseInt(sub.included_credits) || 0,
          dailyRequestLimit: sub.max_requests_per_day,
          maxTokensPerRequest: sub.max_tokens_per_request,
          allowedTiers: sub.allowed_model_tiers || ['free', 'standard'],
          features: sub.features || [],
        };
      }

      // Get today's usage
      const usageResult = await client.query(
        `SELECT
           COUNT(*) as request_count,
           COALESCE(SUM(total_tokens), 0) as total_tokens
         FROM llm_usage_logs
         WHERE user_id = $1
           AND created_at >= CURRENT_DATE
           AND status = 'success'`,
        [userId],
      );

      const usage = usageResult.rows[0];

      // Calculate total balance (included + purchased)
      const totalBalance =
        BigInt(credits.included_balance || 0) +
        BigInt(credits.purchased_balance || 0);

      return {
        userId,
        balance: Number(totalBalance),
        includedBalance: parseInt(credits.included_balance) || 0,
        purchasedBalance: parseInt(credits.purchased_balance) || 0,
        planId: subResult.rows[0]?.plan_id,
        allowedModelTiers: plan.allowedTiers as ModelTier[],
        maxRequestsPerDay: plan.dailyRequestLimit || undefined,
        maxTokensPerRequest: plan.maxTokensPerRequest || undefined,
        requestsToday: parseInt(usage.request_count) || 0,
        tokensToday: parseInt(usage.total_tokens) || 0,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Initialize credits for a new user
   */
  private async initializeUserCredits(
    userId: string,
    client?: PoolClient,
  ): Promise<void> {
    const conn = client || (await this.db.getClient());
    const shouldRelease = !client;

    try {
      // Check for free plan
      const freePlan = DEFAULT_SUBSCRIPTION_TIERS.find(p => p.slug === 'free');
      const initialCredits = freePlan?.includedCredits || 1000000; // $1 default

      await conn.query(
        `INSERT INTO user_credits (user_id, balance, included_balance, included_balance_reset_at)
         VALUES ($1, $2, $2, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, initialCredits],
      );

      // Log the bonus
      await this.logTransaction(
        {
          userId,
          type: 'bonus',
          amount: initialCredits,
          balanceAfter: initialCredits,
          description: 'Welcome bonus credits',
        },
        conn,
      );

      this.logger.log(
        `Initialized credits for user ${userId}: ${formatCredits(initialCredits)}`,
      );
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  /**
   * Check if user has sufficient credits and quota for a request
   */
  async checkQuota(
    userId: string,
    modelId: string,
    estimatedCost: number,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const quota = await this.getUserQuota(userId);

    // Check model tier access
    const model = this.dynamicConfig.getModel(modelId);
    if (!model) {
      return { allowed: false, reason: 'Model not found' };
    }

    if (!quota.allowedModelTiers.includes(model.tier)) {
      return {
        allowed: false,
        reason: `Your plan does not include access to ${model.tier} tier models. Please upgrade to use ${model.name}.`,
      };
    }

    // Check daily request limit
    if (quota.maxRequestsPerDay && quota.requestsToday >= quota.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: `You've reached your daily limit of ${quota.maxRequestsPerDay} requests. Upgrade your plan for more.`,
      };
    }

    // Check credit balance
    if (quota.balance < estimatedCost) {
      return {
        allowed: false,
        reason: `Insufficient credits. You have ${formatCredits(quota.balance)}, but this request may cost up to ${formatCredits(estimatedCost)}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Deduct credits for usage
   */
  async deductCredits(
    userId: string,
    amount: number,
    usageLogId?: string,
  ): Promise<void> {
    if (amount <= 0) return;

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Get current balance
      const result = await client.query(
        `SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );

      if (result.rows.length === 0) {
        throw new LLMError(
          'User credits not found',
          'INSUFFICIENT_CREDITS',
          undefined,
          undefined,
          false,
        );
      }

      const credits = result.rows[0];
      let remainingDeduction = amount;

      // First deduct from included balance
      let newIncludedBalance = BigInt(credits.included_balance || 0);
      if (newIncludedBalance > 0) {
        const deductFromIncluded = BigInt(Math.min(
          Number(newIncludedBalance),
          remainingDeduction,
        ));
        newIncludedBalance -= deductFromIncluded;
        remainingDeduction -= Number(deductFromIncluded);
      }

      // Then deduct from purchased balance
      let newPurchasedBalance = BigInt(credits.purchased_balance || 0);
      if (remainingDeduction > 0) {
        newPurchasedBalance -= BigInt(remainingDeduction);
        if (newPurchasedBalance < 0n) {
          throw new LLMError(
            'Insufficient credits',
            'INSUFFICIENT_CREDITS',
            undefined,
            undefined,
            false,
          );
        }
      }

      const newTotalBalance = newIncludedBalance + newPurchasedBalance;
      const totalUsed = BigInt(credits.total_credits_used || 0) + BigInt(amount);

      // Update balance
      await client.query(
        `UPDATE user_credits
         SET included_balance = $2,
             purchased_balance = $3,
             balance = $4,
             total_credits_used = $5,
             updated_at = NOW()
         WHERE user_id = $1`,
        [
          userId,
          newIncludedBalance.toString(),
          newPurchasedBalance.toString(),
          newTotalBalance.toString(),
          totalUsed.toString(),
        ],
      );

      // Log the transaction
      await this.logTransaction(
        {
          userId,
          type: 'usage',
          amount: -amount,
          balanceAfter: Number(newTotalBalance),
          referenceType: 'usage_log',
          referenceId: usageLogId,
          description: `AI usage: ${formatCredits(amount)}`,
        },
        client,
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    description: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<void> {
    if (amount <= 0) return;

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Get or create credits
      let result = await client.query(
        `SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );

      if (result.rows.length === 0) {
        await this.initializeUserCredits(userId, client);
        result = await client.query(
          `SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE`,
          [userId],
        );
      }

      const credits = result.rows[0];

      // Determine which balance to add to
      const isIncluded = type === 'subscription_credit';
      let newIncludedBalance = BigInt(credits.included_balance || 0);
      let newPurchasedBalance = BigInt(credits.purchased_balance || 0);
      let newTotalPurchased = BigInt(credits.total_credits_purchased || 0);

      if (isIncluded) {
        newIncludedBalance += BigInt(amount);
      } else {
        newPurchasedBalance += BigInt(amount);
        if (type === 'purchase') {
          newTotalPurchased += BigInt(amount);
        }
      }

      const newTotalBalance = newIncludedBalance + newPurchasedBalance;

      // Update balance
      await client.query(
        `UPDATE user_credits
         SET included_balance = $2,
             purchased_balance = $3,
             balance = $4,
             total_credits_purchased = $5,
             updated_at = NOW()
         WHERE user_id = $1`,
        [
          userId,
          newIncludedBalance.toString(),
          newPurchasedBalance.toString(),
          newTotalBalance.toString(),
          newTotalPurchased.toString(),
        ],
      );

      // Log the transaction
      await this.logTransaction(
        {
          userId,
          type,
          amount,
          balanceAfter: Number(newTotalBalance),
          referenceType,
          referenceId,
          description,
        },
        client,
      );

      await client.query('COMMIT');

      this.logger.log(
        `Added ${formatCredits(amount)} credits to user ${userId} (${type})`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reset monthly included credits for subscription
   */
  async resetIncludedCredits(userId: string, planCredits: number): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );

      if (result.rows.length === 0) {
        await this.initializeUserCredits(userId, client);
      }

      const credits = result.rows[0] || { purchased_balance: 0 };
      const newTotalBalance = BigInt(planCredits) + BigInt(credits.purchased_balance || 0);

      await client.query(
        `UPDATE user_credits
         SET included_balance = $2,
             balance = $3,
             included_balance_reset_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, planCredits, newTotalBalance.toString()],
      );

      // Log the reset
      await this.logTransaction(
        {
          userId,
          type: 'subscription_credit',
          amount: planCredits,
          balanceAfter: Number(newTotalBalance),
          description: 'Monthly subscription credits',
        },
        client,
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log a usage entry
   */
  async logUsage(entry: UsageLogEntry): Promise<string> {
    const result = await this.db.query(
      `INSERT INTO llm_usage_logs (
         user_id, conversation_id, message_id,
         provider_id, model_id, model_name,
         input_tokens, output_tokens, total_tokens,
         input_cost, output_cost, total_cost,
         latency_ms, time_to_first_token_ms,
         request_type, is_streaming, status, error_message,
         metadata
       ) VALUES (
         $1, $2, $3,
         $4, $5, $6,
         $7, $8, $9,
         $10, $11, $12,
         $13, $14,
         $15, $16, $17, $18,
         $19
       ) RETURNING id`,
      [
        entry.userId,
        entry.conversationId || null,
        entry.messageId || null,
        entry.providerId,
        entry.modelId,
        entry.modelName,
        entry.inputTokens,
        entry.outputTokens,
        entry.totalTokens,
        entry.inputCost,
        entry.outputCost,
        entry.totalCost,
        entry.latencyMs || null,
        entry.timeToFirstTokenMs || null,
        entry.requestType,
        entry.isStreaming,
        entry.status,
        entry.errorMessage || null,
        JSON.stringify({}),
      ],
    );

    return result.rows[0].id;
  }

  /**
   * Log a credit transaction
   */
  private async logTransaction(
    transaction: CreditTransaction,
    client?: PoolClient,
  ): Promise<void> {
    const conn = client || { query: (text: string, params?: any[]) => this.db.query(text, params) };
    await conn.query(
      `INSERT INTO credit_transactions (
         user_id, type, amount, balance_after,
         reference_type, reference_id, description, metadata
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        transaction.userId,
        transaction.type,
        transaction.amount,
        transaction.balanceAfter,
        transaction.referenceType || null,
        transaction.referenceId || null,
        transaction.description || null,
        JSON.stringify({}),
      ],
    );
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<CreditTransaction[]> {
    const result = await this.db.query(
      `SELECT * FROM credit_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    return result.rows.map(row => ({
      userId: row.user_id,
      type: row.type,
      amount: parseInt(row.amount),
      balanceAfter: parseInt(row.balance_after),
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      description: row.description,
    }));
  }

  /**
   * Get user's usage statistics
   */
  async getUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    byModel: Record<string, { requests: number; tokens: number; cost: number }>;
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const end = endDate || new Date();

    const result = await this.db.query(
      `SELECT
         model_name,
         COUNT(*) as request_count,
         COALESCE(SUM(total_tokens), 0) as total_tokens,
         COALESCE(SUM(input_tokens), 0) as input_tokens,
         COALESCE(SUM(output_tokens), 0) as output_tokens,
         COALESCE(SUM(total_cost), 0) as total_cost,
         COALESCE(SUM(input_cost), 0) as input_cost,
         COALESCE(SUM(output_cost), 0) as output_cost
       FROM llm_usage_logs
       WHERE user_id = $1
         AND created_at >= $2
         AND created_at <= $3
         AND status = 'success'
       GROUP BY model_name`,
      [userId, start, end],
    );

    const byModel: Record<string, { requests: number; tokens: number; cost: number; inputTokens?: number; outputTokens?: number }> = {};
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const row of result.rows) {
      const requests = parseInt(row.request_count) || 0;
      const tokens = parseInt(row.total_tokens) || 0;
      const inputTokens = parseInt(row.input_tokens) || 0;
      const outputTokens = parseInt(row.output_tokens) || 0;
      let cost = parseInt(row.total_cost) || 0;

      // If cost is 0 but we have tokens, calculate the cost from token counts
      // This handles cases where streaming didn't provide cost data
      if (cost === 0 && tokens > 0 && row.model_name) {
        const model = this.dynamicConfig.getModel(row.model_name);
        if (!model) {
          // Try to find by display name
          const allModels = this.dynamicConfig.getAllModels();
          const foundModel = allModels.find(m => m.name === row.model_name);
          if (foundModel) {
            const calculatedCost = this.dynamicConfig.calculateCost(
              foundModel.id,
              inputTokens,
              outputTokens,
            );
            cost = calculatedCost.totalCost;
          }
        } else {
          const calculatedCost = this.dynamicConfig.calculateCost(
            model.id,
            inputTokens,
            outputTokens,
          );
          cost = calculatedCost.totalCost;
        }
      }

      byModel[row.model_name] = { requests, tokens, cost, inputTokens, outputTokens };
      totalRequests += requests;
      totalTokens += tokens;
      totalCost += cost;
    }

    return {
      totalRequests,
      totalTokens,
      totalCost,
      byModel,
    };
  }

  /**
   * Get combined AI usage statistics (LLM + Media)
   */
  async getCombinedUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
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
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get LLM usage
    const llmStats = await this.getUsageStats(userId, start, end);

    // Get Media usage
    let mediaStats = {
      totalOperations: 0,
      totalCost: 0,
      byType: {} as Record<string, { count: number; cost: number }>,
    };

    try {
      const mediaResult = await this.db.query(
        `SELECT
           operation_type,
           COUNT(*) as operation_count,
           COALESCE(SUM(calculated_cost), 0) as total_cost
         FROM media_usage_logs
         WHERE user_id = $1
           AND created_at >= $2
           AND created_at <= $3
           AND status = 'success'
         GROUP BY operation_type`,
        [userId, start, end],
      );

      for (const row of mediaResult.rows) {
        const count = parseInt(row.operation_count) || 0;
        const cost = parseInt(row.total_cost) || 0;

        mediaStats.byType[row.operation_type] = { count, cost };
        mediaStats.totalOperations += count;
        mediaStats.totalCost += cost;
      }
    } catch (error) {
      // Media table might not exist yet
      this.logger.warn('Could not fetch media usage stats:', error.message);
    }

    return {
      llm: llmStats,
      media: mediaStats,
      combined: {
        totalOperations: llmStats.totalRequests + mediaStats.totalOperations,
        totalCost: llmStats.totalCost + mediaStats.totalCost,
      },
    };
  }
}
