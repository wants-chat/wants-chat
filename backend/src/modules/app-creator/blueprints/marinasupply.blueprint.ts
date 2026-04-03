import { Blueprint } from './blueprint.interface';

/**
 * Marina Supply Blueprint
 */
export const marinasupplyBlueprint: Blueprint = {
  appType: 'marinasupply',
  description: 'Marina supply shop with products, orders, customers, and inventory management',

  coreEntities: ['product', 'category', 'customer', 'order', 'supplier', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Categories', path: '/categories', icon: 'LayoutGrid' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-grid', component: 'product-grid', entity: 'category', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/suppliers', name: 'Suppliers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'supplier-table', component: 'data-table', entity: 'supplier', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'product-catalog', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'specifications', type: 'json' },
        { name: 'compatible_boats', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'sale_price', type: 'decimal' },
        { name: 'cost', type: 'decimal' },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'reorder_level', type: 'integer' },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'supplier' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'parent_category', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'display_order', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'shipping_address', type: 'json' },
        { name: 'boat_info', type: 'json' },
        { name: 'tax_exempt', type: 'boolean' },
        { name: 'tax_id', type: 'string' },
        { name: 'customer_type', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'order_type', type: 'enum' },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'shipping_address', type: 'json' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'tracking_number', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    supplier: {
      defaultFields: [
        { name: 'supplier_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'website', type: 'string' },
        { name: 'categories', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'minimum_order', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
  },
};

export default marinasupplyBlueprint;
