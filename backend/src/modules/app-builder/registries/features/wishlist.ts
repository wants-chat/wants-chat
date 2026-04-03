/**
 * Wishlist Feature Definition
 *
 * This feature adds wishlist functionality allowing users to save products
 * for later purchase, share wishlists, and receive notifications on price changes.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const WISHLIST_FEATURE: FeatureDefinition = {
  id: 'wishlist',
  name: 'Wishlist',
  category: 'commerce',
  description: 'Save products for later, create wishlists, and share with others',
  icon: 'heart',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'marketplace',
    'fashion',
    'retail',
    'electronics',
    'furniture',
    'jewelry',
    'beauty',
    'home-decor',
    'toys',
    'sports',
    'books',
    'gifts',
    'wedding-registry',
    'baby-registry',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'wishlist',
    'wish list',
    'favorites',
    'favourites',
    'save for later',
    'saved items',
    'liked items',
    'bookmarks',
    'want list',
    'shopping list',
    'save product',
    'favorite products',
    'heart button',
    'save item',
    'gift registry',
    'registry',
    'watchlist',
  ],

  /** Enabled by default for included app types */
  enabledByDefault: true,

  /** User can opt-out */
  optional: true,

  // ─────────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────────────────────

  /** Other features this depends on */
  dependencies: [
    'user-auth',         // Need users to have wishlists
    'product-catalog',   // Need products to add to wishlist
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'wishlist',
      route: '/wishlist',
      section: 'frontend',
      title: 'My Wishlist',
      authRequired: true,
      templateId: 'wishlist-page',
      components: [
        'wishlist-list',
        'wishlist-item',
        'wishlist-share-button',
        'price-drop-alerts',
        'move-to-cart-button',
      ],
      layout: 'default',
    },
    {
      id: 'shared-wishlist',
      route: '/wishlist/shared/:shareId',
      section: 'frontend',
      title: 'Shared Wishlist',
      authRequired: false,
      templateId: 'shared-wishlist-page',
      components: [
        'shared-wishlist-header',
        'wishlist-list',
        'wishlist-item',
        'add-to-own-wishlist',
      ],
      layout: 'default',
    },
    {
      id: 'wishlists-manager',
      route: '/account/wishlists',
      section: 'frontend',
      title: 'My Wishlists',
      authRequired: true,
      templateId: 'list-page',
      components: [
        'wishlists-grid',
        'create-wishlist-button',
        'wishlist-card',
        'wishlist-privacy-toggle',
      ],
      layout: 'default',
    },
    {
      id: 'admin-wishlists',
      route: '/admin/wishlists',
      section: 'admin',
      title: 'Wishlist Analytics',
      authRequired: true,
      roles: ['admin'],
      templateId: 'analytics-page',
      components: [
        'wishlist-analytics-dashboard',
        'most-wishlisted-products',
        'wishlist-conversion-rate',
        'wishlist-trends-chart',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'wishlist-button',
    'wishlist-list',
    'wishlist-item',
    'add-to-wishlist',
    'wishlist-share-button',
    'price-drop-alerts',
    'move-to-cart-button',
    'shared-wishlist-header',
    'add-to-own-wishlist',
    'wishlists-grid',
    'create-wishlist-button',
    'wishlist-card',
    'wishlist-privacy-toggle',
    'wishlist-analytics-dashboard',
    'most-wishlisted-products',
    'wishlist-conversion-rate',
    'wishlist-trends-chart',
    'wishlist-icon',
    'wishlist-counter',
    'quick-add-wishlist',
    'wishlist-dropdown',
    'wishlist-notification',
    'product-wishlist-status',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'wishlists',
      displayName: 'Wishlists',
      description: 'User wishlists with privacy and sharing settings',
      isCore: true,
    },
    {
      name: 'wishlist_items',
      displayName: 'Wishlist Items',
      description: 'Products saved in user wishlists',
      isCore: true,
    },
    {
      name: 'wishlist_shares',
      displayName: 'Wishlist Shares',
      description: 'Shared wishlist links and access settings',
      isCore: false,
    },
    {
      name: 'price_alerts',
      displayName: 'Price Alerts',
      description: 'User price drop notifications for wishlisted items',
      isCore: false,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Wishlist management
    {
      method: 'GET',
      path: '/wishlists',
      auth: true,
      handler: 'crud',
      entity: 'wishlists',
      operation: 'list',
      description: 'Get user wishlists',
    },
    {
      method: 'POST',
      path: '/wishlists',
      auth: true,
      handler: 'crud',
      entity: 'wishlists',
      operation: 'create',
      description: 'Create new wishlist',
    },
    {
      method: 'GET',
      path: '/wishlists/:id',
      auth: true,
      handler: 'crud',
      entity: 'wishlists',
      operation: 'get',
      description: 'Get wishlist details',
    },
    {
      method: 'PUT',
      path: '/wishlists/:id',
      auth: true,
      handler: 'crud',
      entity: 'wishlists',
      operation: 'update',
      description: 'Update wishlist settings',
    },
    {
      method: 'DELETE',
      path: '/wishlists/:id',
      auth: true,
      handler: 'crud',
      entity: 'wishlists',
      operation: 'delete',
      description: 'Delete wishlist',
    },

    // Wishlist items
    {
      method: 'GET',
      path: '/wishlist',
      auth: true,
      handler: 'crud',
      entity: 'wishlist_items',
      operation: 'list',
      description: 'Get default wishlist items',
    },
    {
      method: 'POST',
      path: '/wishlist/items',
      auth: true,
      handler: 'crud',
      entity: 'wishlist_items',
      operation: 'create',
      description: 'Add item to wishlist',
    },
    {
      method: 'DELETE',
      path: '/wishlist/items/:id',
      auth: true,
      handler: 'crud',
      entity: 'wishlist_items',
      operation: 'delete',
      description: 'Remove item from wishlist',
    },
    {
      method: 'POST',
      path: '/wishlist/items/:id/move-to-cart',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_items',
      description: 'Move wishlist item to cart',
    },
    {
      method: 'POST',
      path: '/wishlist/items/bulk-add-to-cart',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_items',
      description: 'Add all wishlist items to cart',
    },

    // Check if product is wishlisted
    {
      method: 'GET',
      path: '/wishlist/check/:productId',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_items',
      description: 'Check if product is in wishlist',
    },
    {
      method: 'POST',
      path: '/wishlist/toggle/:productId',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_items',
      description: 'Toggle product in wishlist',
    },

    // Sharing
    {
      method: 'POST',
      path: '/wishlists/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_shares',
      description: 'Create shareable link for wishlist',
    },
    {
      method: 'GET',
      path: '/wishlist/shared/:shareId',
      auth: false,
      handler: 'custom',
      entity: 'wishlists',
      description: 'View shared wishlist',
    },
    {
      method: 'DELETE',
      path: '/wishlists/:id/share',
      auth: true,
      handler: 'custom',
      entity: 'wishlist_shares',
      description: 'Revoke wishlist share link',
    },

    // Price alerts
    {
      method: 'POST',
      path: '/wishlist/items/:id/price-alert',
      auth: true,
      handler: 'crud',
      entity: 'price_alerts',
      operation: 'create',
      description: 'Set price drop alert for item',
    },
    {
      method: 'DELETE',
      path: '/wishlist/price-alerts/:id',
      auth: true,
      handler: 'crud',
      entity: 'price_alerts',
      operation: 'delete',
      description: 'Remove price alert',
    },
    {
      method: 'GET',
      path: '/wishlist/price-alerts',
      auth: true,
      handler: 'crud',
      entity: 'price_alerts',
      operation: 'list',
      description: 'Get all price alerts',
    },

    // Admin routes
    {
      method: 'GET',
      path: '/admin/wishlists/analytics',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'wishlist_items',
      description: 'Admin: get wishlist analytics',
    },
    {
      method: 'GET',
      path: '/admin/wishlists/most-wishlisted',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'wishlist_items',
      description: 'Admin: get most wishlisted products',
    },
    {
      method: 'GET',
      path: '/admin/wishlists/conversion-rate',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'wishlist_items',
      description: 'Admin: get wishlist to cart conversion rate',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'allowMultipleWishlists',
      label: 'Allow Multiple Wishlists',
      type: 'boolean',
      default: true,
      description: 'Allow users to create multiple wishlists',
    },
    {
      key: 'maxWishlists',
      label: 'Maximum Wishlists',
      type: 'number',
      default: 10,
      description: 'Maximum number of wishlists per user',
    },
    {
      key: 'maxItemsPerWishlist',
      label: 'Maximum Items per Wishlist',
      type: 'number',
      default: 100,
      description: 'Maximum items allowed in a single wishlist',
    },
    {
      key: 'enableSharing',
      label: 'Enable Wishlist Sharing',
      type: 'boolean',
      default: true,
      description: 'Allow users to share wishlists with others',
    },
    {
      key: 'enablePriceAlerts',
      label: 'Enable Price Drop Alerts',
      type: 'boolean',
      default: true,
      description: 'Notify users when wishlisted items go on sale',
    },
    {
      key: 'defaultPrivacy',
      label: 'Default Wishlist Privacy',
      type: 'select',
      default: 'private',
      options: [
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
        { value: 'link-only', label: 'Link Only' },
      ],
      description: 'Default privacy setting for new wishlists',
    },
    {
      key: 'showWishlistCount',
      label: 'Show Wishlist Count',
      type: 'boolean',
      default: true,
      description: 'Show how many users have wishlisted a product',
    },
    {
      key: 'requireAuth',
      label: 'Require Authentication',
      type: 'boolean',
      default: true,
      description: 'Require login to add items to wishlist',
    },
  ],
};
