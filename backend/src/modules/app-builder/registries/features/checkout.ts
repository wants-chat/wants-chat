/**
 * Checkout Feature Definition
 *
 * This feature adds shopping cart checkout, order processing, and payment
 * integration to e-commerce applications.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CHECKOUT_FEATURE: FeatureDefinition = {
  id: 'checkout',
  name: 'Checkout',
  category: 'commerce',
  description: 'Shopping cart checkout, order processing, and payment integration',
  icon: 'credit-card',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'subscription',
    'food-delivery',
    'booking',
    'retail',
    'wholesale',
    'digital-products',
    'subscription-box',
    'grocery',
    'pharmacy',
    'fashion',
    'electronics',
    'furniture',
    'automotive',
    'b2b-commerce',
    'dropshipping',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'checkout',
    'cart',
    'purchase',
    'buy',
    'order',
    'payment',
    'pay',
    'transaction',
    'billing',
    'invoice',
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
    'user-auth',       // Need users to complete checkout
    'shopping-cart',   // Need cart to checkout from
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'checkout',
      route: '/checkout',
      section: 'frontend',
      title: 'Checkout',
      authRequired: true,
      templateId: 'checkout-page',
      components: [
        'checkout-form',
        'shipping-form',
        'billing-form',
        'payment-form',
        'order-summary',
        'promo-code-input',
      ],
      layout: 'centered',
    },
    {
      id: 'order-confirmation',
      route: '/order-confirmation/:id',
      section: 'frontend',
      title: 'Order Confirmation',
      authRequired: true,
      templateId: 'confirmation-page',
      components: [
        'order-confirmation',
        'order-details',
        'order-summary',
      ],
      layout: 'centered',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'checkout-form',
    'payment-form',
    'order-summary',
    'shipping-form',
    'billing-form',
    'promo-code-input',
    'order-confirmation',
    'order-details',
    'payment-method-selector',
    'shipping-method-selector',
    'address-form',
    'order-review',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'orders',
      displayName: 'Orders',
      description: 'Customer orders with shipping and billing details',
      isCore: true,
    },
    {
      name: 'order_items',
      displayName: 'Order Items',
      description: 'Individual items within an order',
      isCore: true,
    },
    {
      name: 'payments',
      displayName: 'Payments',
      description: 'Payment transactions and records',
      isCore: true,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Checkout process routes
    {
      method: 'POST',
      path: '/checkout',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Process checkout and create order',
    },
    {
      method: 'GET',
      path: '/checkout/summary',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Get checkout summary with totals and shipping',
    },
    {
      method: 'POST',
      path: '/checkout/apply-coupon',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Apply coupon or promo code to checkout',
    },
    {
      method: 'POST',
      path: '/checkout/validate',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Validate checkout data before processing',
    },

    // Order routes
    {
      method: 'GET',
      path: '/orders/:id',
      auth: true,
      handler: 'crud',
      entity: 'orders',
      operation: 'get',
      description: 'Get order details by ID',
    },
    {
      method: 'GET',
      path: '/orders',
      auth: true,
      handler: 'crud',
      entity: 'orders',
      operation: 'list',
      description: 'Get user order history',
    },

    // Payment routes
    {
      method: 'POST',
      path: '/payments',
      auth: true,
      handler: 'custom',
      entity: 'payments',
      description: 'Process payment for order',
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

    // Admin routes
    {
      method: 'GET',
      path: '/admin/orders',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'orders',
      operation: 'list',
      description: 'Admin: list all orders',
    },
    {
      method: 'PUT',
      path: '/admin/orders/:id/status',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'orders',
      description: 'Admin: update order status',
    },
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
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'requireShipping',
      label: 'Require Shipping',
      type: 'boolean',
      default: true,
      description: 'Require shipping address for physical products',
    },
    {
      key: 'allowGuestCheckout',
      label: 'Allow Guest Checkout',
      type: 'boolean',
      default: false,
      description: 'Allow checkout without creating an account',
    },
    {
      key: 'enablePromoCode',
      label: 'Enable Promo Codes',
      type: 'boolean',
      default: true,
      description: 'Allow customers to apply promo codes at checkout',
    },
    {
      key: 'requireBillingAddress',
      label: 'Require Billing Address',
      type: 'boolean',
      default: true,
      description: 'Require separate billing address',
    },
    {
      key: 'paymentMethods',
      label: 'Payment Methods',
      type: 'select',
      default: 'all',
      options: [
        { value: 'all', label: 'All Methods' },
        { value: 'card-only', label: 'Credit/Debit Card Only' },
        { value: 'digital-wallets', label: 'Digital Wallets Only' },
        { value: 'custom', label: 'Custom Configuration' },
      ],
      description: 'Available payment methods at checkout',
    },
  ],
};
