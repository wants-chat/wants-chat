import { Blueprint } from './blueprint.interface';

/**
 * Inventory Management Blueprint
 *
 * Defines the structure for an inventory management application:
 * - Product/item tracking
 * - Stock management
 * - Suppliers
 * - Purchase orders
 * - Warehouses/locations
 */
export const inventoryBlueprint: Blueprint = {
  appType: 'inventory',
  description: 'Inventory management with products, stock, suppliers, and warehouses',

  coreEntities: ['product', 'category', 'supplier', 'warehouse', 'stock', 'purchase_order', 'stock_movement'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Products', path: '/products', icon: 'Package' },
              { label: 'Stock', path: '/stock', icon: 'Warehouse' },
              { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
              { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
              { label: 'Reports', path: '/reports', icon: 'BarChart' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['total_products', 'low_stock_items', 'pending_orders', 'total_value'],
          },
        },
        {
          id: 'low-stock',
          component: 'low-stock-alert',
          entity: 'stock',
          position: 'main',
          props: {
            title: 'Low Stock Alerts',
          },
        },
        {
          id: 'recent-movements',
          component: 'data-table',
          entity: 'stock_movement',
          position: 'main',
          props: {
            title: 'Recent Stock Movements',
            limit: 10,
            columns: ['product', 'type', 'quantity', 'warehouse', 'created_at'],
          },
        },
      ],
    },
    // Products
    {
      path: '/products',
      name: 'Products',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'products-table',
          component: 'data-table',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Products',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['sku', 'name', 'category', 'unit_price', 'total_stock', 'status'],
          },
        },
      ],
    },
    // Product Detail
    {
      path: '/products/:id',
      name: 'Product Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'product-detail',
          component: 'product-detail-card',
          entity: 'product',
          position: 'main',
        },
        {
          id: 'stock-levels',
          component: 'stock-by-warehouse',
          entity: 'stock',
          position: 'main',
          props: {
            title: 'Stock Levels by Warehouse',
          },
        },
        {
          id: 'movement-history',
          component: 'data-table',
          entity: 'stock_movement',
          position: 'main',
          props: {
            title: 'Movement History',
            columns: ['type', 'quantity', 'warehouse', 'reference', 'created_at'],
          },
        },
      ],
    },
    // Stock
    {
      path: '/stock',
      name: 'Stock',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'stock-table',
          component: 'data-table',
          entity: 'stock',
          position: 'main',
          props: {
            title: 'Stock Levels',
            columns: ['product', 'warehouse', 'quantity', 'reserved', 'available', 'status'],
          },
        },
      ],
    },
    // Stock Adjustment
    {
      path: '/stock/adjust',
      name: 'Stock Adjustment',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'adjustment-form',
          component: 'stock-adjustment-form',
          entity: 'stock_movement',
          position: 'main',
          props: {
            title: 'Stock Adjustment',
          },
        },
      ],
    },
    // Suppliers
    {
      path: '/suppliers',
      name: 'Suppliers',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'suppliers-table',
          component: 'data-table',
          entity: 'supplier',
          position: 'main',
          props: {
            title: 'Suppliers',
            showCreate: true,
            showEdit: true,
            columns: ['name', 'contact_name', 'email', 'phone', 'products_count', 'status'],
          },
        },
      ],
    },
    // Supplier Detail
    {
      path: '/suppliers/:id',
      name: 'Supplier Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'supplier-detail',
          component: 'detail-view',
          entity: 'supplier',
          position: 'main',
        },
        {
          id: 'supplier-products',
          component: 'data-table',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Products',
          },
        },
        {
          id: 'purchase-orders',
          component: 'data-table',
          entity: 'purchase_order',
          position: 'main',
          props: {
            title: 'Purchase Orders',
          },
        },
      ],
    },
    // Warehouses
    {
      path: '/warehouses',
      name: 'Warehouses',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'warehouses-table',
          component: 'data-table',
          entity: 'warehouse',
          position: 'main',
          props: {
            title: 'Warehouses',
            showCreate: true,
            showEdit: true,
            columns: ['name', 'location', 'capacity', 'utilization', 'status'],
          },
        },
      ],
    },
    // Purchase Orders
    {
      path: '/orders',
      name: 'Purchase Orders',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'orders-table',
          component: 'data-table',
          entity: 'purchase_order',
          position: 'main',
          props: {
            title: 'Purchase Orders',
            showCreate: true,
            columns: ['order_number', 'supplier', 'items_count', 'total', 'status', 'expected_date'],
          },
        },
      ],
    },
    // Purchase Order Detail
    {
      path: '/orders/:id',
      name: 'Order Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'order-detail',
          component: 'purchase-order-detail',
          entity: 'purchase_order',
          position: 'main',
        },
      ],
    },
    // Reports
    {
      path: '/reports',
      name: 'Reports',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'reports',
          component: 'report-list',
          position: 'main',
          props: {
            reports: ['stock_valuation', 'low_stock', 'movement_history', 'supplier_performance'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Products
    { method: 'GET', path: '/products', entity: 'product', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products/:id', entity: 'product', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/products/:id', entity: 'product', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/products/:id', entity: 'product', operation: 'delete', requiresAuth: true },

    // Categories
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/categories', entity: 'category', operation: 'create', requiresAuth: true },

    // Stock
    { method: 'GET', path: '/stock', entity: 'stock', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products/:id/stock', entity: 'stock', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/stock/adjust', entity: 'stock_movement', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/stock/transfer', entity: 'stock_movement', operation: 'create', requiresAuth: true },

    // Stock Movements
    { method: 'GET', path: '/stock-movements', entity: 'stock_movement', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products/:id/movements', entity: 'stock_movement', operation: 'list', requiresAuth: true },

    // Suppliers
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/suppliers/:id', entity: 'supplier', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/suppliers', entity: 'supplier', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/suppliers/:id', entity: 'supplier', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/suppliers/:id/products', entity: 'product', operation: 'list', requiresAuth: true },

    // Warehouses
    { method: 'GET', path: '/warehouses', entity: 'warehouse', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/warehouses', entity: 'warehouse', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/warehouses/:id', entity: 'warehouse', operation: 'update', requiresAuth: true },

    // Purchase Orders
    { method: 'GET', path: '/purchase-orders', entity: 'purchase_order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/purchase-orders/:id', entity: 'purchase_order', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/purchase-orders', entity: 'purchase_order', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/purchase-orders/:id', entity: 'purchase_order', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/purchase-orders/:id/receive', entity: 'purchase_order', operation: 'update', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'barcode', type: 'string' },
        { name: 'unit_price', type: 'decimal' },
        { name: 'cost_price', type: 'decimal' },
        { name: 'unit', type: 'string' },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'min_stock_level', type: 'integer' },
        { name: 'max_stock_level', type: 'integer' },
        { name: 'reorder_point', type: 'integer' },
        { name: 'reorder_quantity', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
        { name: 'tags', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'supplier' },
        { type: 'hasMany', target: 'stock' },
        { type: 'hasMany', target: 'stock_movement' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'parent_id', type: 'uuid' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    supplier: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'code', type: 'string' },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'website', type: 'url' },
        { name: 'payment_terms', type: 'string' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
        { type: 'hasMany', target: 'purchase_order' },
      ],
    },
    warehouse: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'code', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'contact_name', type: 'string' },
        { name: 'phone', type: 'phone' },
        { name: 'capacity', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'stock' },
      ],
    },
    stock: {
      defaultFields: [
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reserved_quantity', type: 'integer' },
        { name: 'available_quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'batch_number', type: 'string' },
        { name: 'expiry_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'warehouse' },
      ],
    },
    purchase_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'expected_date', type: 'date' },
        { name: 'received_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'supplier' },
        { type: 'belongsTo', target: 'warehouse' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    stock_movement: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reference', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'cost', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'warehouse' },
        { type: 'belongsTo', target: 'purchase_order' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default inventoryBlueprint;
