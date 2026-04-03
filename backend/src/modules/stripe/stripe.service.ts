/**
 * Stripe Service for Wants
 * Handles subscription billing, payments, and credit top-ups
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { DynamicLLMConfigService } from '../ai/llm/dynamic-config';
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in cents
  priceYearly: number; // in cents
  priceIdMonthly: string;
  priceIdYearly: string;
  includedCredits: number; // microcents
  maxRequestsPerDay: number | null;
  maxTokensPerRequest: number | null;
  allowedModelTiers: string[];
  features: string[];
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  creditAmount: number; // microcents
  price: number; // cents
  bonusAmount: number; // microcents
  isPopular: boolean;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  readonly plans: Record<string, SubscriptionPlan>;
  readonly creditPackages: CreditPackage[];

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    @Inject(forwardRef(() => DynamicLLMConfigService))
    private dynamicConfig: DynamicLLMConfigService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-12-15.clover',
      });
    }

    // Define subscription plans
    this.plans = {
      free: {
        id: 'free',
        name: 'Free',
        description: 'Experience everything we offer',
        priceMonthly: 0,
        priceYearly: 0,
        priceIdMonthly: '',
        priceIdYearly: '',
        includedCredits: 1000000, // $1 worth
        maxRequestsPerDay: 3,
        maxTokensPerRequest: 4096,
        allowedModelTiers: ['free', 'standard'],
        features: [
          '3 AI messages/day',
          'All 30+ AI models',
          '1000+ tools (3 pins max)',
          '3 image generations/month',
          '1 app project',
          'Limited workflows',
          'Community support',
        ],
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        description: 'For individuals who want more',
        priceMonthly: 1999, // $19.99
        priceYearly: 19999, // $199.99
        priceIdMonthly: this.configService.get('STRIPE_PRICE_PRO_MONTHLY') || '',
        priceIdYearly: this.configService.get('STRIPE_PRICE_PRO_YEARLY') || '',
        includedCredits: 20000000, // $20 worth
        maxRequestsPerDay: null, // 2500/month
        maxTokensPerRequest: 16384,
        allowedModelTiers: ['free', 'standard', 'premium'],
        features: [
          '2,500 AI messages/month',
          'All 30+ AI models',
          'Unlimited tool uses',
          '100 image generations/month',
          '10 video generations/month',
          'All export formats',
          'Basic workflows (50/mo)',
          'Priority support',
        ],
      },
      team: {
        id: 'team',
        name: 'Team',
        description: 'For teams & power users',
        priceMonthly: 4999, // $49.99
        priceYearly: 49999, // $499.99
        priceIdMonthly: this.configService.get('STRIPE_PRICE_TEAM_MONTHLY') || '',
        priceIdYearly: this.configService.get('STRIPE_PRICE_TEAM_YEARLY') || '',
        includedCredits: 60000000, // $60 worth
        maxRequestsPerDay: null, // unlimited
        maxTokensPerRequest: 32768,
        allowedModelTiers: ['free', 'standard', 'premium', 'enterprise'],
        features: [
          'Unlimited AI messages',
          'Unlimited image generation',
          '100 video generations/month',
          'No-code app builder',
          'Full workflow automation',
          '5 team members included',
          'API access',
          'Advanced analytics',
        ],
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For organizations at scale',
        priceMonthly: 14999, // $149.99
        priceYearly: 149999, // $1499.99
        priceIdMonthly: this.configService.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') || '',
        priceIdYearly: this.configService.get('STRIPE_PRICE_ENTERPRISE_YEARLY') || '',
        includedCredits: 100000000, // $100 worth
        maxRequestsPerDay: null,
        maxTokensPerRequest: null,
        allowedModelTiers: ['free', 'standard', 'premium', 'enterprise'],
        features: [
          'Everything unlimited',
          'Unlimited team members',
          'Custom AI model training',
          'SSO & SAML',
          'Dedicated account manager',
          'Custom integrations',
          '99.9% SLA guarantee',
          'On-premise deployment',
        ],
      },
    };

    // Define credit packages for top-up
    this.creditPackages = [
      {
        id: 'credits_5',
        name: '$5 Credits',
        description: 'Good for light usage',
        creditAmount: 5000000, // 5M microcents = $5
        price: 500, // $5 in cents
        bonusAmount: 0,
        isPopular: false,
      },
      {
        id: 'credits_10',
        name: '$10 Credits',
        description: 'Best value for regular users',
        creditAmount: 10000000,
        price: 1000,
        bonusAmount: 500000, // 5% bonus
        isPopular: true,
      },
      {
        id: 'credits_25',
        name: '$25 Credits',
        description: 'For power users',
        creditAmount: 25000000,
        price: 2500,
        bonusAmount: 2000000, // 8% bonus
        isPopular: false,
      },
      {
        id: 'credits_50',
        name: '$50 Credits',
        description: 'Best value package',
        creditAmount: 50000000,
        price: 5000,
        bonusAmount: 5000000, // 10% bonus
        isPopular: false,
      },
      {
        id: 'credits_100',
        name: '$100 Credits',
        description: 'For heavy users',
        creditAmount: 100000000,
        price: 10000,
        bonusAmount: 15000000, // 15% bonus
        isPopular: false,
      },
    ];
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    interval: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      const plan = this.plans[planId];
      if (!plan) {
        throw new Error('Invalid plan');
      }

      if (planId === 'free') {
        throw new Error('Cannot checkout for free plan');
      }

      const priceId = interval === 'monthly' ? plan.priceIdMonthly : plan.priceIdYearly;
      if (!priceId) {
        throw new Error('Price ID not configured for this plan');
      }

      // Get or create customer
      let customerId = await this.getStripeCustomerId(userId);

      if (!customerId) {
        const user = await this.getUserById(userId);
        const customer = await this.stripe.customers.create({
          email: user?.email,
          name: user?.name,
          metadata: { userId },
        });
        customerId = customer.id;
        await this.saveStripeCustomerId(userId, customerId);
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, planId },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for credit purchase
   */
  async createCreditCheckoutSession(
    userId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      const pkg = this.creditPackages.find(p => p.id === packageId);
      if (!pkg) {
        throw new Error('Invalid credit package');
      }

      // Get or create customer
      let customerId = await this.getStripeCustomerId(userId);

      if (!customerId) {
        const user = await this.getUserById(userId);
        const customer = await this.stripe.customers.create({
          email: user?.email,
          name: user?.name,
          metadata: { userId },
        });
        customerId = customer.id;
        await this.saveStripeCustomerId(userId, customerId);
      }

      // Create checkout session for one-time payment
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: pkg.name,
              description: pkg.description,
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          packageId,
          creditAmount: pkg.creditAmount.toString(),
          bonusAmount: pkg.bonusAmount.toString(),
        },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Failed to create credit checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(userId: string, returnUrl: string) {
    try {
      const customerId = await this.getStripeCustomerId(userId);

      if (!customerId) {
        throw new Error('No customer found');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Failed to create billing portal session:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    try {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      this.logger.log(`Webhook event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const packageId = session.metadata?.packageId;

    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    // Handle credit purchase
    if (packageId) {
      const creditAmount = parseInt(session.metadata?.creditAmount || '0');
      const bonusAmount = parseInt(session.metadata?.bonusAmount || '0');
      const totalCredits = creditAmount + bonusAmount;

      await this.addCreditsToUser(userId, totalCredits, 'purchase', `Credit purchase: ${packageId}`);
      this.logger.log(`Added ${totalCredits} credits to user ${userId}`);
      return;
    }

    // Handle subscription
    if (planId && session.subscription) {
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
      await this.updateUserSubscription(userId, planId, subscription);
    }
  }

  /**
   * Handle subscription update
   */
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const customer = await this.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) {
      this.logger.error('No userId in customer metadata');
      return;
    }

    const priceId = subscription.items.data[0].price.id;
    const planId = this.getPlanIdFromPriceId(priceId);

    await this.updateUserSubscription(userId, planId, subscription);
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customer = await this.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) return;

    // Downgrade to free
    await this.db.query(
      `UPDATE user_subscriptions
       SET plan_id = (SELECT id FROM subscription_plans WHERE slug = 'free'),
           status = 'canceled',
           stripe_subscription_id = NULL,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId],
    );
  }

  /**
   * Handle invoice paid - reset monthly credits
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) return;

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId as string);
    const customer = await this.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) return;

    // Get the plan's included credits and reset
    const priceId = subscription.items.data[0].price.id;
    const planId = this.getPlanIdFromPriceId(priceId);
    const plan = this.plans[planId];

    if (plan) {
      await this.resetMonthlyCredits(userId, plan.includedCredits);
    }
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription;
    if (!subscriptionId) return;

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId as string);
    const customer = await this.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    const userId = customer.metadata?.userId;

    if (!userId) return;

    // Set grace period
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

    await this.db.query(
      `UPDATE user_subscriptions SET status = 'past_due', metadata = metadata || $1, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify({ gracePeriodEnd: gracePeriodEnd.toISOString() }), userId],
    );
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string) {
    const result = await this.db.query(
      `SELECT us.*, sp.slug as plan_slug, sp.name as plan_name, sp.included_credits,
              sp.max_requests_per_day, sp.max_tokens_per_request, sp.allowed_model_tiers, sp.features
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      // Return free plan defaults
      return {
        plan: 'free',
        status: 'active',
        ...this.plans.free,
      };
    }

    const sub = result.rows[0];
    return {
      id: sub.id,
      plan: sub.plan_slug,
      planName: sub.plan_name,
      status: sub.status,
      interval: sub.metadata?.interval || 'monthly',
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      includedCredits: sub.included_credits,
      maxRequestsPerDay: sub.max_requests_per_day,
      maxTokensPerRequest: sub.max_tokens_per_request,
      allowedModelTiers: sub.allowed_model_tiers,
      features: sub.features,
    };
  }

  /**
   * Get user's credit balance
   */
  async getUserCredits(userId: string) {
    const result = await this.db.query(
      `SELECT * FROM user_credits WHERE user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      // Initialize credits for new user
      await this.initializeUserCredits(userId);
      return {
        balance: 1000000, // Free tier default
        includedBalance: 1000000,
        purchasedBalance: 0,
        lifetimeUsage: 0,
      };
    }

    const credits = result.rows[0];
    return {
      balance: credits.balance,
      includedBalance: credits.included_balance,
      purchasedBalance: credits.purchased_balance,
      lifetimeUsage: credits.lifetime_usage,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit = 50, offset = 0) {
    const result = await this.db.query(
      `SELECT * FROM credit_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    return result.rows.map(row => ({
      id: row.id,
      amount: row.amount,
      balanceAfter: row.balance_after,
      type: row.type,
      description: row.description,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get LLM usage
    const result = await this.db.query(
      `SELECT
         model_id,
         model_name,
         COUNT(*) as request_count,
         COALESCE(SUM(input_tokens), 0) as total_input_tokens,
         COALESCE(SUM(output_tokens), 0) as total_output_tokens,
         COALESCE(SUM(total_cost), 0) as total_cost,
         COALESCE(SUM(input_cost), 0) as total_input_cost,
         COALESCE(SUM(output_cost), 0) as total_output_cost,
         AVG(latency_ms) as avg_latency
       FROM llm_usage_logs
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 AND status = 'success'
       GROUP BY model_id, model_name`,
      [userId, start, end],
    );

    // Transform and calculate costs if needed
    const byModel = result.rows.map((row) => {
      const requestCount = parseInt(row.request_count) || 0;
      const totalInputTokens = parseInt(row.total_input_tokens) || 0;
      const totalOutputTokens = parseInt(row.total_output_tokens) || 0;
      let totalCost = parseInt(row.total_cost) || 0;
      const avgLatency = parseFloat(row.avg_latency) || 0;
      const modelId = row.model_id || row.model_name;

      // If cost is 0 but we have tokens, calculate the cost from token counts
      // This handles cases where streaming didn't provide cost data
      if (totalCost === 0 && (totalInputTokens > 0 || totalOutputTokens > 0)) {
        // Try to find the model by ID
        let model = this.dynamicConfig.getModel(modelId);

        // If not found, try to find by name
        if (!model && row.model_name) {
          const allModels = this.dynamicConfig.getAllModels();
          model = allModels.find(m => m.name === row.model_name || m.id.endsWith(modelId));
        }

        if (model) {
          const costs = this.dynamicConfig.calculateCost(
            model.id,
            totalInputTokens,
            totalOutputTokens,
          );
          totalCost = costs.totalCost;
        }
      }

      return {
        modelId,
        requestCount,
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        avgLatency,
      };
    });

    // Get media usage
    let mediaUsage: any[] = [];
    try {
      const mediaResult = await this.db.query(
        `SELECT
           operation_type,
           COUNT(*) as operation_count,
           COALESCE(SUM(calculated_cost), 0) as total_cost
         FROM media_usage_logs
         WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 AND status = 'success'
         GROUP BY operation_type`,
        [userId, start, end],
      );

      const mediaTypeNames: Record<string, string> = {
        image_generation: 'Image Generation',
        image_upscale: 'Image Upscale',
        image_enhance: 'Image Enhance',
        image_background_removal: 'Background Removal',
        video_generation: 'Video Generation',
        speech_to_text: 'Speech to Text',
        text_to_speech: 'Text to Speech',
      };

      mediaUsage = mediaResult.rows.map((row) => ({
        type: row.operation_type,
        displayName: mediaTypeNames[row.operation_type] || row.operation_type,
        count: parseInt(row.operation_count) || 0,
        cost: parseInt(row.total_cost) || 0,
      }));
    } catch (error) {
      // Media table might not exist yet
      this.logger.warn('Could not fetch media usage stats:', error.message);
    }

    // Calculate totals
    const llmTotals = byModel.reduce(
      (acc, model) => ({
        requests: acc.requests + model.requestCount,
        inputTokens: acc.inputTokens + model.totalInputTokens,
        outputTokens: acc.outputTokens + model.totalOutputTokens,
        cost: acc.cost + model.totalCost,
      }),
      { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 },
    );

    const mediaTotals = mediaUsage.reduce(
      (acc, item) => ({
        operations: acc.operations + item.count,
        cost: acc.cost + item.cost,
      }),
      { operations: 0, cost: 0 },
    );

    return {
      period: { start, end },
      byModel,
      totals: {
        requests: llmTotals.requests,
        inputTokens: llmTotals.inputTokens,
        outputTokens: llmTotals.outputTokens,
        cost: llmTotals.cost + mediaTotals.cost,
      },
      media: {
        byType: mediaUsage,
        totals: mediaTotals,
      },
    };
  }

  // Helper methods
  private getPlanIdFromPriceId(priceId: string): string {
    for (const [planId, plan] of Object.entries(this.plans)) {
      if (plan.priceIdMonthly === priceId || plan.priceIdYearly === priceId) {
        return planId;
      }
    }
    return 'free';
  }

  private async getStripeCustomerId(userId: string): Promise<string | null> {
    const result = await this.db.query(
      `SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0]?.stripe_customer_id || null;
  }

  private async saveStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, stripe_customer_id, status, current_period_start, current_period_end)
       VALUES ($1, (SELECT id FROM subscription_plans WHERE slug = 'free'), $2, 'active', NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = $2, updated_at = NOW()`,
      [userId, customerId],
    );
  }

  private async getUserById(userId: string): Promise<{ email?: string; name?: string } | null> {
    const result = await this.db.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  private async updateUserSubscription(userId: string, planId: string, subscription: Stripe.Subscription): Promise<void> {
    const plan = this.plans[planId];
    const interval = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';

    // Get period timestamps with fallbacks
    const now = Math.floor(Date.now() / 1000);
    const periodEnd = interval === 'yearly' ? now + (365 * 24 * 60 * 60) : now + (30 * 24 * 60 * 60);

    const currentPeriodStart = (subscription as any).current_period_start || now;
    const currentPeriodEnd = (subscription as any).current_period_end || periodEnd;

    this.logger.log(`Updating subscription for user ${userId}: plan=${planId}, interval=${interval}, start=${currentPeriodStart}, end=${currentPeriodEnd}`);

    await this.db.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, current_period_start, current_period_end, metadata)
       VALUES ($1, (SELECT id FROM subscription_plans WHERE slug = $2), $3, $4, $5, to_timestamp($6), to_timestamp($7), $8)
       ON CONFLICT (user_id) DO UPDATE SET
         plan_id = (SELECT id FROM subscription_plans WHERE slug = $2),
         stripe_subscription_id = $4,
         status = $5,
         current_period_start = to_timestamp($6),
         current_period_end = to_timestamp($7),
         metadata = $8,
         updated_at = NOW()`,
      [
        userId,
        planId,
        subscription.customer,
        subscription.id,
        subscription.status,
        currentPeriodStart,
        currentPeriodEnd,
        JSON.stringify({ interval }),
      ],
    );

    // Reset monthly credits
    await this.resetMonthlyCredits(userId, plan.includedCredits);
  }

  private async initializeUserCredits(userId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_credits (user_id, balance, included_balance, purchased_balance, lifetime_usage)
       VALUES ($1, 1000000, 1000000, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );
  }

  private async addCreditsToUser(userId: string, amount: number, type: string, description: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Update balance
      const result = await client.query(
        `UPDATE user_credits
         SET purchased_balance = purchased_balance + $1,
             balance = balance + $1,
             updated_at = NOW()
         WHERE user_id = $2
         RETURNING balance`,
        [amount, userId],
      );

      const newBalance = result.rows[0]?.balance || amount;

      // Log transaction
      await client.query(
        `INSERT INTO credit_transactions (user_id, amount, balance_after, type, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, amount, newBalance, type, description],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async resetMonthlyCredits(userId: string, includedCredits: number): Promise<void> {
    await this.db.query(
      `UPDATE user_credits
       SET included_balance = $1,
           balance = purchased_balance + $1,
           last_reset_at = NOW(),
           updated_at = NOW()
       WHERE user_id = $2`,
      [includedCredits, userId],
    );
  }
}
