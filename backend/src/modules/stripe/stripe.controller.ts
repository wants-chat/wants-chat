/**
 * Stripe Controller for Wants
 * Handles billing API endpoints
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Headers,
  HttpCode,
  UseGuards,
  Query,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StripeService } from './stripe.service';
import { DynamicLLMConfigService } from '../ai/llm/dynamic-config';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private dynamicConfig: DynamicLLMConfigService,
  ) {}

  /**
   * Get available subscription plans
   */
  @Get('plans')
  async getPlans() {
    return Object.values(this.stripeService.plans);
  }

  /**
   * Get available credit packages
   */
  @Get('packages')
  async getCreditPackages() {
    return this.stripeService.creditPackages;
  }

  /**
   * Get all available models (35 models from dynamic config)
   */
  @Get('models')
  async getModels() {
    const models = this.dynamicConfig.getAllModels();
    return models.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      provider: m.provider,
      tier: m.tier,
      category: m.category,
      contextWindow: m.contextWindow,
      maxOutputTokens: m.maxOutput,
      supportsVision: m.supportsVision,
      supportsStreaming: m.supportsStreaming,
      supportsJson: m.supportsJson,
      costPer1MInput: m.inputPrice,
      costPer1MOutput: m.outputPrice,
      isDefault: m.isDefault,
    }));
  }

  /**
   * Get models available to the current user based on subscription
   */
  @UseGuards(JwtAuthGuard)
  @Get('available-models')
  async getAvailableModels(@Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    const subscription = await this.stripeService.getUserSubscription(userId);
    const allowedTiers = subscription.allowedModelTiers;

    const models = this.dynamicConfig.getAllModels();
    return models
      .filter(m => allowedTiers.includes(m.tier))
      .map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        provider: m.provider,
        tier: m.tier,
        category: m.category,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutput,
        supportsVision: m.supportsVision,
        supportsStreaming: m.supportsStreaming,
        supportsJson: m.supportsJson,
        costPer1MInput: m.inputPrice,
        costPer1MOutput: m.outputPrice,
        isDefault: m.isDefault,
      }));
  }

  /**
   * Get current user's subscription
   */
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.stripeService.getUserSubscription(userId);
  }

  /**
   * Get current user's credit balance
   */
  @UseGuards(JwtAuthGuard)
  @Get('credits')
  async getCredits(@Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.stripeService.getUserCredits(userId);
  }

  /**
   * Get user's transaction history
   */
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.stripeService.getTransactionHistory(
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * Get user's usage statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.stripeService.getUsageStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Create checkout session for subscription
   */
  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  async createCheckoutSession(
    @Req() req: any,
    @Body() body: {
      planId: string;
      interval: 'monthly' | 'yearly';
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    const userId = req.user.sub || req.user.userId;

    if (!body.planId || !body.interval || !body.successUrl || !body.cancelUrl) {
      throw new BadRequestException('Missing required fields');
    }

    return this.stripeService.createCheckoutSession(
      userId,
      body.planId,
      body.interval,
      body.successUrl,
      body.cancelUrl,
    );
  }

  /**
   * Create checkout session for credit purchase
   */
  @UseGuards(JwtAuthGuard)
  @Post('credit-checkout')
  async createCreditCheckout(
    @Req() req: any,
    @Body() body: {
      packageId: string;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    const userId = req.user.sub || req.user.userId;

    if (!body.packageId || !body.successUrl || !body.cancelUrl) {
      throw new BadRequestException('Missing required fields');
    }

    return this.stripeService.createCreditCheckoutSession(
      userId,
      body.packageId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  /**
   * Create billing portal session
   */
  @UseGuards(JwtAuthGuard)
  @Post('billing-portal')
  async createBillingPortal(
    @Req() req: any,
    @Body() body: { returnUrl: string },
  ) {
    const userId = req.user.sub || req.user.userId;

    if (!body.returnUrl) {
      throw new BadRequestException('Missing returnUrl');
    }

    return this.stripeService.createBillingPortalSession(userId, body.returnUrl);
  }

  /**
   * Handle Stripe webhooks
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new BadRequestException('No raw body available');
    }

    try {
      const result = await this.stripeService.handleWebhook(signature, rawBody);
      res.json(result);
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
