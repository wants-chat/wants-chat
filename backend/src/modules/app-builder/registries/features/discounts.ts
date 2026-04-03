/**
 * Discounts Feature Definition
 *
 * This feature adds discount codes, coupons, and promotional pricing
 * capabilities to applications requiring commerce promotions.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const DISCOUNTS_FEATURE: FeatureDefinition = {
  id: 'discounts',
  name: 'Discounts & Coupons',
  category: 'commerce',
  description: 'Discount codes, coupons, promotional pricing, and special offers management',
  icon: 'percent',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'retail',
    'subscription',
    'saas',
    'digital-products',
    'subscription-box',
    'food-delivery',
    'restaurant',
    'booking',
    'ticketing',
    'membership',
    'online-course',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'discount',
    'discounts',
    'coupon',
    'coupons',
    'promo code',
    'promotional code',
    'voucher',
    'sale',
    'special offer',
    'deal',
    'percentage off',
    'discount code',
    'promotional pricing',
    'flash sale',
    'clearance',
    'bulk discount',
    'bundle discount',
    'loyalty discount',
    'first order discount',
    'referral discount',
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
    'user-auth', // Need users for tracking usage
    'product-catalog', // Need products to apply discounts
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'discounts',
      route: '/admin/discounts',
      section: 'admin',
      title: 'Discounts Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'discounts-page',
      components: [
        'discount-list',
        'discount-filters',
        'discount-stats',
      ],
      layout: 'dashboard',
    },
    {
      id: 'coupons',
      route: '/admin/coupons',
      section: 'admin',
      title: 'Coupon Codes',
      authRequired: true,
      roles: ['admin'],
      templateId: 'coupons-page',
      components: [
        'coupon-list',
        'coupon-generator',
        'usage-stats',
      ],
      layout: 'dashboard',
    },
    {
      id: 'create-discount',
      route: '/admin/discounts/create',
      section: 'admin',
      title: 'Create Discount',
      authRequired: true,
      roles: ['admin'],
      templateId: 'create-discount-page',
      components: [
        'discount-form',
        'product-selector',
        'category-selector',
        'date-range-picker',
      ],
      layout: 'dashboard',
    },
    {
      id: 'edit-discount',
      route: '/admin/discounts/:id/edit',
      section: 'admin',
      title: 'Edit Discount',
      authRequired: true,
      roles: ['admin'],
      templateId: 'edit-discount-page',
      components: [
        'discount-form',
        'product-selector',
        'category-selector',
        'usage-history',
      ],
      layout: 'dashboard',
    },
    {
      id: 'promotions',
      route: '/promotions',
      section: 'frontend',
      title: 'Current Promotions',
      authRequired: false,
      templateId: 'promotions-page',
      components: [
        'promo-banner',
        'discount-list',
        'featured-deals',
      ],
      layout: 'default',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'discount-form',
    'coupon-code-input',
    'discount-list',
    'promo-banner',
    'coupon-list',
    'coupon-generator',
    'usage-stats',
    'discount-filters',
    'discount-stats',
    'discount-badge',
    'sale-tag',
    'countdown-timer',
    'featured-deals',
    'usage-history',
    'product-selector',
    'category-selector',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'discounts',
      displayName: 'Discounts',
      description: 'Discount rules and configurations',
      isCore: true,
    },
    {
      name: 'coupons',
      displayName: 'Coupons',
      description: 'Coupon codes linked to discounts',
      isCore: true,
    },
    {
      name: 'discount_usage',
      displayName: 'Discount Usage',
      description: 'Record of discount and coupon usage',
      isCore: true,
    },
    {
      name: 'discount_products',
      displayName: 'Discount Products',
      description: 'Products linked to specific discounts',
      isCore: false,
    },
    {
      name: 'discount_categories',
      displayName: 'Discount Categories',
      description: 'Categories linked to specific discounts',
      isCore: false,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Public discount routes
    {
      method: 'GET',
      path: '/promotions',
      auth: false,
      handler: 'crud',
      entity: 'discounts',
      operation: 'list',
      description: 'Get active public promotions',
    },
    {
      method: 'POST',
      path: '/coupons/validate',
      auth: false,
      handler: 'custom',
      entity: 'coupons',
      description: 'Validate a coupon code',
    },
    {
      method: 'POST',
      path: '/coupons/apply',
      auth: true,
      handler: 'custom',
      entity: 'coupons',
      description: 'Apply a coupon code to cart',
    },
    {
      method: 'POST',
      path: '/coupons/remove',
      auth: true,
      handler: 'custom',
      entity: 'coupons',
      description: 'Remove applied coupon from cart',
    },

    // Admin discount routes
    {
      method: 'GET',
      path: '/admin/discounts',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discounts',
      operation: 'list',
      description: 'Admin: list all discounts',
    },
    {
      method: 'POST',
      path: '/admin/discounts',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discounts',
      operation: 'create',
      description: 'Admin: create a new discount',
    },
    {
      method: 'GET',
      path: '/admin/discounts/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discounts',
      operation: 'get',
      description: 'Admin: get discount details',
    },
    {
      method: 'PUT',
      path: '/admin/discounts/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discounts',
      operation: 'update',
      description: 'Admin: update discount',
    },
    {
      method: 'DELETE',
      path: '/admin/discounts/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discounts',
      operation: 'delete',
      description: 'Admin: delete discount',
    },
    {
      method: 'PUT',
      path: '/admin/discounts/:id/toggle',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'discounts',
      description: 'Admin: toggle discount active status',
    },

    // Admin coupon routes
    {
      method: 'GET',
      path: '/admin/coupons',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'coupons',
      operation: 'list',
      description: 'Admin: list all coupons',
    },
    {
      method: 'POST',
      path: '/admin/coupons',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'coupons',
      operation: 'create',
      description: 'Admin: create a new coupon',
    },
    {
      method: 'POST',
      path: '/admin/coupons/generate-bulk',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'coupons',
      description: 'Admin: generate multiple coupon codes',
    },
    {
      method: 'GET',
      path: '/admin/coupons/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'coupons',
      operation: 'get',
      description: 'Admin: get coupon details',
    },
    {
      method: 'PUT',
      path: '/admin/coupons/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'coupons',
      operation: 'update',
      description: 'Admin: update coupon',
    },
    {
      method: 'DELETE',
      path: '/admin/coupons/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'coupons',
      operation: 'delete',
      description: 'Admin: delete coupon',
    },

    // Usage tracking routes
    {
      method: 'GET',
      path: '/admin/discounts/:id/usage',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discount_usage',
      operation: 'list',
      description: 'Admin: get discount usage history',
    },
    {
      method: 'GET',
      path: '/admin/coupons/:id/usage',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'discount_usage',
      operation: 'list',
      description: 'Admin: get coupon usage history',
    },

    // Stats routes
    {
      method: 'GET',
      path: '/admin/discounts/stats',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'discount_usage',
      description: 'Admin: get discount statistics',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'discountTypes',
      label: 'Discount Types',
      type: 'select',
      default: ['percentage', 'fixed_amount', 'free_shipping'],
      options: [
        { value: 'percentage', label: 'Percentage Off' },
        { value: 'fixed_amount', label: 'Fixed Amount Off' },
        { value: 'free_shipping', label: 'Free Shipping' },
        { value: 'buy_x_get_y', label: 'Buy X Get Y' },
        { value: 'bundle', label: 'Bundle Discount' },
        { value: 'tiered', label: 'Tiered Discount' },
      ],
      description: 'Available discount types',
    },
    {
      key: 'maxDiscountPercentage',
      label: 'Max Discount Percentage',
      type: 'number',
      default: 100,
      description: 'Maximum percentage discount allowed',
    },
    {
      key: 'allowStackingDiscounts',
      label: 'Allow Stacking Discounts',
      type: 'boolean',
      default: false,
      description: 'Allow multiple discounts on same order',
    },
    {
      key: 'enableUsageLimits',
      label: 'Enable Usage Limits',
      type: 'boolean',
      default: true,
      description: 'Allow setting usage limits on discounts',
    },
    {
      key: 'enablePerUserLimits',
      label: 'Enable Per-User Limits',
      type: 'boolean',
      default: true,
      description: 'Allow limiting usage per customer',
    },
    {
      key: 'showDiscountOnProducts',
      label: 'Show Discount on Products',
      type: 'boolean',
      default: true,
      description: 'Display discount badges on eligible products',
    },
    {
      key: 'enableCouponCodeGeneration',
      label: 'Enable Coupon Code Generation',
      type: 'boolean',
      default: true,
      description: 'Allow generating unique coupon codes',
    },
    {
      key: 'couponCodeLength',
      label: 'Coupon Code Length',
      type: 'number',
      default: 8,
      description: 'Length of auto-generated coupon codes',
    },
  ],
};
