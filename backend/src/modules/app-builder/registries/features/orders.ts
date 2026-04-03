/**
 * Orders Feature Definition
 *
 * This feature adds comprehensive order management, tracking, and fulfillment
 * capabilities to applications requiring commerce order processing.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const ORDERS_FEATURE: FeatureDefinition = {
  id: 'orders',
  name: 'Order Management',
  category: 'commerce',
  description: 'Order processing, tracking, history, and fulfillment management',
  icon: 'shopping-bag',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'food-delivery',
    'retail',
    'wholesale',
    'pos',
    'restaurant',
    'cafe',
    'bakery',
    'grocery',
    'pharmacy',
    'digital-products',
    'subscription-box',
    'dropshipping',
    'print-on-demand',
    'b2b-commerce',
    'catering',
    'florist',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'orders',
    'order management',
    'order tracking',
    'order history',
    'order status',
    'fulfillment',
    'order processing',
    'shipping',
    'delivery',
    'dispatch',
    'order confirmation',
    'order details',
    'purchase history',
    'track order',
    'order timeline',
    'order updates',
    'order notifications',
    'placed orders',
    'order queue',
    'pending orders',
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
    'user-auth', // Need users to place orders
    'product-catalog', // Need products to order
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'orders',
      route: '/orders',
      section: 'frontend',
      title: 'My Orders',
      authRequired: true,
      templateId: 'orders-page',
      components: [
        'order-list',
        'order-filters',
        'order-status',
      ],
      layout: 'default',
    },
    {
      id: 'order-detail',
      route: '/orders/:orderId',
      section: 'frontend',
      title: 'Order Details',
      authRequired: true,
      templateId: 'order-detail-page',
      components: [
        'order-timeline',
        'order-items-list',
        'order-status',
        'order-actions',
      ],
      layout: 'default',
    },
    {
      id: 'order-tracking',
      route: '/orders/:orderId/tracking',
      section: 'frontend',
      title: 'Track Order',
      authRequired: false,
      templateId: 'order-tracking-page',
      components: [
        'order-timeline',
        'tracking-map',
        'delivery-info',
      ],
      layout: 'centered',
    },
    {
      id: 'admin-orders',
      route: '/admin/orders',
      section: 'admin',
      title: 'Orders Management',
      authRequired: true,
      roles: ['admin', 'staff'],
      templateId: 'admin-orders-page',
      components: [
        'order-list',
        'order-filters',
        'order-status',
        'bulk-actions',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-order-detail',
      route: '/admin/orders/:orderId',
      section: 'admin',
      title: 'Order Details',
      authRequired: true,
      roles: ['admin', 'staff'],
      templateId: 'admin-order-detail-page',
      components: [
        'order-timeline',
        'order-items-list',
        'order-status',
        'order-actions',
        'order-notes',
        'customer-info',
      ],
      layout: 'dashboard',
    },
    {
      id: 'vendor-orders',
      route: '/vendor/orders',
      section: 'vendor',
      title: 'Vendor Orders',
      authRequired: true,
      roles: ['vendor'],
      templateId: 'vendor-orders-page',
      components: [
        'order-list',
        'order-filters',
        'order-status',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'order-list',
    'order-status',
    'order-timeline',
    'order-actions',
    'order-items-list',
    'order-filters',
    'order-summary',
    'tracking-map',
    'delivery-info',
    'order-notes',
    'customer-info',
    'bulk-actions',
    'status-badge',
    'order-card',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'orders',
      displayName: 'Orders',
      description: 'Customer orders with status and totals',
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
        { name: 'shipped_at', type: 'timestamptz' },
        { name: 'delivered_at', type: 'timestamptz' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'order_items',
      displayName: 'Order Items',
      description: 'Individual items within orders',
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
    {
      name: 'order_history',
      displayName: 'Order History',
      description: 'Timeline of order status changes and events',
      isCore: true,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'order_id', type: 'uuid', required: true, references: { table: 'orders' } },
        { name: 'status', type: 'text', required: true },
        { name: 'message', type: 'text' },
        { name: 'metadata', type: 'jsonb' },
        { name: 'created_by', type: 'uuid' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'order_notes',
      displayName: 'Order Notes',
      description: 'Internal notes and customer messages',
      isCore: false,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'order_id', type: 'uuid', required: true, references: { table: 'orders' } },
        { name: 'user_id', type: 'uuid' },
        { name: 'note', type: 'text', required: true },
        { name: 'is_internal', type: 'boolean', default: 'true' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
      ],
    },
    {
      name: 'shipping_info',
      displayName: 'Shipping Info',
      description: 'Shipping and delivery information',
      isCore: false,
      fields: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'order_id', type: 'uuid', required: true, references: { table: 'orders' } },
        { name: 'carrier', type: 'text' },
        { name: 'tracking_number', type: 'text' },
        { name: 'tracking_url', type: 'text' },
        { name: 'shipped_at', type: 'timestamptz' },
        { name: 'estimated_delivery', type: 'timestamptz' },
        { name: 'delivered_at', type: 'timestamptz' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Customer order routes
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
    {
      method: 'POST',
      path: '/orders',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Create a new order',
    },
    {
      method: 'POST',
      path: '/orders/:id/cancel',
      auth: true,
      handler: 'custom',
      entity: 'orders',
      description: 'Cancel an order',
    },
    {
      method: 'GET',
      path: '/orders/:id/tracking',
      auth: false,
      handler: 'custom',
      entity: 'orders',
      description: 'Get order tracking info (public with order ID)',
    },
    {
      method: 'GET',
      path: '/orders/:id/items',
      auth: true,
      handler: 'crud',
      entity: 'order_items',
      operation: 'list',
      description: 'Get order items',
    },
    {
      method: 'GET',
      path: '/orders/:id/history',
      auth: true,
      handler: 'crud',
      entity: 'order_history',
      operation: 'list',
      description: 'Get order history/timeline',
    },

    // Admin order routes
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
      method: 'GET',
      path: '/admin/orders/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'orders',
      operation: 'get',
      description: 'Admin: get order details',
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
      method: 'POST',
      path: '/admin/orders/:id/notes',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'order_notes',
      operation: 'create',
      description: 'Admin: add order note',
    },
    {
      method: 'POST',
      path: '/admin/orders/:id/refund',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'orders',
      description: 'Admin: process order refund',
    },
    {
      method: 'PUT',
      path: '/admin/orders/:id/shipping',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'shipping_info',
      description: 'Admin: update shipping info',
    },
    {
      method: 'POST',
      path: '/admin/orders/bulk-status',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'orders',
      description: 'Admin: bulk update order status',
    },

    // Vendor order routes
    {
      method: 'GET',
      path: '/vendor/orders',
      auth: true,
      role: 'vendor',
      handler: 'crud',
      entity: 'orders',
      operation: 'list',
      description: 'Vendor: list vendor orders',
    },
    {
      method: 'GET',
      path: '/vendor/orders/:id',
      auth: true,
      role: 'vendor',
      handler: 'crud',
      entity: 'orders',
      operation: 'get',
      description: 'Vendor: get order details',
    },
    {
      method: 'PUT',
      path: '/vendor/orders/:id/status',
      auth: true,
      role: 'vendor',
      handler: 'custom',
      entity: 'orders',
      description: 'Vendor: update order fulfillment status',
    },

    // Reports
    {
      method: 'GET',
      path: '/admin/orders/stats',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'orders',
      description: 'Admin: get order statistics',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'orderStatuses',
      label: 'Order Statuses',
      type: 'select',
      default: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'on_hold', label: 'On Hold' },
      ],
      description: 'Available order statuses',
    },
    {
      key: 'enableOrderTracking',
      label: 'Enable Order Tracking',
      type: 'boolean',
      default: true,
      description: 'Allow customers to track their orders',
    },
    {
      key: 'allowOrderCancellation',
      label: 'Allow Order Cancellation',
      type: 'boolean',
      default: true,
      description: 'Allow customers to cancel pending orders',
    },
    {
      key: 'cancellationWindowHours',
      label: 'Cancellation Window (Hours)',
      type: 'number',
      default: 24,
      description: 'Hours after order placement that cancellation is allowed',
    },
    {
      key: 'sendOrderNotifications',
      label: 'Send Order Notifications',
      type: 'boolean',
      default: true,
      description: 'Send email/SMS notifications for order updates',
    },
    {
      key: 'enableGuestOrderTracking',
      label: 'Enable Guest Order Tracking',
      type: 'boolean',
      default: true,
      description: 'Allow order tracking without login using order ID',
    },
    {
      key: 'orderNumberPrefix',
      label: 'Order Number Prefix',
      type: 'string',
      default: 'ORD-',
      description: 'Prefix for order numbers',
    },
  ],
};
