/**
 * Payments Feature Definition
 *
 * This feature adds payment processing, transaction history, and payment
 * methods management to applications requiring commerce capabilities.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const PAYMENTS_FEATURE: FeatureDefinition = {
  id: 'payments',
  name: 'Payments',
  category: 'commerce',
  description: 'Payment processing, transaction history, and payment methods management',
  icon: 'wallet',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'saas',
    'subscription',
    'fintech',
    'booking',
    'food-delivery',
    'digital-products',
    'subscription-box',
    'rental',
    'ticketing',
    'crowdfunding',
    'donation',
    'freelance',
    'invoice',
    'pos',
    'membership',
    'online-course',
    'coaching',
    'consulting',
    'service-booking',
    'fitness',
    'healthcare',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'payments',
    'payment processing',
    'stripe',
    'paypal',
    'transactions',
    'billing',
    'checkout',
    'credit card',
    'debit card',
    'payment gateway',
    'refund',
    'payment method',
    'wallet',
    'pay',
    'charge',
    'invoice payment',
    'subscription billing',
  ],

  /** Enabled by default for included app types */
  enabledByDefault: false,

  /** User can opt-out */
  optional: true,

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /** Other features this depends on */
  dependencies: [
    'user-auth', // Need users to manage payment methods
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'payment-methods',
      route: '/payment-methods',
      section: 'frontend',
      title: 'Payment Methods',
      authRequired: true,
      templateId: 'payment-methods-page',
      components: [
        'payment-method-card',
        'payment-form',
        'card-input',
      ],
      layout: 'default',
    },
    {
      id: 'transaction-history',
      route: '/transactions',
      section: 'frontend',
      title: 'Transaction History',
      authRequired: true,
      templateId: 'transaction-history-page',
      components: [
        'transaction-list',
        'payment-history',
      ],
      layout: 'default',
    },
    {
      id: 'add-payment-method',
      route: '/payment-methods/add',
      section: 'frontend',
      title: 'Add Payment Method',
      authRequired: true,
      templateId: 'add-payment-method-page',
      components: [
        'payment-form',
        'card-input',
      ],
      layout: 'centered',
    },
    {
      id: 'admin-payments',
      route: '/admin/payments',
      section: 'admin',
      title: 'Payments Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'list-page',
      components: [
        'transaction-list',
        'refund-form',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-refunds',
      route: '/admin/refunds',
      section: 'admin',
      title: 'Refunds Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'list-page',
      components: [
        'refund-form',
        'transaction-list',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'payment-form',
    'card-input',
    'payment-method-card',
    'transaction-list',
    'payment-history',
    'refund-form',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'payments',
      displayName: 'Payments',
      description: 'Payment records and processing status',
      isCore: true,
    },
    {
      name: 'transactions',
      displayName: 'Transactions',
      description: 'Transaction history and details',
      isCore: true,
    },
    {
      name: 'payment_methods',
      displayName: 'Payment Methods',
      description: 'User saved payment methods',
      isCore: true,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Payments routes
    {
      method: 'GET',
      path: '/payments',
      auth: true,
      handler: 'crud',
      entity: 'payments',
      operation: 'list',
      description: 'Get user payments list',
    },
    {
      method: 'POST',
      path: '/payments',
      auth: true,
      handler: 'custom',
      entity: 'payments',
      description: 'Process a new payment',
    },
    {
      method: 'GET',
      path: '/payments/:id',
      auth: true,
      handler: 'crud',
      entity: 'payments',
      operation: 'get',
      description: 'Get payment details',
    },
    {
      method: 'POST',
      path: '/payments/:id/refund',
      auth: true,
      handler: 'custom',
      entity: 'payments',
      description: 'Process a refund for a payment',
    },

    // Payment methods routes
    {
      method: 'GET',
      path: '/payment-methods',
      auth: true,
      handler: 'crud',
      entity: 'payment_methods',
      operation: 'list',
      description: 'Get user payment methods',
    },
    {
      method: 'POST',
      path: '/payment-methods',
      auth: true,
      handler: 'crud',
      entity: 'payment_methods',
      operation: 'create',
      description: 'Add a new payment method',
    },
    {
      method: 'GET',
      path: '/payment-methods/:id',
      auth: true,
      handler: 'crud',
      entity: 'payment_methods',
      operation: 'get',
      description: 'Get payment method details',
    },
    {
      method: 'PUT',
      path: '/payment-methods/:id',
      auth: true,
      handler: 'crud',
      entity: 'payment_methods',
      operation: 'update',
      description: 'Update a payment method',
    },
    {
      method: 'DELETE',
      path: '/payment-methods/:id',
      auth: true,
      handler: 'crud',
      entity: 'payment_methods',
      operation: 'delete',
      description: 'Delete a payment method',
    },
    {
      method: 'POST',
      path: '/payment-methods/:id/set-default',
      auth: true,
      handler: 'custom',
      entity: 'payment_methods',
      description: 'Set payment method as default',
    },

    // Transactions routes
    {
      method: 'GET',
      path: '/transactions',
      auth: true,
      handler: 'crud',
      entity: 'transactions',
      operation: 'list',
      description: 'Get user transaction history',
    },
    {
      method: 'GET',
      path: '/transactions/:id',
      auth: true,
      handler: 'crud',
      entity: 'transactions',
      operation: 'get',
      description: 'Get transaction details',
    },

    // Admin routes
    {
      method: 'GET',
      path: '/admin/payments',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'payments',
      operation: 'list',
      description: 'Admin: list all payments',
    },
    {
      method: 'GET',
      path: '/admin/payments/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'payments',
      operation: 'get',
      description: 'Admin: get payment details',
    },
    {
      method: 'POST',
      path: '/admin/payments/:id/refund',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'payments',
      description: 'Admin: process refund',
    },
    {
      method: 'GET',
      path: '/admin/transactions',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'transactions',
      operation: 'list',
      description: 'Admin: list all transactions',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'supportedProviders',
      label: 'Supported Payment Providers',
      type: 'select',
      default: ['stripe'],
      options: [
        { value: 'stripe', label: 'Stripe' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'square', label: 'Square' },
        { value: 'braintree', label: 'Braintree' },
        { value: 'razorpay', label: 'Razorpay' },
        { value: 'paddle', label: 'Paddle' },
      ],
      description: 'Payment providers to integrate',
    },
    {
      key: 'enableRefunds',
      label: 'Enable Refunds',
      type: 'boolean',
      default: true,
      description: 'Allow processing of refunds',
    },
    {
      key: 'defaultCurrency',
      label: 'Default Currency',
      type: 'string',
      default: 'USD',
      description: 'Default currency for payments (ISO 4217 code)',
    },
    {
      key: 'allowPartialRefunds',
      label: 'Allow Partial Refunds',
      type: 'boolean',
      default: false,
      description: 'Allow partial refund amounts',
    },
    {
      key: 'savePaymentMethods',
      label: 'Save Payment Methods',
      type: 'boolean',
      default: true,
      description: 'Allow users to save payment methods for future use',
    },
    {
      key: 'requireBillingAddress',
      label: 'Require Billing Address',
      type: 'boolean',
      default: false,
      description: 'Require billing address for payments',
    },
  ],
};
