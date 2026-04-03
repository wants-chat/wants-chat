/**
 * Shopping Cart Feature Definition
 *
 * This feature adds shopping cart functionality to e-commerce apps.
 * It defines the pages, components, entities, and API routes needed.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SHOPPING_CART_FEATURE: FeatureDefinition = {
  id: 'shopping-cart',
  name: 'Shopping Cart',
  category: 'commerce',
  description: 'Add shopping cart with item management and checkout flow',
  icon: 'shopping-cart',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'digital-products',
    'subscription-box',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'cart',
    'shopping cart',
    'basket',
    'checkout',
    'buy',
    'purchase',
    'add to cart',
    'shopping bag',
  ],

  /** Enabled by default for included app types */
  enabledByDefault: true,

  /** User can opt-out */
  optional: false,

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /** Other features this depends on */
  dependencies: [
    'product-catalog',  // Need products to add to cart
    'user-auth',        // Need users to own carts
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'cart',
      route: '/cart',
      section: 'frontend',
      title: 'Shopping Cart',
      authRequired: true,
      templateId: 'cart-page',
      components: [
        'shopping-cart',
        'cart-summary',
        'recommended-products',
      ],
      layout: 'default',
    },
    {
      id: 'checkout',
      route: '/checkout',
      section: 'frontend',
      title: 'Checkout',
      authRequired: true,
      templateId: 'checkout-page',
      components: [
        'checkout-form',
        'order-summary',
        'payment-form',
      ],
      layout: 'centered',
    },
    {
      id: 'order-confirmation',
      route: '/order-confirmation/:orderId',
      section: 'frontend',
      title: 'Order Confirmation',
      authRequired: true,
      templateId: 'confirmation-page',
      components: [
        'order-confirmation',
        'order-details',
      ],
      layout: 'centered',
    },
    {
      id: 'admin-orders',
      route: '/admin/orders',
      section: 'admin',
      title: 'Orders Management',
      authRequired: true,
      roles: ['admin'],
      templateId: 'list-page',
      components: [
        'orders-table',
        'order-filters',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'shopping-cart',
    'cart-summary',
    'checkout-form',
    'order-summary',
    'payment-form',
    'order-confirmation',
    'order-details',
    'orders-table',
    'order-filters',
    'recommended-products',
    'cart-icon',  // For header
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'cart_items',
      displayName: 'Cart Items',
      description: 'Items in user shopping carts',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid', required: true },
        { name: 'product_id', type: 'uuid', required: true, references: { table: 'products' } },
        { name: 'quantity', type: 'integer', required: true, default: '1' },
        { name: 'variant_id', type: 'uuid' },
        { name: 'price_at_add', type: 'numeric' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'orders',
      displayName: 'Orders',
      description: 'Placed orders',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'order_number', type: 'text', unique: true },
        { name: 'user_id', type: 'uuid', required: true },
        { name: 'status', type: 'text', default: "'pending'" },
        { name: 'subtotal', type: 'numeric', required: true },
        { name: 'tax', type: 'numeric', default: '0' },
        { name: 'shipping_cost', type: 'numeric', default: '0' },
        { name: 'discount', type: 'numeric', default: '0' },
        { name: 'total', type: 'numeric', required: true },
        { name: 'currency', type: 'text', default: "'USD'" },
        { name: 'shipping_address', type: 'jsonb' },
        { name: 'billing_address', type: 'jsonb' },
        { name: 'payment_method', type: 'text' },
        { name: 'payment_status', type: 'text', default: "'pending'" },
        { name: 'payment_id', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'order_items',
      displayName: 'Order Items',
      description: 'Items within orders',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'order_id', type: 'uuid', required: true, references: { table: 'orders' } },
        { name: 'product_id', type: 'uuid', required: true, references: { table: 'products' } },
        { name: 'variant_id', type: 'uuid' },
        { name: 'name', type: 'text', required: true },
        { name: 'sku', type: 'text' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'unit_price', type: 'numeric', required: true },
        { name: 'total_price', type: 'numeric', required: true },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Cart routes
    {
      method: 'GET',
      path: '/cart',
      auth: true,
      handler: 'crud',
      entity: 'cart_items',
      operation: 'list',
      description: 'Get user cart items',
    },
    {
      method: 'POST',
      path: '/cart/items',
      auth: true,
      handler: 'crud',
      entity: 'cart_items',
      operation: 'create',
      description: 'Add item to cart',
    },
    {
      method: 'PUT',
      path: '/cart/items/:id',
      auth: true,
      handler: 'crud',
      entity: 'cart_items',
      operation: 'update',
      description: 'Update cart item',
    },
    {
      method: 'DELETE',
      path: '/cart/items/:id',
      auth: true,
      handler: 'crud',
      entity: 'cart_items',
      operation: 'delete',
      description: 'Remove cart item',
    },
    {
      method: 'DELETE',
      path: '/cart',
      auth: true,
      handler: 'custom',
      entity: 'cart_items',
      description: 'Clear cart',
    },

    // Order routes
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
      path: '/orders',
      auth: true,
      handler: 'crud',
      entity: 'orders',
      operation: 'list',
      description: 'Get user orders',
    },
    {
      method: 'GET',
      path: '/orders/:id',
      auth: true,
      handler: 'crud',
      entity: 'orders',
      operation: 'get',
      description: 'Get order details',
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
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'enableGuestCheckout',
      label: 'Enable Guest Checkout',
      type: 'boolean',
      default: false,
      description: 'Allow checkout without login',
    },
    {
      key: 'cartExpiryDays',
      label: 'Cart Expiry (Days)',
      type: 'number',
      default: 30,
      description: 'Days until abandoned cart expires',
    },
    {
      key: 'maxQuantityPerItem',
      label: 'Max Quantity Per Item',
      type: 'number',
      default: 10,
      description: 'Maximum quantity for single item',
    },
  ],
};
