/**
 * Inventory Feature Definition
 *
 * This feature adds inventory management, stock tracking, and reorder functionality
 * to applications requiring product inventory capabilities.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const INVENTORY_FEATURE: FeatureDefinition = {
  id: 'inventory',
  name: 'Inventory Management',
  category: 'commerce',
  description: 'Inventory tracking, stock levels, movements, and reorder management',
  icon: 'package',

  // ─────────────────────────────────────────────────────────────
  // ACTIVATION
  // ─────────────────────────────────────────────────────────────

  /** App types that include this feature by default */
  includedInAppTypes: [
    'ecommerce',
    'retail',
    'wholesale',
    'warehouse',
    'manufacturing',
    'marketplace',
    'pos',
    'inventory-management',
    'supply-chain',
    'distribution',
    'pharmacy',
    'grocery',
    'hardware-store',
    'bookstore',
    'electronics-store',
    'fashion-retail',
    'sporting-goods',
    'home-improvement',
  ],

  /** Keywords that activate this feature from user prompt */
  activationKeywords: [
    'inventory',
    'stock',
    'stock levels',
    'stock management',
    'warehouse',
    'reorder',
    'low stock',
    'stock alert',
    'inventory tracking',
    'stock count',
    'sku',
    'barcode',
    'stocktake',
    'stock movement',
    'inventory control',
    'stock in',
    'stock out',
    'replenishment',
    'safety stock',
    'minimum stock',
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
    'product-catalog', // Need products to track inventory
    'user-auth', // Need users for audit trail
  ],

  /** Incompatible features */
  conflicts: [],

  // ─────────────────────────────────────────────────────────────
  // PAGES - What pages this feature adds
  // ─────────────────────────────────────────────────────────────
  pages: [
    {
      id: 'inventory',
      route: '/inventory',
      section: 'admin',
      title: 'Inventory Management',
      authRequired: true,
      roles: ['admin', 'warehouse'],
      templateId: 'inventory-page',
      components: [
        'inventory-table',
        'stock-alert',
        'inventory-filters',
      ],
      layout: 'dashboard',
    },
    {
      id: 'stock-levels',
      route: '/inventory/stock-levels',
      section: 'admin',
      title: 'Stock Levels',
      authRequired: true,
      roles: ['admin', 'warehouse'],
      templateId: 'stock-levels-page',
      components: [
        'stock-level-card',
        'stock-alert',
        'low-stock-list',
      ],
      layout: 'dashboard',
    },
    {
      id: 'stock-movements',
      route: '/inventory/movements',
      section: 'admin',
      title: 'Stock Movements',
      authRequired: true,
      roles: ['admin', 'warehouse'],
      templateId: 'stock-movements-page',
      components: [
        'stock-movement-table',
        'movement-filters',
        'movement-form',
      ],
      layout: 'dashboard',
    },
    {
      id: 'reorder',
      route: '/inventory/reorder',
      section: 'admin',
      title: 'Reorder Management',
      authRequired: true,
      roles: ['admin', 'warehouse'],
      templateId: 'reorder-page',
      components: [
        'reorder-form',
        'reorder-list',
        'supplier-selector',
      ],
      layout: 'dashboard',
    },
    {
      id: 'inventory-reports',
      route: '/inventory/reports',
      section: 'admin',
      title: 'Inventory Reports',
      authRequired: true,
      roles: ['admin'],
      templateId: 'reports-page',
      components: [
        'inventory-summary',
        'stock-value-chart',
        'turnover-report',
      ],
      layout: 'dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // COMPONENTS - Components used by this feature
  // ─────────────────────────────────────────────────────────────
  components: [
    'inventory-table',
    'stock-alert',
    'reorder-form',
    'stock-level-card',
    'stock-movement-table',
    'movement-form',
    'inventory-filters',
    'low-stock-list',
    'reorder-list',
    'supplier-selector',
    'inventory-summary',
    'stock-value-chart',
    'turnover-report',
    'movement-filters',
  ],

  // ─────────────────────────────────────────────────────────────
  // ENTITIES - Database tables required
  // ─────────────────────────────────────────────────────────────
  entities: [
    {
      name: 'inventory',
      displayName: 'Inventory',
      description: 'Product inventory levels and stock information',
      isCore: true,
    },
    {
      name: 'stock_movements',
      displayName: 'Stock Movements',
      description: 'Record of all stock ins, outs, and adjustments',
      isCore: true,
    },
    {
      name: 'reorder_requests',
      displayName: 'Reorder Requests',
      description: 'Pending and completed reorder requests',
      isCore: false,
    },
    {
      name: 'suppliers',
      displayName: 'Suppliers',
      description: 'Supplier information for reordering',
      isCore: false,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // API ROUTES - Backend endpoints
  // ─────────────────────────────────────────────────────────────
  apiRoutes: [
    // Inventory routes
    {
      method: 'GET',
      path: '/inventory',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'inventory',
      operation: 'list',
      description: 'Get all inventory items',
    },
    {
      method: 'GET',
      path: '/inventory/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'inventory',
      operation: 'get',
      description: 'Get inventory item details',
    },
    {
      method: 'PUT',
      path: '/inventory/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'inventory',
      operation: 'update',
      description: 'Update inventory item',
    },
    {
      method: 'GET',
      path: '/inventory/low-stock',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'inventory',
      description: 'Get items below minimum stock level',
    },
    {
      method: 'GET',
      path: '/inventory/product/:productId',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'inventory',
      description: 'Get inventory for specific product',
    },
    {
      method: 'POST',
      path: '/inventory/adjust',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'inventory',
      description: 'Adjust inventory quantity',
    },

    // Stock movements routes
    {
      method: 'GET',
      path: '/stock-movements',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'stock_movements',
      operation: 'list',
      description: 'Get all stock movements',
    },
    {
      method: 'POST',
      path: '/stock-movements',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'stock_movements',
      operation: 'create',
      description: 'Record a stock movement',
    },
    {
      method: 'GET',
      path: '/stock-movements/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'stock_movements',
      operation: 'get',
      description: 'Get stock movement details',
    },
    {
      method: 'GET',
      path: '/stock-movements/product/:productId',
      auth: true,
      role: 'admin',
      handler: 'custom',
      entity: 'stock_movements',
      description: 'Get movements for specific product',
    },

    // Reorder routes
    {
      method: 'GET',
      path: '/reorder-requests',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reorder_requests',
      operation: 'list',
      description: 'Get all reorder requests',
    },
    {
      method: 'POST',
      path: '/reorder-requests',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reorder_requests',
      operation: 'create',
      description: 'Create a reorder request',
    },
    {
      method: 'PUT',
      path: '/reorder-requests/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reorder_requests',
      operation: 'update',
      description: 'Update reorder request status',
    },
    {
      method: 'DELETE',
      path: '/reorder-requests/:id',
      auth: true,
      role: 'admin',
      handler: 'crud',
      entity: 'reorder_requests',
      operation: 'delete',
      description: 'Cancel reorder request',
    },

    // Reports routes
    {
      method: 'GET',
      path: '/inventory/reports/summary',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'inventory',
      description: 'Get inventory summary report',
    },
    {
      method: 'GET',
      path: '/inventory/reports/valuation',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'inventory',
      description: 'Get inventory valuation report',
    },
    {
      method: 'GET',
      path: '/inventory/reports/turnover',
      auth: true,
      role: 'admin',
      handler: 'aggregate',
      entity: 'stock_movements',
      description: 'Get inventory turnover report',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION OPTIONS
  // ─────────────────────────────────────────────────────────────
  config: [
    {
      key: 'enableLowStockAlerts',
      label: 'Enable Low Stock Alerts',
      type: 'boolean',
      default: true,
      description: 'Send alerts when stock falls below minimum level',
    },
    {
      key: 'defaultMinimumStock',
      label: 'Default Minimum Stock Level',
      type: 'number',
      default: 10,
      description: 'Default minimum stock level for new products',
    },
    {
      key: 'trackStockMovements',
      label: 'Track Stock Movements',
      type: 'boolean',
      default: true,
      description: 'Record all stock ins, outs, and adjustments',
    },
    {
      key: 'enableAutoReorder',
      label: 'Enable Auto Reorder',
      type: 'boolean',
      default: false,
      description: 'Automatically create reorder requests for low stock items',
    },
    {
      key: 'reorderLeadDays',
      label: 'Reorder Lead Time (Days)',
      type: 'number',
      default: 7,
      description: 'Default lead time for reorder calculations',
    },
    {
      key: 'stockValuationMethod',
      label: 'Stock Valuation Method',
      type: 'select',
      default: 'fifo',
      options: [
        { value: 'fifo', label: 'FIFO (First In, First Out)' },
        { value: 'lifo', label: 'LIFO (Last In, First Out)' },
        { value: 'average', label: 'Weighted Average' },
      ],
      description: 'Method for calculating inventory value',
    },
  ],
};
