/**
 * Billing Controller
 * Handles credit purchases, subscription management, and usage reporting
 */

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CreditsService } from './credits.service';
import { LLMRouterService } from './llm-router.service';
import {
  DEFAULT_SUBSCRIPTION_TIERS,
  DEFAULT_CREDIT_PACKAGES,
  formatCredits,
} from './dynamic-config';

interface AuthenticatedRequest extends Request {
  user: { sub: string; userId?: string };
}

@Controller('billing')
@UseGuards(AuthGuard)
export class BillingController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly llmRouterService: LLMRouterService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get user's credit balance and quota
   */
  @Get('credits')
  async getCredits(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const quota = await this.creditsService.getUserQuota(userId);

    return {
      data: {
        balance: quota.balance,
        balanceFormatted: formatCredits(quota.balance),
        includedBalance: quota.includedBalance,
        includedBalanceFormatted: formatCredits(quota.includedBalance),
        purchasedBalance: quota.purchasedBalance,
        purchasedBalanceFormatted: formatCredits(quota.purchasedBalance),
        allowedModelTiers: quota.allowedModelTiers,
        maxRequestsPerDay: quota.maxRequestsPerDay,
        maxTokensPerRequest: quota.maxTokensPerRequest,
        usage: {
          requestsToday: quota.requestsToday,
          tokensToday: quota.tokensToday,
        },
      },
    };
  }

  /**
   * Get user's transaction history
   */
  @Get('transactions')
  async getTransactions(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const userId = req.user.sub || req.user.userId;
    const transactions = await this.creditsService.getTransactionHistory(
      userId,
      parseInt(limit),
      parseInt(offset),
    );

    return {
      data: transactions.map(t => ({
        ...t,
        amountFormatted: formatCredits(Math.abs(t.amount)),
        balanceAfterFormatted: formatCredits(t.balanceAfter),
        isDebit: t.amount < 0,
      })),
    };
  }

  /**
   * Get usage statistics
   */
  @Get('usage')
  async getUsageStats(
    @Req() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const stats = await this.creditsService.getCombinedUsageStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    // Format media operation types to readable names
    const formatMediaType = (type: string): string => {
      const typeNames: Record<string, string> = {
        image_generation: 'Image Generation',
        image_upscale: 'Image Upscale',
        image_enhance: 'Image Enhance',
        image_background_removal: 'Background Removal',
        video_generation: 'Video Generation',
        speech_to_text: 'Speech to Text',
        text_to_speech: 'Text to Speech',
      };
      return typeNames[type] || type;
    };

    return {
      data: {
        // LLM (Chat) usage
        totalRequests: stats.llm.totalRequests,
        totalTokens: stats.llm.totalTokens,
        totalCost: stats.combined.totalCost,
        totalCostFormatted: formatCredits(stats.combined.totalCost),
        byModel: Object.entries(stats.llm.byModel).map(([model, data]) => ({
          model,
          requests: data.requests,
          tokens: data.tokens,
          cost: data.cost,
          costFormatted: formatCredits(data.cost),
        })),
        // Media usage (images, video, audio)
        media: {
          totalOperations: stats.media.totalOperations,
          totalCost: stats.media.totalCost,
          totalCostFormatted: formatCredits(stats.media.totalCost),
          byType: Object.entries(stats.media.byType).map(([type, data]) => ({
            type,
            displayName: formatMediaType(type),
            count: data.count,
            cost: data.cost,
            costFormatted: formatCredits(data.cost),
          })),
        },
        // Combined totals
        combined: {
          totalOperations: stats.combined.totalOperations,
          totalCost: stats.combined.totalCost,
          totalCostFormatted: formatCredits(stats.combined.totalCost),
        },
      },
    };
  }

  /**
   * Get available LLM models
   */
  @Get('models')
  async getModels(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const quota = await this.creditsService.getUserQuota(userId);
    const availableModels = this.llmRouterService.getAvailableModels();

    return {
      data: availableModels.map(model => ({
        modelId: model.id,
        displayName: model.name,
        description: model.description,
        provider: model.provider,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutput,
        costPer1MInput: model.inputPrice,
        costPer1MInputFormatted: formatCredits(model.inputPrice),
        costPer1MOutput: model.outputPrice,
        costPer1MOutputFormatted: formatCredits(model.outputPrice),
        supportsVision: model.supportsVision,
        supportsFunctionCalling: true, // All OpenRouter models support this
        supportsStreaming: model.supportsStreaming,
        supportsJsonMode: model.supportsJson,
        category: model.category,
        tier: model.tier,
        isDefault: model.isDefault,
        isAccessible: quota.allowedModelTiers.includes(model.tier),
      })),
    };
  }

  /**
   * Get available providers
   */
  @Get('providers')
  async getProviders() {
    const availableProviders = this.llmRouterService.getAvailableProviders();
    const allModels = this.llmRouterService.getAvailableModels();

    // Map provider slugs to display names
    const providerNames: Record<string, string> = {
      openrouter: 'OpenRouter',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      deepseek: 'DeepSeek',
    };

    return {
      data: availableProviders.map(providerSlug => ({
        name: providerNames[providerSlug] || providerSlug,
        slug: providerSlug,
        isActive: true,
        modelCount: allModels.filter(m => m.provider === providerSlug).length,
      })),
    };
  }

  /**
   * Get subscription plans
   */
  @Get('plans')
  async getPlans() {
    return {
      data: DEFAULT_SUBSCRIPTION_TIERS.filter(p => p.slug !== 'enterprise').map(plan => ({
        name: plan.name,
        slug: plan.slug,
        priceMonthly: plan.monthlyPrice,
        priceMonthlyFormatted: `$${(plan.monthlyPrice / 100).toFixed(2)}`,
        priceYearly: plan.yearlyPrice,
        priceYearlyFormatted: `$${(plan.yearlyPrice / 100).toFixed(2)}`,
        includedCredits: plan.includedCredits,
        includedCreditsFormatted: formatCredits(plan.includedCredits),
        maxRequestsPerDay: plan.dailyRequestLimit,
        maxTokensPerRequest: plan.maxTokensPerRequest,
        allowedModelTiers: plan.allowedTiers,
        features: plan.features,
      })),
    };
  }

  /**
   * Get credit packages for top-up
   */
  @Get('packages')
  async getPackages() {
    return {
      data: DEFAULT_CREDIT_PACKAGES.filter(p => p.credits > 0).map(pkg => ({
        name: pkg.name,
        creditAmount: pkg.credits,
        creditAmountFormatted: formatCredits(pkg.credits),
        price: pkg.price,
        priceFormatted: `$${(pkg.price / 100).toFixed(2)}`,
        bonusAmount: pkg.bonus,
        bonusAmountFormatted: formatCredits(pkg.bonus),
        totalCredits: pkg.credits + pkg.bonus,
        totalCreditsFormatted: formatCredits(pkg.credits + pkg.bonus),
        isPopular: pkg.isPopular,
      })),
    };
  }

  /**
   * Estimate cost for a request
   */
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  async estimateCost(
    @Body() body: { modelId: string; inputText: string; estimatedOutputTokens?: number },
  ) {
    const estimate = this.llmRouterService.estimateCost(
      body.modelId,
      body.inputText,
      body.estimatedOutputTokens || 1000,
    );

    return {
      data: {
        inputCost: estimate.inputCost,
        inputCostFormatted: formatCredits(estimate.inputCost),
        outputCost: estimate.outputCost,
        outputCostFormatted: formatCredits(estimate.outputCost),
        totalCost: estimate.totalCost,
        totalCostFormatted: formatCredits(estimate.totalCost),
      },
    };
  }

  /**
   * Check if user can make a request with a specific model
   */
  @Post('check-quota')
  @HttpCode(HttpStatus.OK)
  async checkQuota(
    @Req() req: AuthenticatedRequest,
    @Body() body: { modelId: string; estimatedCost?: number },
  ) {
    const userId = req.user.sub || req.user.userId;
    const estimatedCost = body.estimatedCost || 100000; // Default ~$0.10

    const result = await this.creditsService.checkQuota(
      userId,
      body.modelId,
      estimatedCost,
    );

    return {
      data: result,
    };
  }

  /**
   * Add bonus credits (admin only - for testing)
   */
  @Post('add-credits')
  @HttpCode(HttpStatus.OK)
  async addCredits(
    @Req() req: AuthenticatedRequest,
    @Body() body: { amount: number; reason?: string },
  ) {
    const userId = req.user.sub || req.user.userId;

    // In production, this should be admin-only
    // For now, allow adding test credits
    await this.creditsService.addCredits(
      userId,
      body.amount,
      'bonus',
      body.reason || 'Manual credit addition',
    );

    const quota = await this.creditsService.getUserQuota(userId);

    return {
      data: {
        message: `Added ${formatCredits(body.amount)} credits`,
        newBalance: quota.balance,
        newBalanceFormatted: formatCredits(quota.balance),
      },
    };
  }
}
